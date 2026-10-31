/**
 * Generate the application icon without external image dependencies.
 * Run with `node scripts/generate-icon.mjs`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const SIZE = 1024;
const pixels = Buffer.alloc(SIZE * SIZE * 4);

const set = (x, y, color) => {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const offset = (y * SIZE + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3] ?? 255;
};

const rect = (x0, y0, width, height, color) => {
  for (let y = y0; y < y0 + height; y += 1) {
    for (let x = x0; x < x0 + width; x += 1) set(x, y, color);
  }
};

const background = [13, 15, 20, 255];
const barColors = [
  [79, 156, 249, 255],
  [52, 211, 153, 255],
  [251, 191, 36, 255],
  [167, 139, 250, 255],
];
const bars = [
  { x: 196, height: 320 },
  { x: 356, height: 500 },
  { x: 516, height: 410 },
  { x: 676, height: 590 },
];

rect(0, 0, SIZE, SIZE, background);
// Subtle inner frame.
rect(64, 64, SIZE - 128, 12, [45, 55, 72, 255]);
rect(64, SIZE - 76, SIZE - 128, 12, [45, 55, 72, 255]);

bars.forEach((bar, index) => {
  rect(bar.x, 812 - bar.height, 132, bar.height, barColors[index]);
  rect(bar.x, 812, 132, 10, [226, 232, 240, 255]);
});

// A rising trend line above the bars.
const points = [
  [220, 700],
  [360, 610],
  [500, 640],
  [640, 500],
  [780, 390],
];
for (let index = 1; index < points.length; index += 1) {
  const [x0, y0] = points[index - 1];
  const [x1, y1] = points[index];
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let step = 0; step <= steps; step += 1) {
    const x = Math.round(x0 + ((x1 - x0) * step) / steps);
    const y = Math.round(y0 + ((y1 - y0) * step) / steps);
    rect(x - 5, y - 5, 10, 10, [226, 232, 240, 255]);
  }
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
const crc32 = buffer => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
for (let y = 0; y < SIZE; y += 1) {
  raw[y * (SIZE * 4 + 1)] = 0;
  pixels.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const resources = join(process.cwd(), 'resources');
mkdirSync(resources, { recursive: true });
writeFileSync(join(resources, 'icon.png'), png);
console.log(`Wrote ${join(resources, 'icon.png')} (${png.length} bytes)`);
