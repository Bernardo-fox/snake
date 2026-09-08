const MESSAGE_DURATION_MS = 4500;
const MAX_MESSAGES = 5;

export interface KillMessage {
  text: string;
  color: string;
  expiresAt: number;
}

export class KillFeed {
  private messages: KillMessage[] = [];

  push(killerName: string, killerColor: string, victimName: string, now: number): void {
    this.messages.push({
      text: `${killerName} eliminou ${victimName}`,
      color: killerColor,
      expiresAt: now + MESSAGE_DURATION_MS,
    });

    if (this.messages.length > MAX_MESSAGES) {
      this.messages.shift();
    }
  }

  update(now: number): void {
    if (this.messages.length === 0) return;
    this.messages = this.messages.filter((message) => message.expiresAt > now);
  }

  getVisible(): readonly KillMessage[] {
    return this.messages;
  }
}
