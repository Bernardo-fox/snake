import type { World } from "../../core/World";
import type { Snake } from "../../entities/Snake";
import { angleBetween, distance, randomRange } from "../../utils/math";
import type { BotStrategy, DirectionDecision } from "../BotStrategy";
import {
  dangerLookAhead,
  findNearestFood,
  fogVisionMultiplier,
  PanicFlee,
  resolveSafeAngle,
  urgentChaseRadius,
} from "../strategyUtils";

const NIGHT_THREAT_VISION_MULTIPLIER = 1.3;

export class CowardStrategy implements BotStrategy {
  private readonly panicFlee = new PanicFlee();

  constructor(
    private readonly threatVisionRadius: number,
    private readonly foodVisionRadius: number,
    private readonly aggressiveness: number,
  ) {}

  decideDirection(snake: Snake, world: World, now: number): DirectionDecision {
    const lookAhead = dangerLookAhead(this.aggressiveness);
    const fogMultiplier = fogVisionMultiplier(world);
    const threatVisionRadius =
      (world.dayNight.isNight
        ? this.threatVisionRadius * NIGHT_THREAT_VISION_MULTIPLIER
        : this.threatVisionRadius) * fogMultiplier;

    const fleeAngle = this.panicFlee.resolve(snake, world, threatVisionRadius, lookAhead, now);
    if (fleeAngle !== null) {
      return { angle: fleeAngle, urgent: true };
    }

    const food = findNearestFood(snake, world, this.foodVisionRadius * fogMultiplier);
    const isUrgentFood = food !== null && distance(snake.head, food) < urgentChaseRadius(snake);

    const preferredAngle = food
      ? angleBetween(snake.head, food)
      : snake.angle + randomRange(-0.5, 0.5);

    const { angle, usedPreferred } = resolveSafeAngle(snake, world, preferredAngle, lookAhead);

    return { angle, urgent: usedPreferred && isUrgentFood };
  }
}
