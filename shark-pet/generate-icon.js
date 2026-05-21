const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(64, 64);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#5B8FA8';
ctx.beginPath();
ctx.ellipse(32, 32, 25, 15, 0, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = '#4A7D94';
ctx.beginPath();
ctx.moveTo(7, 25);
ctx.lineTo(32, 20);
ctx.lineTo(32, 35);
ctx.lineTo(7, 40);
ctx.closePath();
ctx.fill();

ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.arc(45, 28, 6, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = '#1A1A2E';
ctx.beginPath();
ctx.arc(47, 28, 3, 0, Math.PI * 2);
ctx.fill();

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(__dirname + '/assets/icon.png', buffer);
console.log('Icon generated!');
