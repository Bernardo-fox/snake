import { BotController } from "../ai/BotController";
import { BOT_PERSONALITY_ORDER, PERSONALITIES, type PersonalityType } from "../ai/personality";
import { CowardStrategy } from "../ai/strategies/CowardStrategy";
import { EvilStrategy } from "../ai/strategies/EvilStrategy";
import { GluttonStrategy } from "../ai/strategies/GluttonStrategy";
import type { BotStrategy } from "../ai/BotStrategy";
import { GAME_CONFIG } from "../config/gameConfig";
import { AchievementManager } from "./Achievements";
import { Camera } from "./Camera";
import { World } from "./World";
import { Snake } from "../entities/Snake";
import { Renderer, type GameState } from "../render/Renderer";
import { CollisionSystem } from "../systems/CollisionSystem";
import { FoodSystem } from "../systems/FoodSystem";
import { InputSystem } from "../systems/InputSystem";
import { MovementSystem } from "../systems/MovementSystem";

function createStrategy(type: PersonalityType): BotStrategy {
  const personality = PERSONALITIES[type];

  switch (type) {
    case "glutton":
      return new GluttonStrategy(personality.visionRadius, personality.aggressiveness);
    case "coward":
      return new CowardStrategy(
        personality.visionRadius,
        personality.secondaryVisionRadius,
        personality.aggressiveness,
      );
    case "evil":
      return new EvilStrategy(
        personality.visionRadius,
        personality.secondaryVisionRadius,
        personality.aggressiveness,
      );
  }
}

export class Game {
  private readonly world = new World();
  private readonly camera = new Camera();
  private readonly renderer: Renderer;
  private readonly input = new InputSystem();
  private readonly movement = new MovementSystem();
  private readonly collision = new CollisionSystem();
  private readonly foodSystem = new FoodSystem();
  private readonly botController = new BotController();
  private readonly achievements = new AchievementManager();

  private state: GameState = "playing";
  private lastTime = 0;
  private animationId = 0;
  private onGameOver: ((score: number, position: number) => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
  }

  setOnGameOver(callback: (score: number, position: number) => void): void {
    this.onGameOver = callback;
  }

  restart(): void {
    this.resetGame();
  }

  setBoostButtonHeld(held: boolean): void {
    this.input.setExternalBoost(held);
  }

  start(): void {
    this.renderer.resize();
    this.camera.setViewport(this.canvas.width, this.canvas.height);
    this.input.attach(this.canvas, this.camera);
    this.resetGame();

    window.addEventListener("resize", () => {
      this.renderer.resize();
      this.camera.setViewport(this.canvas.width, this.canvas.height);
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" && this.state === "gameover") {
        this.resetGame();
      }
    });

    this.canvas.addEventListener("click", () => {
      if (this.state === "gameover") {
        this.resetGame();
      }
    });

    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.loop);
  }

  private resetGame(): void {
    this.world.snakes.length = 0;
    this.world.foods.length = 0;
    this.world.playerStats.survivalMs = 0;
    this.state = "playing";
    this.botController.reset();

    const playerSpawn = this.world.findSpawnPosition();
    const player = new Snake(
      playerSpawn.x,
      playerSpawn.y,
      playerSpawn.angle,
      "Voce",
      "#5dade2",
      true,
      "#1b4f72",
      GAME_CONFIG.snakeSpeed * GAME_CONFIG.playerSpeedMultiplier,
    );
    this.world.snakes.push(player);
    this.world.player = player;

    const typeCounts: Record<PersonalityType, number> = { glutton: 0, coward: 0, evil: 0 };

    for (let i = 0; i < GAME_CONFIG.botCount; i++) {
      const type = BOT_PERSONALITY_ORDER[i % BOT_PERSONALITY_ORDER.length]!;
      const personality = PERSONALITIES[type];
      const index = typeCounts[type]++;
      const name = personality.names[index % personality.names.length] ?? `Bot ${i + 1}`;
      const color = personality.colors[index % personality.colors.length] ?? "#3498db";

      const spawn = this.world.findSpawnPosition();
      const bot = new Snake(
        spawn.x,
        spawn.y,
        spawn.angle,
        name,
        color,
        false,
        color,
        GAME_CONFIG.snakeSpeed * personality.speedMultiplier,
      );
      this.world.snakes.push(bot);
      this.botController.registerStrategy(bot, createStrategy(type));
    }

    this.foodSystem.populate(this.world);
  }

  private loop = (now: number): void => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt, now);
    this.render(now);

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, now: number): void {
    this.world.dayNight.update(dt);
    this.world.totalElapsedMs += dt * 1000;
    this.world.events.update(this.world, now);
    this.world.killFeed.update(now);

    if (this.state !== "playing") {
      if (this.world.player) {
        this.camera.follow(this.world.player.x, this.world.player.y);
      }
      return;
    }

    const player = this.world.player;
    if (player?.alive) {
      player.targetAngle = this.input.updatePlayerDirection(
        player.x,
        player.y,
        player.angle,
      );
      player.boosting =
        this.input.isBoosting() &&
        player.segmentCount > GAME_CONFIG.initialSegments;
    }

    this.handleRespawns(now);
    this.botController.update(this.world, now);

    for (const snake of this.world.snakes) {
      const tailBefore = snake.boosting
        ? snake.getSegmentPositions().at(-1)
        : undefined;
      const segmentsBefore = snake.segmentCount;

      this.movement.updateSnake(snake, dt);

      const segmentsLost = segmentsBefore - snake.segmentCount;
      if (tailBefore && segmentsLost > 0) {
        for (let i = 0; i < segmentsLost; i++) {
          this.foodSystem.spawnBoostDrop(this.world, snake, tailBefore);
        }
      }
    }

    this.foodSystem.collectFood(this.world);

    const deaths = this.collision.checkSnakeCollisions(this.world);
    for (const { snake, killer } of deaths) {
      this.foodSystem.spawnDeathDrops(this.world, snake);

      if (killer) {
        this.world.killFeed.push(killer.name, killer.color, snake.name, now);
      }

      if (killer?.isPlayer) {
        this.world.playerStats.kills++;
      }

      if (snake.isPlayer) {
        this.state = "gameover";
        const ranking = this.world.getRanking();
        const position = ranking.findIndex((s) => s.id === snake.id) + 1;
        this.onGameOver?.(snake.score, position);
      } else {
        const spawn = this.world.findSpawnPosition();
        snake.reset(spawn.x, spawn.y, spawn.angle, GAME_CONFIG.botRespawnDelayMs);
      }
    }

    if (player?.alive) {
      this.world.playerStats.survivalMs += dt * 1000;
    }

    this.achievements.update(this.world.playerStats, now);

    if (player) {
      this.camera.follow(player.x, player.y);
    }
  }

  private handleRespawns(now: number): void {
    for (const snake of this.world.snakes) {
      if (snake.alive || snake.isPlayer) continue;
      if (snake.respawnAt > 0 && now >= snake.respawnAt) {
        const spawn = this.world.findSpawnPosition();
        snake.reset(spawn.x, spawn.y, spawn.angle);
      }
    }
  }

  private render(now: number): void {
    const lightLevel = this.world.dayNight.lightLevel;
    this.renderer.clear(this.world, lightLevel);
    this.renderer.renderWorld(this.world, this.camera, lightLevel, now);
    this.renderer.renderHud(this.world, this.state, this.achievements);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationId);
  }
}
