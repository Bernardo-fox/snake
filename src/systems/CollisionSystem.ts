import { GAME_CONFIG } from "../config/gameConfig";
import type { World } from "../core/World";
import type { Snake } from "../entities/Snake";
import { distance } from "../utils/math";

export interface DeathEvent {
  snake: Snake;
  killer: Snake | null;
}

export class CollisionSystem {
  checkSnakeCollisions(world: World): DeathEvent[] {
    const deaths: DeathEvent[] = [];

    for (const snake of world.snakes) {
      if (!snake.alive) continue;

      if (!world.isInsideBounds(snake.x, snake.y, GAME_CONFIG.headRadius)) {
        snake.kill();
        deaths.push({ snake, killer: null });
        continue;
      }

      for (const other of world.snakes) {
        if (!other.alive || other.id === snake.id) continue;

        const segments = other.getSegmentPositions();

        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]!;
          const hitRadius = GAME_CONFIG.collisionRadius;

          if (distance(snake.head, segment) < hitRadius) {
            snake.kill();
            deaths.push({ snake, killer: other });
            break;
          }
        }

        if (!snake.alive) break;
      }
    }

    return deaths;
  }
}
