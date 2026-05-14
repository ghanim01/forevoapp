/**
 * Generates PNG favicons from the SVG logo using native Node.js modules.
 * Creates a minimal valid PNG with the Forevo mark rendered as pixels.
 *
 * Usage: node scripts/generate-favicons.mjs
 *
 * For a production-ready approach, replace this with:
 *   - A proper SVG-to-PNG pipeline (sharp, squoosh, or a build step)
 *   - Or use a tool like https://realfavicongenerator.net/
 */

import { writeFileSync } from "fs";
import { deflateSync } from "zlib";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");

// ============================================================
// Minimal PNG generator — creates a valid PNG from RGBA pixels
// ============================================================

function createPNG(width, height, pixels) {
  // pixels: Uint8Array of RGBA bytes (width * height * 4)

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, "ascii");
    const crcData = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeB, data, crc]);
  }

  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT — raw pixel data with filter byte (0 = None) per scanline
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * (1 + width * 4) + 1 + x * 4;
      raw[di] = pixels[si]; // R
      raw[di + 1] = pixels[si + 1]; // G
      raw[di + 2] = pixels[si + 2]; // B
      raw[di + 3] = pixels[si + 3]; // A
    }
  }

  const compressed = deflateSync(raw);
  const idat = chunk("IDAT", compressed);
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, chunk("IHDR", ihdr), idat, iend]);
}

// ============================================================
// Render the Forevo icon mark as pixels
// ============================================================

function renderForevoMark(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45; // icon radius

  const cyan = [8 / 255, 145 / 255, 178 / 255]; // #0891B2
  const purple = [107 / 255, 33 / 255, 168 / 255]; // #6B21A8
  const bg = [7 / 255, 9 / 255, 26 / 255]; // #07091A

  function lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const idx = (py * size + px) * 4;
      const nx = (px - cx) / (r);
      const ny = (py - cy) / (r);

      // Background rounded rect
      const bx = Math.abs(px - cx) / (r * 0.85);
      const by = Math.abs(py - cy) / (r * 0.95);
      const corner = 0.35;
      const dist = Math.max(bx, by);
      const rounded = Math.sqrt(Math.max(0, bx - corner) ** 2 + Math.max(0, by - corner) ** 2) + Math.min(
        corner,
        Math.min(bx, by)
      );
      const inBg = rounded < 1.0;

      // Gradient color based on position
      const t = (px / size) * 0.6 + (py / size) * 0.4;
      const grad = lerp(cyan, purple, t);

      if (!inBg) {
        // Transparent outside
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Background fill — very dark with slight tint
      pixels[idx] = 7;
      pixels[idx + 1] = 9;
      pixels[idx + 2] = 26;
      pixels[idx + 3] = Math.round(255 * (1 - smoothstep(0.85, 1.0, rounded)));

      // Draw the "F" mark as thick lines
      const lw = size * 0.07; // line width
      const m = size * 0.22; // margins

      // Vertical stem
      const vDist = Math.abs(px - (m + lw / 2));
      if (vDist < lw && py > m && py < size - m) {
        const bright = 1 - Math.min(vDist / lw, 1);
        const c = lerp(grad, [1, 1, 1], bright * 0.3);
        pixels[idx] = Math.round(c[0] * 255);
        pixels[idx + 1] = Math.round(c[1] * 255);
        pixels[idx + 2] = Math.round(c[2] * 255);
        pixels[idx + 3] = 255;
        continue;
      }

      // Top horizontal bar
      const hDist1 = Math.abs(py - (m + lw / 2));
      if (hDist1 < lw && px > m && px < m + size * 0.5) {
        const bright = 1 - Math.min(hDist1 / lw, 1);
        const c = lerp(grad, [1, 1, 1], bright * 0.3);
        pixels[idx] = Math.round(c[0] * 255);
        pixels[idx + 1] = Math.round(c[1] * 255);
        pixels[idx + 2] = Math.round(c[2] * 255);
        pixels[idx + 3] = 255;
        continue;
      }

      // Middle horizontal bar
      const hDist2 = Math.abs(py - cy);
      if (hDist2 < lw && px > m && px < m + size * 0.4) {
        const bright = 1 - Math.min(hDist2 / lw, 1);
        const c = lerp(grad, [1, 1, 1], bright * 0.3);
        pixels[idx] = Math.round(c[0] * 255);
        pixels[idx + 1] = Math.round(c[1] * 255);
        pixels[idx + 2] = Math.round(c[2] * 255);
        pixels[idx + 3] = 255;
        continue;
      }

      // Accent dot
      const dotCx = m + size * 0.44;
      const dotCy = m + size * 0.16;
      const dotR = size * 0.035;
      const dDist = Math.sqrt((px - dotCx) ** 2 + (py - dotCy) ** 2);
      if (dDist < dotR) {
        const bright = 1 - smoothstep(0, dotR, dDist);
        const c = lerp(cyan, [1, 1, 1], bright * 0.4);
        pixels[idx] = Math.round(c[0] * 255);
        pixels[idx + 1] = Math.round(c[1] * 255);
        pixels[idx + 2] = Math.round(c[2] * 255);
        pixels[idx + 3] = 255;
        continue;
      }

      // Border
      const borderDist = Math.abs(rounded - 1.0);
      if (borderDist < 0.03 && inBg) {
        const c = lerp(grad, [1, 1, 1], 0.25);
        const alpha = Math.round(255 * (1 - borderDist / 0.03));
        pixels[idx] = Math.round(c[0] * alpha);
        pixels[idx + 1] = Math.round(c[1] * alpha);
        pixels[idx + 2] = Math.round(c[2] * alpha);
        pixels[idx + 3] = Math.min(255, pixels[idx + 3] + alpha);
      }

      // Slightly brighten inner area near lines
      if (inBg && pixels[idx + 3] < 10) {
        pixels[idx] = 10;
        pixels[idx + 1] = 12;
        pixels[idx + 2] = 30;
        pixels[idx + 3] = 30;
      }
    }
  }
  return pixels;
}

// ============================================================
// Generate and write favicon PNGs
// ============================================================

const sizes = [32, 180]; // favicon + apple-touch-icon

for (const size of sizes) {
  console.log(`Rendering ${size}x${size} favicon...`);
  const pixels = renderForevoMark(size);
  const png = createPNG(size, size, pixels);
  const filename = size === 32 ? "favicon.png" : "apple-touch-icon.png";
  writeFileSync(resolve(PUBLIC, filename), png);
  console.log(`  ✓ ${filename} (${(png.length / 1024).toFixed(1)} KB)`);
}

console.log("\nDone! Generated favicons in public/");
