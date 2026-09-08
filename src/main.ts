import { ACHIEVEMENTS, AchievementManager } from "./core/Achievements";
import { Game } from "./core/Game";

const canvasEl = document.getElementById("game");

if (!(canvasEl instanceof HTMLCanvasElement)) {
  throw new Error("Canvas element #game not found");
}

const canvas: HTMLCanvasElement = canvasEl;

const menuOverlay = document.getElementById("menu-overlay");
const playButton = document.getElementById("play-button");
const achievementsList = document.getElementById("achievements-list");
const achievementsCount = document.getElementById("achievements-count");

const gameoverOverlay = document.getElementById("gameover-overlay");
const gameoverScore = document.getElementById("gameover-score");
const gameoverPosition = document.getElementById("gameover-position");
const restartButton = document.getElementById("restart-button");
const menuButton = document.getElementById("menu-button");
const boostButton = document.getElementById("boost-button");

let game: Game | null = null;

function renderMenuAchievements(): void {
  const achievements = new AchievementManager();

  if (achievementsCount) {
    achievementsCount.textContent = `${achievements.unlockedCount}/${ACHIEVEMENTS.length}`;
  }

  if (achievementsList) {
    achievementsList.innerHTML = "";
    for (const def of ACHIEVEMENTS) {
      const unlocked = achievements.isUnlocked(def.id);
      const item = document.createElement("li");
      item.className = unlocked ? "unlocked" : "";
      item.innerHTML = `<span class="badge">${unlocked ? "✓" : "\u{1F512}"}</span>${def.title}`;
      achievementsList.appendChild(item);
    }
  }
}

function showMenu(): void {
  renderMenuAchievements();
  gameoverOverlay?.classList.add("hidden");
  menuOverlay?.classList.remove("hidden");
}

function showGameOver(score: number, position: number): void {
  if (gameoverScore) gameoverScore.textContent = String(score);
  if (gameoverPosition) gameoverPosition.textContent = `#${position}`;
  gameoverOverlay?.classList.remove("hidden");
}

function startGame(): void {
  menuOverlay?.classList.add("hidden");
  gameoverOverlay?.classList.add("hidden");

  if (!game) {
    game = new Game(canvas);
    game.setOnGameOver(showGameOver);
    game.start();
    (window as any).__debugGame = game;
  } else {
    game.restart();
  }
}

renderMenuAchievements();

playButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);

menuButton?.addEventListener("click", () => {
  gameoverOverlay?.classList.add("hidden");
  showMenu();
});

function setBoostHeld(held: boolean): void {
  game?.setBoostButtonHeld(held);
  boostButton?.classList.toggle("active", held);
}

boostButton?.addEventListener(
  "touchstart",
  (event) => {
    event.preventDefault();
    setBoostHeld(true);
  },
  { passive: false },
);
boostButton?.addEventListener("touchend", () => setBoostHeld(false));
boostButton?.addEventListener("touchcancel", () => setBoostHeld(false));
boostButton?.addEventListener("mousedown", () => setBoostHeld(true));
boostButton?.addEventListener("mouseup", () => setBoostHeld(false));
boostButton?.addEventListener("mouseleave", () => setBoostHeld(false));
