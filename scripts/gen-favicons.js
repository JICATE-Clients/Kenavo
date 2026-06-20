/**
 * Regenerate the site icons from a single source logo.
 * Source is a wide rectangle, so each icon is the logo *contained* (not
 * stretched) on a square white canvas — white matches the logo's own
 * background, so the padding is invisible.
 *
 *   app/icon.png        256x256  — desktop tab + Android/Chrome
 *   app/apple-icon.png  180x180  — iOS home-screen touch icon
 *   app/favicon.ico     PNG-in-ICO (32 + 48) — legacy /favicon.ico
 *   public/favicon.ico  same, for any direct /favicon.ico request
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = process.argv[2] || 'C:/Users/Admin/Downloads/Rectangle.png';
const ROOT = path.resolve(__dirname, '..');
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** Logo contained on a square white canvas at the given size. */
function square(size) {
  // ensureAlpha keeps the PNG in RGBA — Next 16's ICO decoder rejects RGB.
  return sharp(SRC)
    .resize(size, size, { fit: 'contain', background: WHITE })
    .flatten({ background: WHITE })
    .ensureAlpha()
    .png()
    .toBuffer();
}

/** Wrap one or more square PNG buffers into an ICO container. */
function buildIco(entries) {
  // entries: [{ size, png }]
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const blobs = [];
  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0); // width (0 == 256)
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1); // height
    dir.writeUInt8(0, b + 2);  // colors
    dir.writeUInt8(0, b + 3);  // reserved
    dir.writeUInt16LE(1, b + 4);  // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(e.png.length, b + 8);  // size of image data
    dir.writeUInt32LE(offset, b + 12);       // offset of image data
    offset += e.png.length;
    blobs.push(e.png);
  });

  return Buffer.concat([header, dir, ...blobs]);
}

(async () => {
  const icon256 = await square(256);
  const apple180 = await square(180);
  const ico32 = await square(32);
  const ico48 = await square(48);
  const ico = buildIco([
    { size: 32, png: ico32 },
    { size: 48, png: ico48 },
  ]);

  fs.writeFileSync(path.join(ROOT, 'app/icon.png'), icon256);
  fs.writeFileSync(path.join(ROOT, 'app/apple-icon.png'), apple180);
  fs.writeFileSync(path.join(ROOT, 'app/favicon.ico'), ico);
  fs.writeFileSync(path.join(ROOT, 'public/favicon.ico'), ico);

  console.log('Wrote app/icon.png (256), app/apple-icon.png (180), app/favicon.ico + public/favicon.ico');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
