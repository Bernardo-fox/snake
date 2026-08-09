export const FOOD_NORMAL = {
  growth: 1,
  points: 1,
  radius: 4,
  color: "#58d68d",
} as const;

export const FOOD_DROP = {
  growth: 2,
  points: 2,
  radius: 5,
} as const;

export const FOOD_BOOST_DROP = {
  growth: 1,
  points: 1,
  radius: 4,
} as const;

export const FOOD_GIANT = {
  growth: 8,
  points: 8,
  radius: 13,
  color: "#ffd54f",
} as const;

export const GAME_CONFIG = {
  worldWidth: 4000,
  worldHeight: 3000,

  totalSnakes: 12,
  botCount: 11,
  minSpawnDistance: 200,

  normalFoodCount: 150,
  dropEverySegments: 2,

  snakeSpeed: 120,
  playerSpeedMultiplier: 1.12,
  boostSpeedMultiplier: 1.8,
  boostDrainPerSecond: 1.5,
  segmentSpacing: 8,
  headRadius: 10,
  segmentRadius: 9,
  initialSegments: 8,
  turnSpeed: 4,
  urgentTurnBoost: 6,

  botRespawnDelayMs: 3000,

  collisionRadius: 10,

  cameraLerp: 0.12,
  cameraZoom: 1.2,

  dayNightCycleDurationMs: 90000,
  ambientColorCycleMs: 75000,

  eventMinIntervalMs: 20000,
  eventMaxIntervalMs: 40000,
  eventBannerDurationMs: 4000,
  foodRainCount: 40,
  foodRainRadius: 500,
  foodRainGlowMs: 1200,
  giantFoodLifespanMs: 25000,
  fogDurationMs: 18000,
  fogVisionMultiplier: 0.5,
} as const;
