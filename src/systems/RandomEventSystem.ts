import { GAME_CONFIG } from "../config/gameConfig";
import type { World } from "../core/World";
import { Food } from "../entities/Food";
import { clamp, randomRange } from "../utils/math";

export class RandomEventSystem {
  private nextEventAt: number;
  private fogUntil = 0;
  private giantFoodId: number | null = null;
  private giantFoodExpiresAt = 0;
  private currentNow: number;

  bannerText: string | null = null;
  private bannerUntil = 0;

  constructor(now: number) {
    this.currentNow = now;
    this.nextEventAt = now + this.rollInterval();
  }

  get fogActive(): boolean {
    return this.currentNow < this.fogUntil;
  }

  update(world: World, now: number): void {
    this.currentNow = now;

    if (this.bannerText !== null && now >= this.bannerUntil) {
      this.bannerText = null;
    }

    if (this.giantFoodId !== null) {
      const stillThere = world.foods.some((food) => food.id === this.giantFoodId);

      if (!stillThere) {
        this.giantFoodId = null;
      } else if (now >= this.giantFoodExpiresAt) {
        const index = world.foods.findIndex((food) => food.id === this.giantFoodId);
        if (index >= 0) world.foods.splice(index, 1);
        this.giantFoodId = null;
      }
    }

    if (now >= this.nextEventAt) {
      this.triggerRandomEvent(world, now);
      this.nextEventAt = now + this.rollInterval();
    }
  }

  private rollInterval(): number {
    return randomRange(GAME_CONFIG.eventMinIntervalMs, GAME_CONFIG.eventMaxIntervalMs);
  }

  private triggerRandomEvent(world: World, now: number): void {
    const roll = Math.random();

    if (roll < 1 / 3) {
      this.triggerFoodRain(world, now);
    } else if (roll < 2 / 3) {
      this.triggerGiantFood(world, now);
    } else {
      this.triggerFog(now);
    }
  }

  private triggerFoodRain(world: World, now: number): void {
    const padding = 60;
    const center = world.player?.alive ? world.player : null;
    const radius = GAME_CONFIG.foodRainRadius;

    for (let i = 0; i < GAME_CONFIG.foodRainCount; i++) {
      let x: number;
      let y: number;

      if (center) {
        const angle = randomRange(0, Math.PI * 2);
        const dist = Math.sqrt(Math.random()) * radius;
        x = clamp(center.x + Math.cos(angle) * dist, padding, world.width - padding);
        y = clamp(center.y + Math.sin(angle) * dist, padding, world.height - padding);
      } else {
        x = randomRange(padding, world.width - padding);
        y = randomRange(padding, world.height - padding);
      }

      world.foods.push(new Food(x, y, "normal", undefined, now));
    }

    this.showBanner("Chuva de comida!");
  }

  private triggerGiantFood(world: World, now: number): void {
    const padding = 100;
    const x = randomRange(padding, world.width - padding);
    const y = randomRange(padding, world.height - padding);
    const food = new Food(x, y, "giant");

    world.foods.push(food);
    this.giantFoodId = food.id;
    this.giantFoodExpiresAt = now + GAME_CONFIG.giantFoodLifespanMs;

    this.showBanner("Comida gigante apareceu!");
  }

  private triggerFog(now: number): void {
    this.fogUntil = now + GAME_CONFIG.fogDurationMs;
    this.showBanner("Uma nevoa desceu sobre o mapa...");
  }

  private showBanner(text: string): void {
    this.bannerText = text;
    this.bannerUntil = this.currentNow + GAME_CONFIG.eventBannerDurationMs;
  }
}
