const STORAGE_KEY = "snakeBotsAchievements";
const BANNER_DURATION_MS = 4000;

export interface PlayerStats {
  foodEaten: number;
  kills: number;
  survivalMs: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  check: (stats: PlayerStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "survive10min",
    title: "Sobreviveu 10 minutos",
    check: (stats) => stats.survivalMs >= 10 * 60 * 1000,
  },
  {
    id: "eat500food",
    title: "Comeu 500 comidas",
    check: (stats) => stats.foodEaten >= 500,
  },
  {
    id: "kill20snakes",
    title: "Eliminou 20 cobras",
    check: (stats) => stats.kills >= 20,
  },
];

function loadUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveUnlocked(unlocked: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {
    // storage unavailable (e.g. private browsing) — unlocks just won't persist
  }
}

export class AchievementManager {
  private readonly unlocked: Set<string>;
  private readonly queue: string[] = [];

  bannerText: string | null = null;
  private bannerUntil = 0;

  constructor() {
    this.unlocked = loadUnlocked();
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  get unlockedCount(): number {
    return this.unlocked.size;
  }

  update(stats: PlayerStats, now: number): void {
    for (const def of ACHIEVEMENTS) {
      if (!this.unlocked.has(def.id) && def.check(stats)) {
        this.unlocked.add(def.id);
        this.queue.push(def.title);
        saveUnlocked(this.unlocked);
      }
    }

    if (this.bannerText !== null && now >= this.bannerUntil) {
      this.bannerText = null;
    }

    if (this.bannerText === null && this.queue.length > 0) {
      this.bannerText = `Conquista desbloqueada: ${this.queue.shift()}`;
      this.bannerUntil = now + BANNER_DURATION_MS;
    }
  }
}
