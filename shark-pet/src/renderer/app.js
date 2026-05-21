class PetRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.state = 'idle';
    this.animProgress = 0;
    this.bubbles = [];
    this.hearts = [];
    this.sparkles = [];
  }

  draw(state, animProgress) {
    this.state = state;
    this.animProgress = animProgress;
    this.time += 0.016;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(100, 150);

    let scale = 1, rotation = 0;
    const floatY = Math.sin(this.time * 1.6) * 5;
    
    if (state === 'play') {
      rotation = animProgress * Math.PI * 4;
      scale = 1 + Math.sin(animProgress * Math.PI * 4) * 0.12;
    } else if (state === 'eat') {
      scale = 1 + Math.sin(animProgress * Math.PI * 3) * 0.08;
    }

    ctx.translate(0, floatY);
    ctx.scale(scale, 1);
    ctx.rotate(rotation);

    this.drawShadow();
    this.drawTail();
    this.drawBody();
    this.drawFins();
    this.drawFace(state === 'sleep');
    this.drawParticles();

    ctx.restore();
  }

  drawShadow() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.08)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 65, 55, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawBody() {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(0, -25, 10, 0, -15, 75);
    gradient.addColorStop(0, '#C5E7F2');
    gradient.addColorStop(0.4, '#A8D8EA');
    gradient.addColorStop(0.7, '#95C8DB');
    gradient.addColorStop(1, '#85B8CC');

    ctx.beginPath();
    ctx.moveTo(-60, -15);
    ctx.bezierCurveTo(-65, -45, -45, -75, -15, -80);
    ctx.bezierCurveTo(25, -83, 45, -70, 60, -45);
    ctx.bezierCurveTo(70, -20, 65, 10, 50, 35);
    ctx.bezierCurveTo(30, 60, -5, 65, -30, 60);
    ctx.bezierCurveTo(-55, 50, -65, 25, -60, -15);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(100,170,190,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.ellipse(0, 10, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(120,180,200,0.3)';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 0; i++) {
      ctx.beginPath();
      ctx.arc(-35, i * 7, 7, -0.6, 0.6);
      ctx.stroke();
    }
  }

  drawTail() {
    const ctx = this.ctx;
    let swing = Math.sin(this.time * 4) * 0.22;
    if (this.state === 'walk') swing *= 1.5;

    ctx.save();
    ctx.translate(-65, 5);
    ctx.rotate(swing);
    ctx.fillStyle = '#9ED7E8';

    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.quadraticCurveTo(-10, -28, -25, -26);
    ctx.quadraticCurveTo(-12, -6, -5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.quadraticCurveTo(-10, 28, -25, 26);
    ctx.quadraticCurveTo(-12, 6, -5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawFins() {
    const ctx = this.ctx;
    ctx.fillStyle = '#9ED7E8';

    ctx.save();
    ctx.translate(-18, -58);
    ctx.rotate(Math.sin(this.time * 3) * 0.05);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, -25, 15, -22);
    ctx.quadraticCurveTo(10, -10, 5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(-22, sign * 35);
      ctx.rotate(sign * 0.5 + Math.sin(this.time * 4 + sign) * 0.15);
      ctx.beginPath();
      ctx.ellipse(-7, 0, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawFace(sleeping) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(255,165,165,0.45)';
    ctx.beginPath();
    ctx.ellipse(3, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(35, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.translate(20, sign * 15 - 32);
      const bx = Math.sin(this.time * 2 + sign * 0.5) * 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(bx, 0, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(100,150,170,0.25)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bx, -14, 16, Math.PI, 0);
      ctx.stroke();

      if (!sleeping) {
        const blink = Math.sin(this.time * 3 + sign * 0.5);
        if (blink > 0.96) {
          ctx.fillStyle = '#A8D8EA';
          ctx.beginPath();
          ctx.ellipse(bx, 0, 18, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#4A3520';
          ctx.beginPath();
          ctx.ellipse(bx + 3, 2, 10, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(bx + 4, -3, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, 4, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx + 7, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = '#4A3520';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bx, -4, 10, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = '#A8D8EA';
    ctx.beginPath();
    ctx.ellipse(52, -30, 18, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();

    const mOpen = this.state === 'eat' ? Math.sin(this.animProgress * Math.PI * 3) * 0.5 + 0.5 : 0;
    const mh = 3 + mOpen * 10;

    ctx.save();
    ctx.translate(54, -28);
    if (mOpen > 0.35) {
      ctx.fillStyle = '#FF9A9A';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, mh, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.ellipse(0, mh * 0.3, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 3 - 1.5, -mh * 0.75);
        ctx.lineTo(i * 3, -mh * 0.4);
        ctx.lineTo(i * 3 + 1.5, -mh * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(i * 3 - 1.5, mh * 0.75);
        ctx.lineTo(i * 3, mh * 0.4);
        ctx.lineTo(i * 3 + 1.5, mh * 0.75);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#E07060';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  spawnBubble() {
    this.bubbles.push({
      x: 50 + Math.random() * 10 - 5,
      y: -30 + Math.random() * 10 - 5,
      sz: 4 + Math.random() * 3,
      life: 1
    });
  }

  spawnHeart() {
    this.hearts.push({ x: 0, y: -50, life: 1 });
  }

  spawnSparkles() {
    for (let i = 0; i < 5; i++) {
      this.sparkles.push({
        x: (Math.random() - 0.5) * 50,
        y: Math.random() * 60 - 60,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random(),
        life: 1
      });
    }
  }

  drawParticles() {
    const ctx = this.ctx;

    this.bubbles = this.bubbles.filter(b => b.life > 0);
    for (const b of this.bubbles) {
      ctx.save();
      ctx.translate(b.x, b.y - (1 - b.life) * 35);
      ctx.beginPath();
      ctx.arc(0, 0, b.sz * b.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${b.life * 0.5})`;
      ctx.fill();
      ctx.restore();
      b.life -= 0.006;
    }

    this.hearts = this.hearts.filter(h => h.life > 0);
    for (const h of this.hearts) {
      ctx.save();
      ctx.translate(h.x + Math.sin(h.life * Math.PI * 4) * 15, h.y - (1 - h.life) * 45);
      ctx.fillStyle = `rgba(255,140,140,${h.life})`;
      ctx.font = `${22 * h.life}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('❤️', 0, 0);
      ctx.restore();
      h.life -= 0.012;
    }

    this.sparkles = this.sparkles.filter(s => s.life > 0);
    for (const s of this.sparkles) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = `rgba(255,255,255,${s.life})`;
      ctx.font = `${14 * s.life}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('✨', 0, 0);
      ctx.restore();
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.015;
    }
  }
}

class StatsModel {
  constructor() {
    this._hunger = 80;
    this._mood = 90;
    this._energy = 75;
    this._coins = 0;
  }

  get hunger() { return this._hunger; }
  set hunger(v) { this._hunger = Math.max(0, Math.min(100, v)); }
  get mood() { return this._mood; }
  set mood(v) { this._mood = Math.max(0, Math.min(100, v)); }
  get energy() { return this._energy; }
  set energy(v) { this._energy = Math.max(0, Math.min(100, v)); }
  get coins() { return this._coins; }
  set coins(v) { this._coins = Math.max(0, v); }

  update(dt) {
    this.hunger -= 0.4 * dt;
    this.mood -= 0.2 * dt;
    this.energy -= 0.12 * dt;
  }

  serialize() {
    return { hunger: this.hunger, mood: this.mood, energy: this.energy, coins: this.coins };
  }

  deserialize(data) {
    if (data) {
      this.hunger = data.hunger ?? 80;
      this.mood = data.mood ?? 90;
      this.energy = data.energy ?? 75;
      this.coins = data.coins ?? 0;
    }
  }
}

class BehaviorEngine {
  constructor() {
    this.currentState = 'idle';
    this.animProgress = 0;
    this.animTimer = 0;
    this.walkTimer = 0;
  }

  update(dt, stats) {
    if (this.currentState === 'eat' || this.currentState === 'play') {
      this.animTimer += dt;
      this.animProgress = Math.min(1, this.animTimer / 1.5);
      if (this.animProgress >= 1) {
        this.currentState = 'idle';
        this.animTimer = 0;
        this.animProgress = 0;
      }
      return;
    }

    if (stats.energy < 20 && this.currentState !== 'sleep') {
      this.currentState = 'sleep';
      return;
    }

    if (this.currentState === 'sleep') {
      stats.energy = Math.min(100, stats.energy + 1.5 * dt);
      stats.mood = Math.min(100, stats.mood + 0.8 * dt);
      if (stats.energy > 80) {
        this.currentState = 'idle';
      }
      return;
    }

    if (this.currentState === 'idle') {
      this.walkTimer += dt;
      if (this.walkTimer > 8 && Math.random() < 0.005) {
        this.currentState = 'walk';
        this.walkTimer = 0;
        setTimeout(() => {
          if (this.currentState === 'walk') this.currentState = 'idle';
        }, 4000);
      }
    }
  }

  trigger(action) {
    switch (action) {
      case 'feed':
        this.currentState = 'eat';
        this.animTimer = 0;
        this.animProgress = 0;
        break;
      case 'play':
        this.currentState = 'play';
        this.animTimer = 0;
        this.animProgress = 0;
        break;
    }
  }
}

async function main() {
  const canvas = document.getElementById('petCanvas');
  const toast = document.getElementById('toast');
  const renderer = new PetRenderer(canvas);
  const stats = new StatsModel();
  const behavior = new BehaviorEngine();

  const savedData = await window.sharkPet?.loadData();
  if (savedData?.stats) stats.deserialize(savedData.stats);

  let lastSaveTime = 0;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1400);
  }

  canvas.addEventListener('click', () => {
    stats.mood = Math.min(100, stats.mood + 5);
    stats.coins += 1;
    renderer.spawnHeart();
    showToast('❤️');
  });

  canvas.addEventListener('dblclick', () => {
    if (stats.energy > 20 && behavior.currentState !== 'sleep') {
      behavior.trigger('play');
      stats.mood = Math.min(100, stats.mood + 15);
      stats.energy = Math.max(0, stats.energy - 10);
      stats.coins += 2;
      renderer.spawnSparkles();
      showToast('🎾');
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (stats.coins >= 5 && behavior.currentState !== 'sleep') {
      behavior.trigger('feed');
      stats.hunger = Math.min(100, stats.hunger + 30);
      stats.mood = Math.min(100, stats.mood + 5);
      stats.coins -= 5;
      showToast('🍣');
    } else if (stats.coins < 5) {
      showToast('金币不够！');
    }
  });

  let lastTime = performance.now();
  function animate(currentTime) {
    const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    stats.update(dt);
    behavior.update(dt, stats);

    if (behavior.currentState === 'idle' && Math.random() < 0.004) {
      renderer.spawnBubble();
    }

    renderer.draw(behavior.currentState, behavior.animProgress);

    lastSaveTime += dt;
    if (lastSaveTime > 30) {
      window.sharkPet?.saveData({ stats: stats.serialize(), timestamp: new Date().toISOString() });
      lastSaveTime = 0;
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('beforeunload', () => {
    window.sharkPet?.saveData({ stats: stats.serialize(), timestamp: new Date().toISOString() });
  });

  animate(performance.now());
}

document.addEventListener('DOMContentLoaded', main);