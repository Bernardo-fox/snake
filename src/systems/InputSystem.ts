import type { Camera } from "../core/Camera";
import { angleBetween } from "../utils/math";

export class InputSystem {
  private screenX = 0;
  private screenY = 0;
  private hasPointer = false;
  private camera: Camera | null = null;

  private mouseHeld = false;
  private spaceHeld = false;
  private touchHeld = false;

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
      this.touchHeld = true;
    });

    canvas.addEventListener("touchend", () => {
      this.touchHeld = false;
    });

    canvas.addEventListener("touchcancel", () => {
      this.touchHeld = false;
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

  isBoosting(): boolean {
    return this.mouseHeld || this.touchHeld || this.spaceHeld;
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
