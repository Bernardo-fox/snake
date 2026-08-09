import { GAME_CONFIG } from "../config/gameConfig";
import type { World } from "../core/World";
import type { Snake } from "../entities/Snake";
import type { BotStrategy } from "./BotStrategy";

export class BotController {
  private readonly strategies = new Map<number, BotStrategy>();

  registerStrategy(snake: Snake, strategy: BotStrategy): void {
    this.strategies.set(snake.id, strategy);
  }

  update(world: World, now: number): void {
    for (const snake of world.snakes) {
      if (!snake.alive || snake.isPlayer) continue;

      const strategy = this.strategies.get(snake.id);
      if (!strategy) continue;

      const decision = strategy.decideDirection(snake, world, now);
      snake.targetAngle = decision.angle;
      snake.turnBoost = decision.urgent ? GAME_CONFIG.urgentTurnBoost : 1;
    }
  }

  reset(): void {
    this.strategies.clear();
  }
}
