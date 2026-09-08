import { GAME_CONFIG } from "../config/gameConfig";
import { Food } from "../entities/Food";
import { Snake } from "../entities/Snake";
import { distance, randomRange } from "../utils/math";
import { DayNightCycle } from "./DayNightCycle";
import { KillFeed } from "./KillFeed";
import { RandomEventSystem } from "../systems/RandomEventSystem";

export class World {
  readonly snakes: Snake[] = [];
  readonly foods: Food[] = [];

  readonly width = GAME_CONFIG.worldWidth;
  readonly height = GAME_CONFIG.worldHeight;

  readonly dayNight = new DayNightCycle(GAME_CONFIG.dayNightCycleDurationMs);
  readonly events = new RandomEventSystem(0);
  readonly killFeed = new KillFeed();
  totalElapsedMs = 0;

  readonly playerStats = { foodEaten: 0, kills: 0, survivalMs: 0 };

  player: Snake | null = null;

  findSpawnPosition(minDistance = GAME_CONFIG.minSpawnDistance): {
    x: number;
    y: number;
    angle: number;
  } {
    const padding = 80;

    for (let attempt = 0; attempt < 200; attempt++) {
      const x = randomRange(padding, this.width - padding);
      const y = randomRange(padding, this.height - padding);
      const angle = randomRange(0, Math.PI * 2);

      const tooClose = this.snakes.some((snake) => {
        if (!snake.alive) return false;
        return distance(snake.head, { x, y }) < minDistance;
      });

      if (!tooClose) {
        return { x, y, angle };
      }
    }

    return {
      x: this.width / 2,
      y: this.height / 2,
      angle: randomRange(0, Math.PI * 2),
    };
  }

  getAliveSnakes(): Snake[] {
    return this.snakes.filter((snake) => snake.alive);
  }

  getRanking(): Snake[] {
    return [...this.snakes].sort((a, b) => b.score - a.score);
  }

  getLeader(): Snake | null {
    const alive = this.getRanking().filter((snake) => snake.alive);
    const leader = alive[0];
    return leader && leader.score > 0 ? leader : null;
  }

  isInsideBounds(x: number, y: number, margin = 0): boolean {
    return (
      x >= margin &&
      x <= this.width - margin &&
      y >= margin &&
      y <= this.height - margin
    );
  }
}
