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
    ctx.translate(100, 170);

    let scale = 1;
    let rotation = 0;
    const floatY = Math.sin(this.time * 1.8) * 4;

    if (this.isDragging) {
      scale = 1 + Math.abs(this.dragOffset.x) * 0.002;
    } else if (state === 'play') {
      rotation = animProgress * Math.PI * 4;
      scale = 1 + Math.sin(animProgress * Math.PI * 4) * 0.1;
    } else if (state === 'eat') {
      scale = 1 + Math.sin(animProgress * Math.PI * 3) * 0.06;
    }

    ctx.translate(0, floatY);
    ctx.scale(scale, 1);
    ctx.rotate(rotation);

    this.drawShadow();
    this.drawTail();
    this.drawLegs();
    this.drawBody();
    this.drawArms();
    this.drawDorsalFin();
    this.drawHead();
    this.drawEyes(state === 'sleep');
    this.drawMouth(state === 'eat' ? Math.sin(animProgress * Math.PI * 3) * 0.5 + 0.5 : 0);
    this.drawParticles();

    ctx.restore();
  }

  drawShadow() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(0, 116, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHead() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, -80, 0, 10);
    gradient.addColorStop(0, '#B8E4F0');
    gradient.addColorStop(0.5, '#A8D8EA');
    gradient.addColorStop(1, '#9FCFE3');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, -36, 48, 44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,190,210,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,155,155,0.4)';
    ctx.beginPath();
    ctx.ellipse(10, -24, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(34, -24, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(50, -30, 16, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEyes(closed) {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(22, sign * 10 - 32);
      const bx = Math.sin(this.time * 2.5 + sign) * 1.5;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(bx, 0, 16, 19, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!closed) {
        const blink = Math.sin(this.time * 4 + sign);
        if (blink > 0.95) {
          ctx.fillStyle = '#B8E4F0';
          ctx.beginPath();
          ctx.ellipse(bx, 0, 16, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(100,150,170,0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bx, -12, 14, Math.PI, 0);
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
          ctx.arc(bx, 5, 2, 0, Math.PI * 2);
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
    ctx.translate(52, -28);

    if (open > 0.35) {
      ctx.fillStyle = '#FF8A80';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      for (let i = -1; i <= 1; i++) {
        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(i * 3 - 1.5, sign * mouthHeight * 0.7);
          ctx.lineTo(i * 3, sign * mouthHeight * 0.3);
          ctx.lineTo(i * 3 + 1.5, sign * mouthHeight * 0.7);
          ctx.closePath();
          ctx.fill();
        }
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
    ctx.translate(-5, -8);
    ctx.rotate(Math.sin(this.time * 3) * 0.05);
    ctx.fillStyle = '#A8DFF0';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, -18, 14, -16);
    ctx.quadraticCurveTo(8, -8, 4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawBody() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 10, 0, 90);
    gradient.addColorStop(0, '#B8E4F0');
    gradient.addColorStop(0.5, '#A8DFF0');
    gradient.addColorStop(1, '#95C8DB');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 50, 28, 36, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.ellipse(-2, 54, 16, 20, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  drawArms() {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(sign * 30, 44);

      if (this.state === 'walk') {
        ctx.rotate(sign * -0.3 + Math.sin(this.time * 8 + sign) * 0.2);
      } else if (this.state === 'play') {
        ctx.rotate(sign * -0.6 + this.animProgress * 2);
      }

      ctx.fillStyle = '#A8DFF0';
      ctx.beginPath();
      ctx.ellipse(sign * 4, -4, 8, 14, -sign * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#85B8CC';
      ctx.beginPath();
      ctx.arc(sign * 10, -18, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawLegs() {
    const ctx = this.ctx;
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(sign * 14, 86);

      if (this.state === 'walk') {
        ctx.rotate(sign * Math.sin(this.time * 8) * 0.15);
      }

      ctx.fillStyle = '#95C8DB';
      ctx.beginPath();
      ctx.ellipse(0, 10, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#85B8CC';
      ctx.beginPath();
      ctx.ellipse(sign * 3, 24, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawTail() {
    const ctx = this.ctx;
    let swing = Math.sin(this.time * 5) * 0.2;
    if (this.state === 'walk') swing *= 1.4;

    ctx.save();
    ctx.translate(-10, 52);
    ctx.rotate(swing);
    ctx.fillStyle = '#A8DFF0';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(-10, -26, -22, -24);
    ctx.quadraticCurveTo(-12, -6, -4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(-10, 26, -22, 24);
    ctx.quadraticCurveTo(-12, 6, -4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  spawnBubble() {
    this.bubbles.push({
      x: 56 + Math.random() * 10 - 5,
      y: -32 + Math.random() * 10 - 5,
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
      ctx.translate(50, -60 - (1 - heart.life) * 45);
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