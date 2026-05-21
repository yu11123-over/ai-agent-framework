const fs = require('fs');
const zlib = require('zlib');

const width = 32;
const height = 32;
const bpp = 4;

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const header = Buffer.concat([lenBuf, typeBuf, data]);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([header, crcBuf]);
}

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData.writeUInt8(8, 8);
ihdrData.writeUInt8(6, 9);
ihdrData.writeUInt8(0, 10);
ihdrData.writeUInt8(0, 11);
ihdrData.writeUInt8(0, 12);

const pixels = Buffer.alloc(width * height * bpp);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * bpp;
    const cx = x - 16;
    const cy = y - 16;
    const dist = Math.sqrt(cx * cx + (cy * 1.5) * (cy * 1.5));

    if (cx > -12 && cx < 12 && cy > -8 && cy < 8 && dist < 16) {
      const gradient = (cy + 8) / 16;
      pixels[i] = Math.round(91 + (232 - 91) * gradient);
      pixels[i + 1] = Math.round(143 + (240 - 143) * gradient);
      pixels[i + 2] = Math.round(168 + (242 - 168) * gradient);
      pixels[i + 3] = 255;
    } else if (cx < -10 && cx > -18 && cy > -12 && cy < 12) {
      pixels[i] = 74;
      pixels[i + 1] = 125;
      pixels[i + 2] = 148;
      pixels[i + 3] = 255;
    } else {
      pixels[i + 3] = 0;
    }
  }
}

const eyeX = width / 2 + 12;
const eyeY = height / 2 - 4;
for (let y = Math.round(eyeY - 4); y <= Math.round(eyeY + 4); y++) {
  for (let x = Math.round(eyeX - 4); x <= Math.round(eyeX + 4); x++) {
    const dx = x - eyeX, dy = y - eyeY;
    if (dx * dx + dy * dy <= 16) {
      const i = (y * width + x) * bpp;
      pixels[i] = 26;
      pixels[i + 1] = 26;
      pixels[i + 2] = 46;
      pixels[i + 3] = 255;
    }
  }
}

const rawData = Buffer.alloc(height * (1 + width * bpp));
for (let y = 0; y < height; y++) {
  rawData[y * (1 + width * bpp)] = 0;
  for (let x = 0; x < width; x++) {
    const src = (y * width + x) * bpp;
    const dst = y * (1 + width * bpp) + 1 + x * bpp;
    rawData[dst] = pixels[src];
    rawData[dst + 1] = pixels[src + 1];
    rawData[dst + 2] = pixels[src + 2];
    rawData[dst + 3] = pixels[src + 3];
  }
}

const compressed = zlib.deflateSync(rawData);

const ihdrChunk = makeChunk('IHDR', ihdrData);
const idatChunk = makeChunk('IDAT', compressed);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
fs.writeFileSync(__dirname + '/assets/icon.png', png);
console.log('Icon generated at assets/icon.png');