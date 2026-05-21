const fs = require('fs');
const path = require('path');

const size = 64;
const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = createChunk('IHDR', Buffer.from([
  (size >> 24) & 255, (size >> 16) & 255, (size >> 8) & 255, size & 255,
  (size >> 24) & 255, (size >> 16) & 255, (size >> 8) & 255, size & 255,
  8, 6, 0, 0, 0
]));

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crc = crc32(Buffer.concat([typeB, data]));
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc >>> 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return ~crc;
}

const rawData = [];
for (let y = 0; y < size; y++) {
  rawData.push(0);
  for (let x = 0; x < size; x++) {
    const dx = x - 32, dy = y - 32;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 26) {
      rawData.push(168, 216, 234, 255);
    } else {
      rawData.push(0, 0, 0, 0);
    }
  }
}

const zlib = require('zlib');
const compressed = zlib.deflateSync(Buffer.from(rawData));
const idat = createChunk('IDAT', compressed);
const iend = createChunk('IEND', Buffer.alloc(0));

const png = Buffer.concat([header, ihdr, idat, iend]);
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), png);
console.log('Icon created at assets/icon.png');