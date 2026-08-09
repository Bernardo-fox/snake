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
    const player = world.player;

    if (player?.alive) {
      const distToPlayer = distance(snake.head, player.head);

      if (distToPlayer <= huntVisionRadius) {
        const leadDistance = this.aggressiveness * 60 * (isNight ? NIGHT_LEAD_MULTIPLIER : 1);
        const target = {
          x: player.x + Math.cos(player.angle) * leadDistance,
          y: player.y + Math.sin(player.angle) * leadDistance,
        };
        const chaseAngle = angleBetween(snake.head, target);
        const isUrgentKill = distToPlayer < urgentChaseRadius(snake) * 1.5;

        const { angle, usedPreferred } = resolveSafeAngle(snake, world, chaseAngle, lookAhead);
        return { angle, urgent: usedPreferred && isUrgentKill };
      }
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
