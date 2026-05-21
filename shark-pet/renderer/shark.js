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

    this.drawShadow();
    this.drawTail();
    this.drawBody();
    this.drawBelly();
    this.drawGills();
    this.drawDorsalFin();
    this.drawSideFins();
    this.drawBlush();
    this.drawEyes(state === 'sleep');
    this.drawMouth(state === 'eat' ? Math.sin(animProgress * Math.PI * 3) * 0.5 + 0.5 : 0);
    this.drawParticles();

    ctx.restore();
  }

  drawShadow() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(0, 52, 55, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBody() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, -58, 0, 58);
    gradient.addColorStop(0, '#B8E4F0');
    gradient.addColorStop(0.5, '#A8D8EA');
    gradient.addColorStop(1, '#95C8DB');
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.bezierCurveTo(-60, -40, -40, -60, -20, -60);
    ctx.bezierCurveTo(10, -60, 40, -50, 50, -30);
    ctx.bezierCurveTo(60, -10, 60, 20, 45, 40);
    ctx.bezierCurveTo(30, 58, 0, 60, -30, 55);
    ctx.bezierCurveTo(-50, 50, -60, 30, -60, 0);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,190,210,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawBelly() {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(-2, 18, 30, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF8';
    ctx.fill();
  }

  drawGills() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(120,180,200,0.4)';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 0; i++) {
      ctx.beginPath();
      ctx.arc(-30, i * 6, 6, -0.5, 0.5);
      ctx.stroke();
    }
  }

  drawBlush() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,155,155,0.45)';
    ctx.beginPath();
    ctx.ellipse(12, 14, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(34, 14, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEyes(closed) {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(23, sign * 10);
      const bx = Math.sin(this.time * 2.5 + sign) * 1.5;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(bx, 0, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!closed) {
        const blink = Math.sin(this.time * 4 + sign);
        if (blink > 0.95) {
          ctx.fillStyle = '#B8E4F0';
          ctx.beginPath();
          ctx.ellipse(bx, 0, 16, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(100,150,170,0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bx, -11, 14, Math.PI, 0);
          ctx.stroke();

          ctx.fillStyle = '#3D2B1F';
          ctx.beginPath();
          ctx.ellipse(bx + 2, 2, 9, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(bx + 4, -3, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, 4, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx + 7, 0, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = '#3D2B1F';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(bx, -3, 9, 0.3 * Math.PI, 0.7 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawMouth(open) {
    const ctx = this.ctx;
    const mouthHeight = 3 + open * 9;

    ctx.save();
    ctx.translate(44, 6);

    if (open > 0.35) {
      ctx.fillStyle = '#FF8A80';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDorsalFin() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(-15, -52);
    ctx.rotate(Math.sin(this.time * 3) * 0.06);
    ctx.fillStyle = '#B5DEEE';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -22, 12, -20);
    ctx.quadraticCurveTo(10, -10, 6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawSideFins() {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(-24, sign * 40);
      ctx.rotate(sign * 0.7 + Math.sin(this.time * 4 + sign) * 0.15);
      ctx.fillStyle = '#B5DEEE';
      ctx.beginPath();
      ctx.ellipse(-7, 0, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawTail() {
    const ctx = this.ctx;
    let swing = Math.sin(this.time * 5) * 0.25;
    if (this.state === 'walk') swing *= 1.6;

    ctx.save();
    ctx.translate(-64, 0);
    ctx.rotate(swing);
    ctx.fillStyle = '#B5DEEE';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-12, -28, -26, -26);
    ctx.quadraticCurveTo(-14, -8, -6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(-12, 28, -26, 26);
    ctx.quadraticCurveTo(-14, 8, -6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  spawnBubble() {
    this.bubbles.push({
      x: 52 + Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      sz: 4 + Math.random() * 4,
      life: 1
    });
  }

  spawnHeart() {
    this.heartParticles.push({ life: 1 });
  }

  drawParticles() {
    const ctx = this.ctx;

    this.bubbles = this.bubbles.filter(b => b.life > 0);
    for (const bubble of this.bubbles) {
      ctx.save();
      ctx.translate(bubble.x, bubble.y - (1 - bubble.life) * 35);
      ctx.beginPath();
      ctx.arc(0, 0, bubble.sz * bubble.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${bubble.life * 0.5})`;
      ctx.fill();
      ctx.restore();
      bubble.life -= 0.006;
    }

    this.heartParticles = this.heartParticles.filter(h => h.life > 0);
    for (const heart of this.heartParticles) {
      ctx.save();
      ctx.translate(50, -30 - (1 - heart.life) * 45);
      ctx.fillStyle = `rgba(255,140,140,${heart.life})`;
      ctx.font = `${22 * heart.life}px Arial`;
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