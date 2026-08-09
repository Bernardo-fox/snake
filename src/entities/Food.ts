import { FOOD_BOOST_DROP, FOOD_DROP, FOOD_GIANT, FOOD_NORMAL } from "../config/gameConfig";

export type FoodType = "normal" | "drop" | "boost" | "giant";

let nextFoodId = 1;

export class Food {
  readonly id: number;
  x: number;
  y: number;
  readonly type: FoodType;
  readonly growth: number;
  readonly points: number;
  readonly radius: number;
  readonly color: string;
  readonly spawnedAt: number;

  constructor(
    x: number,
    y: number,
    type: FoodType,
    color?: string,
    spawnedAt = 0,
  ) {
    this.id = nextFoodId++;
    this.x = x;
    this.y = y;
    this.type = type;
    this.spawnedAt = spawnedAt;

    if (type === "normal") {
      this.growth = FOOD_NORMAL.growth;
      this.points = FOOD_NORMAL.points;
      this.radius = FOOD_NORMAL.radius;
      this.color = FOOD_NORMAL.color;
    } else if (type === "boost") {
      this.growth = FOOD_BOOST_DROP.growth;
      this.points = FOOD_BOOST_DROP.points;
      this.radius = FOOD_BOOST_DROP.radius;
      this.color = color ?? "#ffd166";
    } else if (type === "giant") {
      this.growth = FOOD_GIANT.growth;
      this.points = FOOD_GIANT.points;
      this.radius = FOOD_GIANT.radius;
      this.color = FOOD_GIANT.color;
    } else {
      this.growth = FOOD_DROP.growth;
      this.points = FOOD_DROP.points;
      this.radius = FOOD_DROP.radius;
      this.color = color ?? "#ffd166";
    }
  }
}
