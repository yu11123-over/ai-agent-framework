export class StatsModel {
  constructor() {
    this.hunger = 80;
    this.mood = 90;
    this.energy = 75;
    this.coins = 0;
    this.customStats = {};
  }

  get hunger() { return this._hunger; }
  set hunger(value) { this._hunger = Math.max(0, Math.min(100, value)); }

  get mood() { return this._mood; }
  set mood(value) { this._mood = Math.max(0, Math.min(100, value)); }

  get energy() { return this._energy; }
  set energy(value) { this._energy = Math.max(0, Math.min(100, value)); }

  get coins() { return this._coins; }
  set coins(value) { this._coins = Math.max(0, value); }

  addCustomStat(key, min, max, decayRate) {
    this.customStats[key] = {
      value: (min + max) / 2,
      min,
      max,
      decayRate
    };
  }

  update(dt) {
    const decayMultiplier = dt / 30;

    this.hunger -= 1 * decayMultiplier;
    this.mood -= 0.5 * decayMultiplier;
    this.energy -= 0.3 * decayMultiplier;

    for (const key in this.customStats) {
      const stat = this.customStats[key];
      stat.value -= stat.decayRate * decayMultiplier;
      stat.value = Math.max(stat.min, Math.min(stat.max, stat.value));
    }
  }

  modify(key, delta) {
    switch (key) {
      case 'hunger':
        this.hunger += delta;
        break;
      case 'mood':
        this.mood += delta;
        break;
      case 'energy':
        this.energy += delta;
        break;
      case 'coins':
        this.coins += delta;
        break;
      default:
        if (this.customStats[key]) {
          this.customStats[key].value += delta;
          const stat = this.customStats[key];
          stat.value = Math.max(stat.min, Math.min(stat.max, stat.value));
        }
    }
  }

  serialize() {
    return {
      hunger: this.hunger,
      mood: this.mood,
      energy: this.energy,
      coins: this.coins,
      customStats: { ...this.customStats }
    };
  }

  deserialize(data) {
    if (data) {
      this.hunger = data.hunger ?? 80;
      this.mood = data.mood ?? 90;
      this.energy = data.energy ?? 75;
      this.coins = data.coins ?? 0;
      if (data.customStats) {
        this.customStats = { ...data.customStats };
      }
    }
  }
}
