import type { World } from "../../core/World";
import type { Snake } from "../../entities/Snake";
import { angleBetween, distance, randomRange } from "../../utils/math";
import type { BotStrategy, DirectionDecision } from "../BotStrategy";
import {
  dangerLookAhead,
  findNearestFood,
  fogVisionMultiplier,
  resolveSafeAngle,
  urgentChaseRadius,
} from "../strategyUtils";

const NIGHT_VISION_MULTIPLIER = 0.6;

export class GluttonStrategy implements BotStrategy {
  constructor(
    private readonly visionRadius: number,
    private readonly aggressiveness: number,
  ) {}

  decideDirection(snake: Snake, world: World): DirectionDecision {
    const visionRadius =
      (world.dayNight.isNight ? this.visionRadius * NIGHT_VISION_MULTIPLIER : this.visionRadius) *
      fogVisionMultiplier(world);
    const food = findNearestFood(snake, world, visionRadius);
    const isUrgentFood = food !== null && distance(snake.head, food) < urgentChaseRadius(snake);

    const preferredAngle = food
      ? angleBetween(snake.head, food)
      : snake.angle + randomRange(-0.5, 0.5);

    const { angle, usedPreferred } = resolveSafeAngle(
      snake,
      world,
      preferredAngle,
      dangerLookAhead(this.aggressiveness),
    );

    return { angle, urgent: usedPreferred && isUrgentFood };
  }
}
