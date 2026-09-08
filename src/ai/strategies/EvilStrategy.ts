import type { World } from "../../core/World";
import type { Snake } from "../../entities/Snake";
import { angleBetween, distance, randomRange } from "../../utils/math";
import type { BotStrategy, DirectionDecision } from "../BotStrategy";
import {
  dangerLookAhead,
  findNearestFood,
  findNearestThreat,
  fogVisionMultiplier,
  resolveSafeAngle,
  urgentChaseRadius,
} from "../strategyUtils";

const NIGHT_HUNT_VISION_MULTIPLIER = 1.3;
const NIGHT_LEAD_MULTIPLIER = 1.25;

export class EvilStrategy implements BotStrategy {
  constructor(
    private readonly huntVisionRadius: number,
    private readonly foodVisionRadius: number,
    private readonly aggressiveness: number,
  ) {}

  decideDirection(snake: Snake, world: World): DirectionDecision {
    const isNight = world.dayNight.isNight;
    const lookAhead = dangerLookAhead(this.aggressiveness);
    const fogMultiplier = fogVisionMultiplier(world);
    const huntVisionRadius =
      (isNight ? this.huntVisionRadius * NIGHT_HUNT_VISION_MULTIPLIER : this.huntVisionRadius) *
      fogMultiplier;
    const prey = findNearestThreat(snake, world, huntVisionRadius);

    if (prey) {
      const distToPrey = distance(snake.head, prey.head);
      const leadDistance = this.aggressiveness * 60 * (isNight ? NIGHT_LEAD_MULTIPLIER : 1);
      const leadPoint = {
        x: prey.x + Math.cos(prey.angle) * leadDistance,
        y: prey.y + Math.sin(prey.angle) * leadDistance,
      };
      const chaseAngle = angleBetween(snake.head, leadPoint);
      const isUrgentKill = distToPrey < urgentChaseRadius(snake) * 1.5;

      const { angle, usedPreferred } = resolveSafeAngle(snake, world, chaseAngle, lookAhead);
      return { angle, urgent: usedPreferred && isUrgentKill };
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
