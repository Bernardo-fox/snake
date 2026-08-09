export class DayNightCycle {
  private elapsedMs = 0;

  constructor(private readonly cycleDurationMs: number) {}

  update(dt: number): void {
    this.elapsedMs = (this.elapsedMs + dt * 1000) % this.cycleDurationMs;
  }

  get phase(): number {
    return this.elapsedMs / this.cycleDurationMs;
  }

  /** 0 = full night, 1 = full day, smoothly cycling. */
  get lightLevel(): number {
    return (Math.cos(this.phase * Math.PI * 2) + 1) / 2;
  }

  get isNight(): boolean {
    return this.lightLevel < 0.35;
  }
}
