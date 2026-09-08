import type { Camera } from "../core/Camera";
import { angleBetween } from "../utils/math";

export class InputSystem {
  private screenX = 0;
  private screenY = 0;
  private hasPointer = false;
  private camera: Camera | null = null;

  private mouseHeld = false;
  private spaceHeld = false;
  private externalBoostHeld = false;

  attach(canvas: HTMLCanvasElement, camera: Camera): void {
    this.camera = camera;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      this.screenX = clientX - rect.left;
      this.screenY = clientY - rect.top;
      this.hasPointer = true;
    };

    canvas.addEventListener("mousemove", (event) => {
      updatePointer(event.clientX, event.clientY);
    });

    canvas.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      updatePointer(event.clientX, event.clientY);
      this.mouseHeld = true;
    });

    window.addEventListener("mouseup", () => {
      this.mouseHeld = false;
    });

    canvas.addEventListener(
      "touchmove",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        event.preventDefault();
        updatePointer(touch.clientX, touch.clientY);
      },
      { passive: false },
    );

    canvas.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY);
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        this.spaceHeld = true;
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        this.spaceHeld = false;
      }
    });
  }

  setExternalBoost(held: boolean): void {
    this.externalBoostHeld = held;
  }

  isBoosting(): boolean {
    return this.mouseHeld || this.spaceHeld || this.externalBoostHeld;
  }

  updatePlayerDirection(
    playerX: number,
    playerY: number,
    currentAngle: number,
  ): number {
    if (!this.hasPointer || !this.camera) return currentAngle;
    const world = this.camera.screenToWorld(this.screenX, this.screenY);
    return angleBetween({ x: playerX, y: playerY }, world);
  }
}
