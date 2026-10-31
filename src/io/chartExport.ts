/** Rasterise rendered Vega-Lite SVG charts to downloadable PNGs. */

import { downloadBlob, saveBytes, saveFilesInFolder } from './writers';
import { awaitChartsReady } from './chartReady';
import { desktopBridge } from '../platform/desktop';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FALLBACK_BACKGROUND = '#0d0f14';
const PADDING = 12;
const SCALE = 2;
const MIN_SIZE = 40;

export interface ChartExportResult {
  exported: number;
  failed: number;
  pending: number;
}

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not rasterise the chart'));
    image.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

const svgSize = (svg: SVGSVGElement): { width: number; height: number } => {
  const rect = svg.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return { width: rect.width, height: rect.height };
  const width = parseFloat(svg.getAttribute('width') ?? '');
  const height = parseFloat(svg.getAttribute('height') ?? '');
  return { width: Number.isFinite(width) ? width : 0, height: Number.isFinite(height) ? height : 0 };
};

const renderPng = async (svg: SVGSVGElement, background: string): Promise<Blob> => {
  const { width, height } = svgSize(svg);
  if (width < MIN_SIZE || height < MIN_SIZE) throw new Error('Chart has no drawable area');

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  // Inherited fonts are not part of the serialised markup, so pin them.
  const family = getComputedStyle(svg).fontFamily;
  if (family) clone.style.fontFamily = family;

  const markup = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil((width + PADDING * 2) * SCALE);
    canvas.height = Math.ceil((height + PADDING * 2) * SCALE);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not available');
    ctx.fillStyle = background || FALLBACK_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(SCALE, SCALE);
    ctx.drawImage(image, PADDING, PADDING, width, height);
    const blob = await canvasToBlob(canvas);
    if (!blob) throw new Error('PNG encoding failed');
    return blob;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};

/**
 * Export every rendered chart inside `root` as a separate PNG.
 * Charts are drawn sequentially so large reports do not spike memory.
 */
export const exportChartsAsPng = async (
  root: ParentNode,
  baseName = 'lazstats-chart'
): Promise<ChartExportResult> => {
  const ready = await awaitChartsReady(root);
  const charts = Array.from(root.querySelectorAll<SVGSVGElement>('[data-chart-surface] svg')).filter(
    (svg) => {
      if (svg.closest('[data-no-export]')) return false;
      const { width, height } = svgSize(svg);
      return width >= MIN_SIZE && height >= MIN_SIZE;
    }
  );

  const rendered: { name: string; bytes: Uint8Array }[] = [];
  let failed = ready.failed;
  for (let i = 0; i < charts.length; i += 1) {
    try {
      const surface = charts[i].closest('[data-chart-surface]');
      const background = surface?.getAttribute('data-chart-background') ?? FALLBACK_BACKGROUND;
      const blob = await renderPng(charts[i], background);
      const suffix = charts.length > 1 ? `-${i + 1}` : '';
      rendered.push({
        name: `${baseName}${suffix}.png`,
        bytes: new Uint8Array(await blob.arrayBuffer()),
      });
    } catch {
      failed += 1;
    }
    // Let the renderer breathe between charts.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  if (rendered.length === 0) return { exported: 0, failed, pending: ready.pending };

  if (desktopBridge()) {
    if (rendered.length === 1) {
      const result = await saveBytes(rendered[0].bytes, rendered[0].name, 'image/png');
      return { exported: result.canceled ? 0 : 1, failed, pending: ready.pending };
    }
    const result = await saveFilesInFolder(rendered, 'LazStats charts');
    return {
      exported: result?.canceled === false ? result.saved : 0,
      failed,
      pending: ready.pending,
    };
  }

  for (const file of rendered) {
    downloadBlob(new Blob([file.bytes], { type: 'image/png' }), file.name);
    // Give the download manager a tick between files.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { exported: rendered.length, failed, pending: ready.pending };
};
