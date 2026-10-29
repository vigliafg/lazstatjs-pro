/**
 * Decodifica dei file testuali importati.
 *
 * `File.text()` assume UTF-8: un CSV salvato da Excel in Windows-1252 o un
 * UTF-16 esportato da altri strumenti arriva come sequenza di caratteri di
 * sostituzione. Qui scegliamo il decoder in base al BOM e, in assenza di BOM,
 * proviamo UTF-8 in modo stretto e ripieghiamo su Windows-1252: il testo non
 * viene mai troncato e l'encoding effettivo viene restituito al chiamante.
 */

export const MAX_TEXT_IMPORT_BYTES = 25_000_000;

/** Rimuove un eventuale BOM già decodificato. */
export const stripBom = (text: string): string =>
  text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

const hasUtf16Pattern = (bytes: Uint8Array, offset: 0 | 1): boolean => {
  if (bytes.length < 4) return false;
  let zeros = 0;
  let inspected = 0;
  for (let index = offset; index < bytes.length; index += 2) {
    inspected += 1;
    if (bytes[index] === 0) zeros += 1;
  }
  return inspected > 0 && zeros / inspected > 0.6;
};

const decodeWith = (bytes: Uint8Array, encoding: string, offset = 0): string => {
  const view = offset > 0 ? bytes.subarray(offset) : bytes;
  return stripBom(new TextDecoder(encoding).decode(view));
};

/**
 * Decodifica bytes di un file testuale. Ordine:
 * UTF-8/UTF-16 con BOM, UTF-16 senza BOM riconosciuto dalla distribuzione
 * degli zeri, UTF-8 stretto, infine Windows-1252.
 */
export const decodeText = (bytes: Uint8Array): { text: string; encoding: string } => {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { text: decodeWith(bytes, 'utf-8', 3), encoding: 'utf-8' };
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { text: decodeWith(bytes, 'utf-16le', 2), encoding: 'utf-16le' };
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { text: decodeWith(bytes, 'utf-16be', 2), encoding: 'utf-16be' };
  }
  if (hasUtf16Pattern(bytes, 1) && !hasUtf16Pattern(bytes, 0)) {
    return { text: decodeWith(bytes, 'utf-16le'), encoding: 'utf-16le' };
  }
  if (hasUtf16Pattern(bytes, 0) && !hasUtf16Pattern(bytes, 1)) {
    return { text: decodeWith(bytes, 'utf-16be'), encoding: 'utf-16be' };
  }

  try {
    return {
      text: stripBom(new TextDecoder('utf-8', { fatal: true }).decode(bytes)),
      encoding: 'utf-8',
    };
  } catch {
    return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'windows-1252' };
  }
};

export const readFileText = async (file: File): Promise<{ text: string; encoding: string }> =>
  decodeText(new Uint8Array(await file.arrayBuffer()));
