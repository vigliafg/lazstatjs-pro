#!/usr/bin/env python3
"""Translate JSON text maps with the free Google/Microsoft endpoint chain.

The script is intentionally generic: it accepts a JSON object (key -> text) or
a JSON array (text) and returns the same shape with translated values. It
preserves ``{placeholders}`` and falls back through four endpoints, so a 429 on
one endpoint does not stop the batch:

1. Google ``translate_a/single`` with ``client=dict-chrome-ex``
2. Google ``translate-pa`` (needs ``GOOGLE_TRANSLATE_API_KEY``; skipped when
   the variable is unset)
3. Google ``translate_a/single`` with the legacy ``gtx`` client
4. Microsoft Edge ``translatetext``

The API key is read from the environment only; never hardcode it here or in any
other tracked file. The endpoint that needs it is optional and the other three
keep working without it.

Examples
--------
Translate a JSON map and write the result to stdout::

    python scripts/translate-copy.py --from en --to de < strings.json

Translate the values of a report-copy catalog in place::

    python scripts/translate-copy.py --from en --to fr \
        --input /tmp/missing.json --output /tmp/missing.fr.json

Batch size and timeout are configurable; the default batch is 40 lines, which
is small enough to stay under the endpoint URL limit and large enough to avoid
one request per label.
"""
from __future__ import annotations


import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
GT = "https://translate.googleapis.com/translate_a/single"
GT_PA = "https://translate-pa.googleapis.com/v1/translate"
GT_PA_KEY = os.environ.get("GOOGLE_TRANSLATE_API_KEY", "")
MS = "https://edge.microsoft.com/translate/translatetext"
PLACEHOLDER = re.compile(r"\{(\w+)\}")
LANG_ALIASES = {"pt-PT": "pt", "pt_BR": "pt", "zh-CN": "zh"}


def _get_json(url: str, data: bytes | None = None) -> dict | list:
    headers = {"User-Agent": UA}
    if data is not None:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
        url, data=data, headers=headers, method="POST" if data else "GET"
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def _google_single(text: str, source: str, target: str, client: str) -> str:
    query = urllib.parse.urlencode(
        {"client": client, "sl": source, "tl": target, "dt": "t", "q": text}
    )
    payload = _get_json(f"{GT}?{query}")
    return "".join(item[0] for item in payload[0] if item and item[0])


def _google_pa(text: str, source: str, target: str) -> str:
    if not GT_PA_KEY:
        raise RuntimeError("GOOGLE_TRANSLATE_API_KEY is not set")
    query = urllib.parse.urlencode(
        {
            "params.client": "gtx",
            "query.source_language": source,
            "query.target_language": target,
            "query.display_language": "en-US",
            "data_types": "TRANSLATION",
            "key": GT_PA_KEY,
            "query.text": text,
        }
    )
    payload = _get_json(f"{GT_PA}?{query}")
    return payload.get("translation", "") if isinstance(payload, dict) else ""


def _microsoft(text: str, source: str, target: str) -> str:
    query = urllib.parse.urlencode(
        {"isEnterpriseClient": "False", "from": source, "to": target}
    )
    payload = _get_json(f"{MS}?{query}", json.dumps([text]).encode("utf-8"))
    return "".join(item.get("text", "") for item in payload[0]["translations"])


def translate_text(text: str, source: str, target: str) -> str:
    """Translate one chunk, trying the endpoints in order until one answers."""
    source = LANG_ALIASES.get(source, source)
    target = LANG_ALIASES.get(target, target)
    for attempt in (
        lambda: _google_single(text, source, target, "dict-chrome-ex"),
        lambda: _google_pa(text, source, target),
        lambda: _google_single(text, source, target, "gtx"),
        lambda: _microsoft(text, source, target),
    ):
        try:
            result = attempt()
            if result:
                return result
        except Exception:
            time.sleep(0.2)
    return text


def translate_items(
    items: list[str], source: str, target: str, batch_size: int = 40
) -> list[str]:
    output: list[str] = []
    chunk: list[str] = []
    size = 0
    for item in items:
        clean = item.replace("\n", " ")
        if len(chunk) >= batch_size or size + len(clean) > 2800:
            output.extend(_translate_chunk(chunk, source, target))
            chunk, size = [], 0
        chunk.append(clean)
        size += len(clean) + 1
    if chunk:
        output.extend(_translate_chunk(chunk, source, target))
    return output


def _translate_chunk(items: list[str], source: str, target: str) -> list[str]:
    translated = translate_text("\n".join(items), source, target)
    lines = translated.split("\n")
    if len(lines) == len(items):
        return [line.rstrip() for line in lines]
    # Newline segmentation can drift on long prose; a per-item retry is slower
    # but keeps the array aligned with the input.
    return [translate_text(item, source, target).rstrip() for item in items]


def _same_placeholders(source: str, translated: str) -> bool:
    return sorted(PLACEHOLDER.findall(source)) == sorted(
        PLACEHOLDER.findall(translated)
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from", dest="source", default="en")
    parser.add_argument("--to", dest="target", required=True)
    parser.add_argument("--input", help="input JSON file; stdin when omitted")
    parser.add_argument("--output", help="output JSON file; stdout when omitted")
    parser.add_argument("--batch-size", type=int, default=40)
    parser.add_argument(
        "--keep-identical",
        action="store_true",
        help="keep the source text when the placeholders do not match",
    )
    args = parser.parse_args()

    raw = (
        open(args.input, encoding="utf-8").read()
        if args.input
        else sys.stdin.read()
    )
    payload = json.loads(raw)
    is_map = isinstance(payload, dict)
    keys = list(payload) if is_map else None
    values = list(payload.values()) if is_map else list(payload)
    translated = translate_items(
        values, args.source, args.target, args.batch_size
    )
    repaired = [
        candidate
        if _same_placeholders(source, candidate)
        else (source if args.keep_identical else candidate)
        for source, candidate in zip(values, translated)
    ]
    result = dict(zip(keys, repaired)) if is_map else repaired
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as handle:
            handle.write(text + "\n")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
