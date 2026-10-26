import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width: number, height: number, r: number, g: number, b: number) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 2; // Truecolor (RGB)
  ihdr[10] = 0; // Compression (deflate)
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data: for each row, 1 filter byte (0) + width * 3 bytes (R, G, B)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Draw a warm gradient circle
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Gradient from amber-600 to rose-600
        const t = (x + y) / (width + height);
        const red = Math.round(217 * (1 - t) + 225 * t);
        const green = Math.round(119 * (1 - t) + 29 * t);
        const blue = Math.round(6 * (1 - t) + 72 * t);
        rawData[pixelOffset] = red;
        rawData[pixelOffset + 1] = green;
        rawData[pixelOffset + 2] = blue;
      } else {
        // Background warm stone
        rawData[pixelOffset] = 250;
        rawData[pixelOffset + 1] = 250;
        rawData[pixelOffset + 2] = 249;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type: string, data: Buffer) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table & calculation
const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNG icons
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 192, 217, 119, 6));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 512, 217, 119, 6));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 217, 119, 6));

// Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="#fafaf9" />
  <circle cx="256" cy="256" r="210" fill="url(#grad)" />
  <text x="256" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="200" font-weight="bold" fill="#ffffff" text-anchor="middle">M</text>
  <path d="M256 360 C256 360 210 330 190 300 C170 270 185 240 215 240 C235 240 250 255 256 265 C262 255 277 240 297 240 C327 240 342 270 322 300 C302 330 256 360 256 360 Z" fill="#ffffff" opacity="0.3"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');

console.log('Successfully generated public PWA icons.');
