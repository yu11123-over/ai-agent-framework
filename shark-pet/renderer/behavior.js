export class BehaviorEngine {
  constructor(stats) {
    this.stats = stats;
    this._currentState = 'idle';
    this.animProgress = 0;
    this.stateTimer = 0;
    this.walkCooldown = 0;
    this.stateEnterTime = 0;
  }

  get currentState() {
    return this._currentState;
  }

  update(dt, stats) {
    this.stats = stats;
    this.stateTimer += dt;

    if (this._currentState === 'eat' || this._currentState === 'play') {
      this.animProgress += dt * 0.03;
      if (this.animProgress >= 1) {
        this._currentState = 'idle';
        this.animProgress = 0;
        this.stateTimer = 0;
      }
      return;
    }

    if (stats.energy < 20 && this._currentState !== 'sleep') {
      this._currentState = 'sleep';
      this.stateTimer = 0;
      return;
    }

    if (stats.hunger < 30 && this._currentState === 'idle') {
      return;
    }

    if (this._currentState === 'sleep') {
      stats.energy += 2 * (dt / 30);
      stats.mood += 1 * (dt / 30);
      if (stats.energy > 80) {
        this._currentState = 'idle';
        this.stateTimer = 0;
      }
      return;
    }

    if (this._currentState === 'idle') {
      this.walkCooldown -= dt;
      if (this.walkCooldown <= 0 && Math.random() < 0.01) {
        this._currentState = 'walk';
        this.stateTimer = 0;
        this.walkCooldown = 60;
      }
    } else if (this._currentState === 'walk') {
      if (this.stateTimer > 120) {
        this._currentState = 'idle';
        this.stateTimer = 0;
      }
    }
  }

  trigger(action) {
    switch (action) {
      case 'feed':
        if (this._currentState !== 'sleep') {
          this._currentState = 'eat';
          this.animProgress = 0;
          this.stateTimer = 0;
        }
        break;
      case 'play':
        if (this._currentState !== 'sleep') {
          this._currentState = 'play';
          this.animProgress = 0;
          this.stateTimer = 0;
        }
        break;
      case 'pet':
        break;
    }
  }
}
