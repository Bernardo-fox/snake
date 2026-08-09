import type { Snake } from "../entities/Snake";
import type { World } from "../core/World";

export interface DirectionDecision {
  angle: number;
  urgent: boolean;
}

export interface BotStrategy {
  decideDirection(snake: Snake, world: World, now: number): DirectionDecision;
}
