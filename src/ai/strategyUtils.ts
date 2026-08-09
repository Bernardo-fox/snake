import { GAME_CONFIG } from "../config/gameConfig";
import type { World } from "../core/World";
import type { Snake } from "../entities/Snake";
import { angleBetween, clamp, distance, type Vec2 } from "../utils/math";

export function urgentChaseRadius(snake: Snake): number {
  return (snake.baseSpeed / GAME_CONFIG.turnSpeed) * 1.5;
}

export function findNearestFood(
  snake: Snake,
  world: World,
  visionRadius: number,
): Vec2 | null {
  let best: Vec2 | null = null;
  let bestDist = Infinity;

  for (const food of world.foods) {
    const dist = distance(snake.head, food);
    if (dist <= visionRadius && dist < bestDist) {
      best = food;
      bestDist = dist;
    }
  }

  return best;
}

export function findNearestThreat(
  snake: Snake,
  world: World,
  visionRadius: number,
): Snake | null {
  let best: Snake | null = null;
  let bestDist = Infinity;

  for (const other of world.snakes) {
    if (other.id === snake.id || !other.alive) continue;

    const dist = distance(snake.head, other.head);
    if (dist <= visionRadius && dist < bestDist) {
      best = other;
      bestDist = dist;
    }
  }

  return best;
}

export function isDangerAhead(
  snake: Snake,
  world: World,
  angle: number,
  lookAhead: number,
): boolean {
  const head = snake.head;
  const step = 20;
  const steps = Math.max(1, Math.ceil(lookAhead / step));

  for (let s = 1; s <= steps; s++) {
    const dist = (lookAhead * s) / steps;
    const probeX = head.x + Math.cos(angle) * dist;
    const probeY = head.y + Math.sin(angle) * dist;

    if (!world.isInsideBounds(probeX, probeY, GAME_CONFIG.headRadius)) {
      return true;
    }

    for (const other of world.snakes) {
      if (!other.alive || other.id === snake.id) continue;

      const segments = other.getSegmentPositions();

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]!;
        const segDist = distance({ x: probeX, y: probeY }, segment);

        if (segDist < GAME_CONFIG.collisionRadius * 2.5) {
          return true;
        }
      }
    }
  }

  const edgeMargin = 60;
  const nearEdge =
    head.x < edgeMargin ||
    head.x > world.width - edgeMargin ||
    head.y < edgeMargin ||
    head.y > world.height - edgeMargin;

  if (nearEdge) {
    const centerAngle = angleBetween(head, {
      x: clamp(head.x, edgeMargin, world.width - edgeMargin),
      y: clamp(head.y, edgeMargin, world.height - edgeMargin),
    });
    let diff = Math.abs(centerAngle - angle);
    while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
    if (diff > Math.PI / 3) return true;
  }

  return false;
}

export function resolveSafeAngle(
  snake: Snake,
  world: World,
  preferredAngle: number,
  lookAhead: number,
): { angle: number; usedPreferred: boolean } {
  if (!isDangerAhead(snake, world, preferredAngle, lookAhead)) {
    return { angle: preferredAngle, usedPreferred: true };
  }

  const escapeAngles = [
    preferredAngle + Math.PI / 4,
    preferredAngle - Math.PI / 4,
    preferredAngle + Math.PI / 2,
    preferredAngle - Math.PI / 2,
    preferredAngle + (3 * Math.PI) / 4,
    preferredAngle - (3 * Math.PI) / 4,
    snake.angle + Math.PI,
  ];

  for (const angle of escapeAngles) {
    if (!isDangerAhead(snake, world, angle, lookAhead)) {
      return { angle, usedPreferred: false };
    }
  }

  return { angle: snake.angle + Math.PI / 2, usedPreferred: false };
}

export function dangerLookAhead(aggressiveness: number): number {
  return 120 * (1 - aggressiveness * 0.5);
}

const PANIC_COMMIT_MS = 500;

/**
 * Commits to a single flee heading for a short window instead of recomputing
 * "away from threat" fresh every frame — recomputing every frame is what causes
 * a bot squeezed between a chaser and an obstacle to flip its heading ~180°
 * back and forth forever instead of actually getting away.
 */
export class PanicFlee {
  private angle: number | null = null;
  private until = 0;

  resolve(
    snake: Snake,
    world: World,
    radius: number,
    lookAhead: number,
    now: number,
  ): number | null {
    if (
      this.angle !== null &&
      now < this.until &&
      !isDangerAhead(snake, world, this.angle, lookAhead)
    ) {
      return this.angle;
    }

    this.angle = null;

    const threat = findNearestThreat(snake, world, radius);
    if (!threat) return null;

    const fleeAngle = angleBetween(threat.head, snake.head);
    if (isDangerAhead(snake, world, fleeAngle, lookAhead)) return null;

    this.angle = fleeAngle;
    this.until = now + PANIC_COMMIT_MS;
    return fleeAngle;
  }
}

export function fogVisionMultiplier(world: World): number {
  return world.events.fogActive ? GAME_CONFIG.fogVisionMultiplier : 1;
}
