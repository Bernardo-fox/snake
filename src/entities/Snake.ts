import { GAME_CONFIG } from "../config/gameConfig";
import type { Vec2 } from "../utils/math";

let nextSnakeId = 1;

export class Snake {
  readonly id: number;
  readonly name: string;
  readonly color: string;
  readonly headColor: string;
  readonly isPlayer: boolean;
  readonly baseSpeed: number;

  x: number;
  y: number;
  angle: number;
  targetAngle: number;

  segmentCount: number;
  score: number;
  alive: boolean;
  boosting: boolean;
  turnBoost: number;

  readonly trail: Vec2[] = [];
  pendingGrowth: number;
  respawnAt: number;

  constructor(
    x: number,
    y: number,
    angle: number,
    name: string,
    color: string,
    isPlayer: boolean,
    headColor: string = color,
    baseSpeed: number = GAME_CONFIG.snakeSpeed,
  ) {
    this.id = nextSnakeId++;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.targetAngle = angle;
    this.name = name;
    this.color = color;
    this.headColor = headColor;
    this.isPlayer = isPlayer;
    this.baseSpeed = baseSpeed;
    this.segmentCount = GAME_CONFIG.initialSegments;
    this.score = 0;
    this.alive = true;
    this.boosting = false;
    this.turnBoost = 1;
    this.pendingGrowth = 0;
    this.respawnAt = 0;

    this.trail.push(...Snake.buildInitialTrail(x, y, angle, this.segmentCount));
  }

  get head(): Vec2 {
    return { x: this.x, y: this.y };
  }

  getSegmentPositions(): Vec2[] {
    const positions: Vec2[] = [{ x: this.x, y: this.y }];

    for (let i = 1; i < this.segmentCount; i++) {
      const index = i * GAME_CONFIG.segmentSpacing;
      if (index < this.trail.length) {
        positions.push(this.trail[index]!);
      }
    }

    return positions;
  }

  grow(amount: number, points: number): void {
    this.pendingGrowth += amount;
    this.score += points;
  }

  applyGrowth(): void {
    while (this.pendingGrowth > 0) {
      this.segmentCount += 1;
      this.pendingGrowth -= 1;
    }

    while (this.pendingGrowth < 0 && this.segmentCount > GAME_CONFIG.initialSegments) {
      this.segmentCount -= 1;
      this.pendingGrowth += 1;
    }

    if (this.pendingGrowth < 0) this.pendingGrowth = 0;
  }

  shrink(amount: number): void {
    this.pendingGrowth -= amount;
  }

  kill(): void {
    this.alive = false;
  }

  reset(
    x: number,
    y: number,
    angle: number,
    respawnDelayMs = 0,
  ): void {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.targetAngle = angle;
    this.segmentCount = GAME_CONFIG.initialSegments;
    this.score = 0;
    this.boosting = false;
    this.turnBoost = 1;
    this.pendingGrowth = 0;
    this.trail.length = 0;
    this.trail.push(...Snake.buildInitialTrail(x, y, angle, this.segmentCount));

    if (respawnDelayMs > 0) {
      this.alive = false;
      this.respawnAt = performance.now() + respawnDelayMs;
    } else {
      this.alive = true;
      this.respawnAt = 0;
    }
  }

  private static buildInitialTrail(
    x: number,
    y: number,
    angle: number,
    segmentCount: number,
  ): Vec2[] {
    const length = segmentCount * GAME_CONFIG.segmentSpacing;
    const stepPerEntry = GAME_CONFIG.snakeSpeed / 60;
    const trail: Vec2[] = [];

    for (let i = 0; i < length; i++) {
      trail.push({
        x: x - Math.cos(angle) * i * stepPerEntry,
        y: y - Math.sin(angle) * i * stepPerEntry,
      });
    }

    return trail;
  }
}
