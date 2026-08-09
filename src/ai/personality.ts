export type PersonalityType = "glutton" | "coward" | "evil";

export interface Personality {
  type: PersonalityType;
  names: string[];
  colors: string[];
  speedMultiplier: number;
  visionRadius: number;
  secondaryVisionRadius: number;
  aggressiveness: number;
}

export const PERSONALITIES: Record<PersonalityType, Personality> = {
  glutton: {
    type: "glutton",
    names: ["Guloso", "Faminto", "Ganancioso", "Devorador"],
    colors: ["#f39c12", "#e67e22", "#f1c40f", "#d35400"],
    speedMultiplier: 1,
    visionRadius: 500,
    secondaryVisionRadius: 500,
    aggressiveness: 0.4,
  },
  coward: {
    type: "coward",
    names: ["Medroso", "Fujao", "Assustado", "Tremulo"],
    colors: ["#a3e4d7", "#82e0aa", "#f9e79f", "#d7bde2"],
    speedMultiplier: 1.15,
    visionRadius: 450,
    secondaryVisionRadius: 250,
    aggressiveness: 0.1,
  },
  evil: {
    type: "evil",
    names: ["Assassino", "Cruel", "Predador"],
    colors: ["#c0392b", "#922b21", "#1c2833"],
    speedMultiplier: 1.25,
    visionRadius: 600,
    secondaryVisionRadius: 300,
    aggressiveness: 0.85,
  },
};

export const BOT_PERSONALITY_ORDER: PersonalityType[] = [
  "glutton",
  "glutton",
  "glutton",
  "glutton",
  "coward",
  "coward",
  "coward",
  "coward",
  "evil",
  "evil",
  "evil",
];
