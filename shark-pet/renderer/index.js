import { SharkRenderer } from './shark.js';
import { StatsModel } from './stats.js';
import { BehaviorEngine } from './behavior.js';

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('sharkCanvas');
  const bubble = document.getElementById('bubble');

  const stats = new StatsModel();
  const behavior = new BehaviorEngine(stats);
  const shark = new SharkRenderer(canvas);

  const savedData = await window.sharkAPI?.loadData();
  if (savedData?.stats) {
    stats.deserialize(savedData.stats);
  }

  let lastTime = performance.now();
  let saveTimer = 0;
  let bubbleTimer = 0;
  let dragStart = { x: 0, y: 0 };
  let dragActive = false;
  let lastMousePos = { x: 0, y: 0 };

  function showBubble(text) {
    bubble.textContent = text;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
  }

  canvas.addEventListener('mousedown', (e) => {
    dragActive = true;
    dragStart = { x: e.clientX, y: e.clientY };
    lastMousePos = { x: e.clientX, y: e.clientY };
    shark.startDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', (e) => {
    if (dragActive) {
      shark.updateDrag(e.clientX, e.clientY, lastMousePos.x, lastMousePos.y);
      lastMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  document.addEventListener('mouseup', () => {
    if (dragActive) {
      dragActive = false;
      shark.endDrag();
    }
  });

  canvas.addEventListener('click', (e) => {
    behavior.trigger('pet');
    stats.modify('mood', 5);
    stats.modify('coins', 1);
    shark.spawnHeart();

    if (stats.mood > 70) {
      showBubble('❤️');
    } else {
      showBubble('😊');
    }
  });

  canvas.addEventListener('dblclick', () => {
    if (stats.energy > 20) {
      behavior.trigger('play');
      stats.modify('mood', 10);
      stats.modify('energy', -10);
      stats.modify('coins', 2);
      showBubble('🎾');
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    if (stats.coins >= 5) {
      behavior.trigger('feed');
      stats.modify('hunger', 30);
      stats.modify('mood', 5);
      stats.modify('coins', -5);
      showBubble('🍣');
    } else {
      showBubble('没有足够金币！');
    }
  });

  function animate(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    stats.update(dt);
    behavior.update(dt, stats);

    if (behavior.currentState === 'idle' && Math.random() < 0.005) {
      shark.spawnBubble();
    }

    if (stats.hunger < 30 && behavior.currentState === 'idle' && bubbleTimer <= 0) {
      showBubble('好饿...');
      bubbleTimer = 120;
    } else if (stats.energy < 20 && behavior.currentState !== 'sleep' && bubbleTimer <= 0) {
      showBubble('💤');
      bubbleTimer = 120;
    }

    bubbleTimer = Math.max(0, bubbleTimer - dt);

    shark.draw(behavior.currentState, behavior.animProgress);

    saveTimer += dt;
    if (saveTimer > 30) {
      saveData();
      saveTimer = 0;
    }

    requestAnimationFrame(animate);
  }

  async function saveData() {
    await window.sharkAPI?.saveData({
      stats: stats.serialize(),
      timestamp: new Date().toISOString()
    });
  }

  window.addEventListener('beforeunload', saveData);

  animate(performance.now());
});
