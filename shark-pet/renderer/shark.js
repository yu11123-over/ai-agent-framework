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
    
    this.colors = {
      bodyTop: '#5B8FA8',
      bodyBottom: '#E8F0F2',
      fin: '#4A7D94',
      eyeWhite: '#FFFFFF',
      eyeDark: '#1A1A2E',
      mouth: '#FF6B6B',
      teeth: '#FFFFFF'
    };
  }

  draw(state, animProgress) {
    this.state = state;
    this.animProgress = animProgress;
    this.time += 0.016;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(100, 100);

    let scale = 1;
    let rotation = 0;
    let floatY = Math.sin(this.time * 2) * 3;

    if (this.isDragging) {
      scale = 1 + Math.abs(this.dragOffset.x) * 0.003 + 0.95;
    } else if (this.state === 'play') {
      rotation = this.animProgress * Math.PI * 4;
      scale = 1 + Math.sin(this.animProgress * Math.PI * 4) * 0.1;
    } else if (this.state === 'eat') {
      scale = 1 + Math.sin(this.animProgress * Math.PI * 3) * 0.1;
    }

    this.ctx.translate(0, floatY);
    this.ctx.scale(scale, 1);
    this.ctx.rotate(rotation);

    this.drawBody();
    this.drawFins();
    this.drawTail();
    this.drawFace();
    this.drawParticles();

    this.ctx.restore();
  }

  drawBody() {
    const ctx = this.ctx;
    const bodyWidth = 80;
    const bodyHeight = 50;

    const gradient = ctx.createLinearGradient(0, -bodyHeight / 2, 0, bodyHeight / 2);
    gradient.addColorStop(0, this.colors.bodyTop);
    gradient.addColorStop(1, this.colors.bodyBottom);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(i * 12, -8, 2, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();
      ctx.restore();
    }
  }

  drawFins() {
    const ctx = this.ctx;
    const time = this.time;

    ctx.fillStyle = this.colors.fin;

    ctx.save();
    ctx.translate(-10, -20);
    ctx.rotate(Math.sin(time * 3) * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(15, -25);
    ctx.lineTo(5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(-20, 15);
    ctx.rotate(Math.sin(time * 4 + 1) * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, 10);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(-20, -15);
    ctx.rotate(Math.sin(time * 4 + 2) * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -10);
    ctx.lineTo(-5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawTail() {
    const ctx = this.ctx;
    const time = this.time;
    const tailSwing = Math.sin(time * 5) * 0.3;

    if (this.state === 'walk') {
      tailSwing *= 1.5;
    }

    ctx.save();
    ctx.translate(-40, 0);
    ctx.rotate(tailSwing);

    ctx.fillStyle = this.colors.fin;

    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-25, -30);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(-25, 30);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawFace() {
    const ctx = this.ctx;
    const time = this.time;

    let mouthOpen = 0;
    if (this.state === 'eat') {
      mouthOpen = Math.sin(this.animProgress * Math.PI * 3) * 0.5 + 0.5;
    }

    let eyesClosed = this.state === 'sleep';

    ctx.save();
    ctx.translate(25, -8);

    ctx.fillStyle = this.colors.eyeWhite;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    if (!eyesClosed) {
      const blinkPhase = Math.sin(time * 3);
      if (blinkPhase > 0.95) {
        ctx.fillStyle = this.colors.bodyTop;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = this.colors.eyeDark;
        ctx.beginPath();
        ctx.arc(3, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colors.eyeWhite;
        ctx.beginPath();
        ctx.arc(5, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = this.colors.eyeDark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 8, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(25, 8);

    ctx.fillStyle = this.colors.eyeWhite;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    if (!eyesClosed) {
      const blinkPhase = Math.sin(time * 3 + 0.5);
      if (blinkPhase > 0.95) {
        ctx.fillStyle = this.colors.bodyTop;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = this.colors.eyeDark;
        ctx.beginPath();
        ctx.arc(3, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colors.eyeWhite;
        ctx.beginPath();
        ctx.arc(5, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = this.colors.eyeDark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 8, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(40, 0);

    const mouthHeight = 5 + mouthOpen * 10;

    ctx.fillStyle = this.colors.mouth;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, mouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    if (mouthOpen > 0.3) {
      ctx.fillStyle = this.colors.teeth;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 4 - 2, -mouthHeight * 0.8);
        ctx.lineTo(i * 4, -mouthHeight * 0.4);
        ctx.lineTo(i * 4 + 2, -mouthHeight * 0.8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(i * 4 - 2, mouthHeight * 0.8);
        ctx.lineTo(i * 4, mouthHeight * 0.4);
        ctx.lineTo(i * 4 + 2, mouthHeight * 0.8);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }

  spawnBubble() {
    this.bubbles.push({
      x: 45 + Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      size: 5 + Math.random() * 5,
      life: 1
    });
  }

  spawnHeart() {
    this.heartParticles.push({
      x: 50 + Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
      life: 1
    });
  }

  drawParticles() {
    const ctx = this.ctx;

    this.bubbles = this.bubbles.filter(b => b.life > 0);
    for (const bubble of this.bubbles) {
      ctx.save();
      ctx.translate(bubble.x, bubble.y - (1 - bubble.life) * 30);
      ctx.beginPath();
      ctx.arc(0, 0, bubble.size * bubble.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${bubble.life * 0.6})`;
      ctx.fill();
      ctx.restore();
      bubble.life -= 0.01;
    }

    this.heartParticles = this.heartParticles.filter(h => h.life > 0);
    for (const heart of this.heartParticles) {
      ctx.save();
      ctx.translate(heart.x, heart.y - (1 - heart.life) * 40);
      ctx.fillStyle = `rgba(255,107,107,${heart.life})`;
      ctx.font = `${16 * heart.life}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('❤️', 0, 0);
      ctx.restore();
      heart.life -= 0.015;
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
