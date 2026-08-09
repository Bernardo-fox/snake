import { GAME_CONFIG } from "../config/gameConfig";
import type { Snake } from "../entities/Snake";
import { lerpAngle } from "../utils/math";

export class MovementSystem {
  updateSnake(snake: Snake, dt: number): void {
    if (!snake.alive) return;

    snake.angle = lerpAngle(
      snake.angle,
      snake.targetAngle,
      Math.min(1, GAME_CONFIG.turnSpeed * snake.turnBoost * dt),
    );

    const speed = snake.boosting
      ? snake.baseSpeed * GAME_CONFIG.boostSpeedMultiplier
      : snake.baseSpeed;

    snake.x += Math.cos(snake.angle) * speed * dt;
    snake.y += Math.sin(snake.angle) * speed * dt;

    snake.trail.unshift({ x: snake.x, y: snake.y });

    const maxTrailLength =
      snake.segmentCount * GAME_CONFIG.segmentSpacing + GAME_CONFIG.segmentSpacing * 2;

    if (snake.trail.length > maxTrailLength) {
      snake.trail.length = maxTrailLength;
    }

    if (snake.boosting) {
      snake.shrink(GAME_CONFIG.boostDrainPerSecond * dt);
    }

    snake.applyGrowth();
  }
}
