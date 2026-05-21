export class SharkRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'idle';
    this.animProgress = 0;
    this.time = 0;
    this.bubbles = [];
    this.heartParticles = [];
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
  }

  draw(state, animProgress) {
    this.state = state;
    this.animProgress = animProgress;
    this.time += 0.016;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(100, 100);

    let scale = 1;
    let rotation = 0;
    const floatY = Math.sin(this.time * 1.8) * 5;

    if (this.isDragging) {
      scale = 1 + Math.abs(this.dragOffset.x) * 0.002;
    } else if (state === 'play') {
      rotation = animProgress * Math.PI * 4;
      scale = 1 + Math.sin(animProgress * Math.PI * 4) * 0.1;
    } else if (state === 'eat') {
      scale = 1 + Math.sin(animProgress * Math.PI * 3) * 0.08;
    }

    ctx.translate(0, floatY);
    ctx.scale(scale, 1);
    ctx.rotate(rotation);

    this.drawBody();
    this.drawBelly();
    this.drawSideFins();
    this.drawDorsalFin();
    this.drawTail();
    this.drawBlush();
    this.drawEyes(state === 'sleep');
    this.drawMouth(state === 'eat' ? Math.sin(animProgress * Math.PI * 3) * 0.5 + 0.5 : 0);
    this.drawParticles();

    ctx.restore();
  }

  drawBody() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, -55, 0, 55);
    gradient.addColorStop(0, '#A8D8EA');
    gradient.addColorStop(1, '#9FCFE3');
    ctx.beginPath();
    ctx.ellipse(0, 0, 65, 50, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  drawBelly() {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(-6, 12, 35, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF8F0';
    ctx.fill();
  }

  drawBlush() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,150,150,0.5)';
    ctx.beginPath();
    ctx.ellipse(16, 18, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(36, 18, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEyes(closed) {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(26, sign * 12);
      const bx = Math.sin(this.time * 2.5 + sign) * 1.5;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(bx, 0, 14, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!closed) {
        const blink = Math.sin(this.time * 4 + sign);
        if (blink > 0.95) {
          ctx.fillStyle = '#A8D8EA';
          ctx.beginPath();
          ctx.ellipse(bx, 0, 14, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#2C1810';
          ctx.beginPath();
          ctx.ellipse(bx + 2, 2, 8, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(bx + 4, -2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx + 1, 3, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 8, 0);
        ctx.lineTo(bx + 8, 0);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawMouth(open) {
    const ctx = this.ctx;
    const mouthHeight = 3 + open * 9;

    ctx.save();
    ctx.translate(46, 8);
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, mouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    if (open > 0.35) {
      ctx.fillStyle = '#FFFFFF';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 3 - 1.5, -mouthHeight * 0.7);
        ctx.lineTo(i * 3, -mouthHeight * 0.3);
        ctx.lineTo(i * 3 + 1.5, -mouthHeight * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(i * 3 - 1.5, mouthHeight * 0.7);
        ctx.lineTo(i * 3, mouthHeight * 0.3);
        ctx.lineTo(i * 3 + 1.5, mouthHeight * 0.7);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#E07060';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -1, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDorsalFin() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(-30, -45);
    ctx.rotate(Math.sin(this.time * 3) * 0.08);
    ctx.fillStyle = '#8FC9DD';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, -28);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.ellipse(5, -14, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSideFins() {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(-25, sign * 38);
      ctx.rotate(sign * 0.7 + Math.sin(this.time * 4 + sign) * 0.2);
      ctx.fillStyle = '#8FC9DD';
      ctx.beginPath();
      ctx.ellipse(-8, 0, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawTail() {
    const ctx = this.ctx;
    let swing = Math.sin(this.time * 5) * 0.25;
    if (this.state === 'walk') swing *= 1.6;

    ctx.save();
    ctx.translate(-62, 0);
    ctx.rotate(swing);
    ctx.fillStyle = '#8FC9DD';

    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-15, -28, -28, -26);
    ctx.quadraticCurveTo(-15, -10, -8, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(-15, 28, -28, 26);
    ctx.quadraticCurveTo(-15, 10, -8, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  spawnBubble() {
    this.bubbles.push({
      x: 50 + Math.random() * 12 - 6,
      y: Math.random() * 12 - 6,
      sz: 4 + Math.random() * 4,
      life: 1
    });
  }

  spawnHeart() {
    this.heartParticles.push({
      x: 40,
      y: -20,
      life: 1
    });
  }

  drawParticles() {
    const ctx = this.ctx;

    this.bubbles = this.bubbles.filter(b => b.life > 0);
    for (const bubble of this.bubbles) {
      ctx.save();
      ctx.translate(bubble.x, bubble.y - (1 - bubble.life) * 35);
      ctx.beginPath();
      ctx.arc(0, 0, bubble.sz * bubble.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${bubble.life * 0.45})`;
      ctx.fill();
      ctx.restore();
      bubble.life -= 0.006;
    }

    this.heartParticles = this.heartParticles.filter(h => h.life > 0);
    for (const heart of this.heartParticles) {
      ctx.save();
      ctx.translate(heart.x, heart.y - (1 - heart.life) * 45);
      ctx.fillStyle = `rgba(255,140,140,${heart.life})`;
      ctx.font = `${20 * heart.life}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('❤️', 0, 0);
      ctx.restore();
      heart.life -= 0.012;
    }
  }

  startDrag(x, y) {
    this.isDragging = true;
    this.dragOffset = { x: 0, y: 0 };
  }

  updateDrag(x, y, prevX, prevY) {
    this.dragOffset.x = x - prevX;
  }

  endDrag() {
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
  }
}