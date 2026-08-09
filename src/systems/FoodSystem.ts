import { GAME_CONFIG } from "../config/gameConfig";
import type { World } from "../core/World";
import { Food } from "../entities/Food";
import type { Snake } from "../entities/Snake";
import { distance, randomRange } from "../utils/math";

export class FoodSystem {
  populate(world: World): void {
    world.foods.length = 0;

    for (let i = 0; i < GAME_CONFIG.normalFoodCount; i++) {
      world.foods.push(this.createRandomNormalFood(world));
    }
  }

  createRandomNormalFood(world: World): Food {
    const padding = 40;

    for (let attempt = 0; attempt < 50; attempt++) {
      const x = randomRange(padding, world.width - padding);
      const y = randomRange(padding, world.height - padding);
      const tooClose = world.foods.some(
        (food) => distance(food, { x, y }) < food.radius * 2,
      );

      if (!tooClose) {
        return new Food(x, y, "normal");
      }
    }

    return new Food(
      randomRange(padding, world.width - padding),
      randomRange(padding, world.height - padding),
      "normal",
    );
  }

  collectFood(world: World): void {
    for (const snake of world.snakes) {
      if (!snake.alive) continue;

      for (let i = world.foods.length - 1; i >= 0; i--) {
        const food = world.foods[i]!;
        const eatRadius = GAME_CONFIG.headRadius + food.radius;

        if (distance(snake.head, food) <= eatRadius) {
          snake.grow(food.growth, food.points);
          if (snake.isPlayer) world.playerStats.foodEaten++;
          world.foods.splice(i, 1);

          if (food.type === "normal") {
            world.foods.push(this.createRandomNormalFood(world));
          }
        }
      }
    }
  }

  spawnDeathDrops(world: World, snake: Snake): void {
    const segments = snake.getSegmentPositions();

    for (let i = 0; i < segments.length; i += GAME_CONFIG.dropEverySegments) {
      const segment = segments[i]!;
      world.foods.push(new Food(segment.x, segment.y, "drop", snake.color));
    }
  }

  spawnBoostDrop(world: World, snake: Snake, position: { x: number; y: number }): void {
    world.foods.push(new Food(position.x, position.y, "boost", snake.color));
  }
}
