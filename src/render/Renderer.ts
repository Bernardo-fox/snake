import { GAME_CONFIG } from "../config/gameConfig";
import { ACHIEVEMENTS, type AchievementManager } from "../core/Achievements";
import type { Camera } from "../core/Camera";
import type { World } from "../core/World";
import type { Food } from "../entities/Food";
import type { Snake } from "../entities/Snake";
import { lerpColor, lerpPalette } from "../utils/color";
import { clamp } from "../utils/math";

export type GameState = "playing" | "gameover";

const DAY_BG_PALETTE = ["#141d2b", "#241a35", "#0f2530", "#2b1a20"];
const NIGHT_BG_PALETTE = ["#05070c", "#0c0714", "#03090c", "#0e0509"];
const NIGHT_GRID = "#0a0e14";
const DAY_GRID = "#1f2937";
const NIGHT_BORDER = "#3a5f8a";
const DAY_BORDER = "#58a6ff";

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
  }

  resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  clear(world: World, lightLevel: number): void {
    const ambientPhase = world.totalElapsedMs / GAME_CONFIG.ambientColorCycleMs;
    const dayTone = lerpPalette(DAY_BG_PALETTE, ambientPhase);
    const nightTone = lerpPalette(NIGHT_BG_PALETTE, ambientPhase);

    this.ctx.fillStyle = lerpColor(nightTone, dayTone, lightLevel);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderWorld(world: World, camera: Camera, lightLevel: number, now: number): void {
    this.drawBackground(camera, lightLevel);
    this.drawBorder(world, camera, lightLevel);

    for (const food of world.foods) {
      if (camera.isVisible(food.x, food.y, food.radius)) {
        this.drawFood(food, camera, now);
      }
    }

    const leader = world.getLeader();

    for (const snake of world.snakes) {
      if (snake.alive) {
        this.drawSnake(snake, camera, snake.id === leader?.id);
      }
    }

    if (world.events.fogActive) {
      this.drawFog();
    }
  }

  renderHud(world: World, state: GameState, achievements: AchievementManager): void {
    const player = world.player;
    if (!player) return;

    this.ctx.save();
    this.ctx.fillStyle = "rgba(13, 17, 23, 0.75)";
    this.ctx.fillRect(16, 16, 220, 134);
    this.ctx.strokeStyle = "#30363d";
    this.ctx.strokeRect(16, 16, 220, 134);

    this.ctx.fillStyle = "#f0f6fc";
    this.ctx.font = "16px system-ui, sans-serif";
    this.ctx.fillText(`Score: ${player.score}`, 28, 42);
    this.ctx.fillText(`Tamanho: ${player.segmentCount}`, 28, 66);
    this.ctx.fillText(
      player.alive ? "Status: Vivo" : "Status: Morto",
      28,
      90,
    );

    this.ctx.fillStyle = player.boosting ? "#58a6ff" : "#8b949e";
    this.ctx.font = "13px system-ui, sans-serif";
    this.ctx.fillText(
      player.boosting ? "Impulso ativo!" : "Segure Espaco/clique: Impulso",
      28,
      110,
    );

    this.ctx.fillStyle = "#c4a7f0";
    this.ctx.fillText(
      `Conquistas: ${achievements.unlockedCount}/${ACHIEVEMENTS.length}`,
      28,
      130,
    );

    this.renderRanking(world);
    this.renderDayNightIndicator(world);
    this.renderEventBanner(world);
    this.renderAchievementBanner(achievements);

    if (state === "gameover") {
      this.renderGameOver(world);
    }

    this.ctx.restore();
  }

  private renderDayNightIndicator(world: World): void {
    const isNight = world.dayNight.isNight;
    const label = isNight ? "Noite" : "Dia";
    const width = 100;
    const x = this.canvas.width / 2 - width / 2;
    const y = 16;

    this.ctx.fillStyle = "rgba(13, 17, 23, 0.75)";
    this.ctx.fillRect(x, y, width, 36);
    this.ctx.strokeStyle = "#30363d";
    this.ctx.strokeRect(x, y, width, 36);

    this.ctx.fillStyle = isNight ? "#8ab4f8" : "#f4d35e";
    this.ctx.font = "bold 15px system-ui, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(label, x + width / 2, y + 24);
    this.ctx.textAlign = "start";
  }

  private renderEventBanner(world: World): void {
    const text = world.events.bannerText;
    if (!text) return;

    this.ctx.font = "bold 16px system-ui, sans-serif";
    const textWidth = this.ctx.measureText(text).width;
    const boxWidth = textWidth + 40;
    const x = this.canvas.width / 2 - boxWidth / 2;
    const y = 60;

    this.ctx.fillStyle = "rgba(13, 17, 23, 0.85)";
    this.ctx.fillRect(x, y, boxWidth, 36);
    this.ctx.strokeStyle = "#f4d35e";
    this.ctx.strokeRect(x, y, boxWidth, 36);

    this.ctx.fillStyle = "#f4d35e";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, this.canvas.width / 2, y + 24);
    this.ctx.textAlign = "start";
  }

  private renderAchievementBanner(achievements: AchievementManager): void {
    const text = achievements.bannerText;
    if (!text) return;

    this.ctx.font = "bold 16px system-ui, sans-serif";
    const textWidth = this.ctx.measureText(text).width;
    const boxWidth = textWidth + 40;
    const x = this.canvas.width / 2 - boxWidth / 2;
    const y = 104;

    this.ctx.fillStyle = "rgba(13, 17, 23, 0.85)";
    this.ctx.fillRect(x, y, boxWidth, 36);
    this.ctx.strokeStyle = "#c4a7f0";
    this.ctx.strokeRect(x, y, boxWidth, 36);

    this.ctx.fillStyle = "#c4a7f0";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, this.canvas.width / 2, y + 24);
    this.ctx.textAlign = "start";
  }

  private renderRanking(world: World): void {
    const alive = world.getRanking().filter((snake) => snake.alive).slice(0, 5);
    const leader = world.getLeader();

    this.ctx.fillStyle = "rgba(13, 17, 23, 0.75)";
    this.ctx.fillRect(this.canvas.width - 236, 16, 220, 140);
    this.ctx.strokeStyle = "#30363d";
    this.ctx.strokeRect(this.canvas.width - 236, 16, 220, 140);

    this.ctx.fillStyle = "#f0f6fc";
    this.ctx.font = "bold 16px system-ui, sans-serif";
    this.ctx.fillText("Top 5", this.canvas.width - 220, 42);

    this.ctx.font = "14px system-ui, sans-serif";
    alive.forEach((snake, index) => {
      const isLeader = snake.id === leader?.id;
      const textX = this.canvas.width - 220 + (isLeader ? 20 : 0);
      const label = `${index + 1}. ${snake.name} (${snake.score})`;
      this.ctx.fillStyle = snake.isPlayer ? "#58a6ff" : "#c9d1d9";
      this.ctx.fillText(label, textX, 66 + index * 22);

      if (isLeader) {
        this.drawCrown(this.canvas.width - 226, 61 + index * 22, 6);
      }
    });
  }

  private renderGameOver(world: World): void {
    if (!world.player) return;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground(camera: Camera, lightLevel: number): void {
    const gridSize = 80;
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;

    this.ctx.strokeStyle = lerpColor(NIGHT_GRID, DAY_GRID, lightLevel);
    this.ctx.lineWidth = 1;

    for (let x = startX; x < camera.x + camera.width; x += gridSize) {
      const screen = camera.worldToScreen(x, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(screen.x, 0);
      this.ctx.lineTo(screen.x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = startY; y < camera.y + camera.height; y += gridSize) {
      const screen = camera.worldToScreen(0, y);
      this.ctx.beginPath();
      this.ctx.moveTo(0, screen.y);
      this.ctx.lineTo(this.canvas.width, screen.y);
      this.ctx.stroke();
    }
  }

  private drawBorder(world: World, camera: Camera, lightLevel: number): void {
    const topLeft = camera.worldToScreen(0, 0);
    const bottomRight = camera.worldToScreen(world.width, world.height);
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.rect(topLeft.x, topLeft.y, width, height);
    this.ctx.clip("evenodd");
    this.ctx.fillStyle = `rgba(0, 0, 0, ${0.35 + (1 - lightLevel) * 0.25})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.ctx.strokeStyle = lerpColor(NIGHT_BORDER, DAY_BORDER, lightLevel);
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(topLeft.x, topLeft.y, width, height);
  }

  private drawFog(): void {
    this.ctx.fillStyle = "rgba(190, 200, 210, 0.16)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawFood(food: Food, camera: Camera, now: number): void {
    const screen = camera.worldToScreen(food.x, food.y);

    const radius = food.radius * camera.zoom;

    if (food.spawnedAt > 0) {
      const progress = clamp((now - food.spawnedAt) / GAME_CONFIG.foodRainGlowMs, 0, 1);

      if (progress < 1) {
        this.ctx.strokeStyle = `rgba(88, 214, 141, ${(1 - progress) * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y, radius + 4 + progress * 16, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    if (food.type === "drop") {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      this.ctx.beginPath();
      this.ctx.arc(screen.x, screen.y, radius + 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (food.type === "giant") {
      this.ctx.fillStyle = "rgba(255, 213, 79, 0.25)";
      this.ctx.beginPath();
      this.ctx.arc(screen.x, screen.y, radius + 8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = food.color;
    this.ctx.beginPath();
    this.ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawCrown(x: number, y: number, size: number): void {
    const w = size * 2;
    const h = size * 1.3;
    const topY = y - h / 2;
    const baseY = y + h / 2;

    this.ctx.fillStyle = "#ffd54f";
    this.ctx.strokeStyle = "#c9971f";
    this.ctx.lineWidth = Math.max(1, size * 0.12);
    this.ctx.beginPath();
    this.ctx.moveTo(x - w / 2, baseY);
    this.ctx.lineTo(x - w / 2, topY + h * 0.45);
    this.ctx.lineTo(x - w / 4, topY + h * 0.75);
    this.ctx.lineTo(x, topY);
    this.ctx.lineTo(x + w / 4, topY + h * 0.75);
    this.ctx.lineTo(x + w / 2, topY + h * 0.45);
    this.ctx.lineTo(x + w / 2, baseY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawSnake(snake: Snake, camera: Camera, isLeader: boolean): void {
    const segments = snake.getSegmentPositions();

    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i]!;
      const worldRadius =
        i === 0 ? GAME_CONFIG.headRadius : GAME_CONFIG.segmentRadius;

      if (!camera.isVisible(segment.x, segment.y, worldRadius)) continue;

      const screen = camera.worldToScreen(segment.x, segment.y);
      const radius = worldRadius * camera.zoom;

      const t = segments.length > 1 ? i / (segments.length - 1) : 0;
      this.ctx.fillStyle = lerpColor(snake.headColor, snake.color, t);
      this.ctx.beginPath();
      this.ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      if (i === 0) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(
          screen.x + Math.cos(snake.angle) * 4 * camera.zoom,
          screen.y + Math.sin(snake.angle) * 4 * camera.zoom,
          3 * camera.zoom,
          0,
          Math.PI * 2,
        );
        this.ctx.fill();
      }
    }

    if (camera.isVisible(snake.x, snake.y, GAME_CONFIG.headRadius)) {
      const headScreen = camera.worldToScreen(snake.x, snake.y);
      this.ctx.fillStyle = snake.isPlayer ? "#ffffff" : "#d0d7de";
      this.ctx.font = "bold 13px system-ui, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(snake.name, headScreen.x, headScreen.y - 18);
      this.ctx.textAlign = "start";

      if (isLeader) {
        this.drawCrown(headScreen.x, headScreen.y - 34 * camera.zoom, 8 * camera.zoom);
      }
    }
  }
}
