import { GAME_CONFIG } from "../config/gameConfig";

export class Camera {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  readonly zoom = GAME_CONFIG.cameraZoom;

  setViewport(screenWidth: number, screenHeight: number): void {
    this.width = screenWidth / this.zoom;
    this.height = screenHeight / this.zoom;
  }

  follow(targetX: number, targetY: number): void {
    const targetCamX = targetX - this.width / 2;
    const targetCamY = targetY - this.height / 2;

    this.x += (targetCamX - this.x) * GAME_CONFIG.cameraLerp;
    this.y += (targetCamY - this.y) * GAME_CONFIG.cameraLerp;
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom,
    };
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX / this.zoom + this.x,
      y: screenY / this.zoom + this.y,
    };
  }

  isVisible(worldX: number, worldY: number, radius = 0): boolean {
    return (
      worldX + radius >= this.x &&
      worldX - radius <= this.x + this.width &&
      worldY + radius >= this.y &&
      worldY - radius <= this.y + this.height
    );
  }
}
