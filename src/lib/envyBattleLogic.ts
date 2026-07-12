export type BattlePhase =
  | "battleIntro"
  | "actionMenu"
  | "playerAction"
  | "itemSubmenu"
  | "envyTurn"
  | "dodge"
  | "victory"
  | "defeat"
  | "fled"
  | "ending"
  | "finalBlow";

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  dir: "up" | "down" | "left" | "right";
  type: "face" | "arm";
}

export const ENVY_MAX_HP = 32;
export const PLAYER_MAX_HP = 30;
export const LUTAR_DANO_BASE = 5;
export const ENVY_DEF_BASE = 15;
export const DANO_ESQUIVA = 5;
export const DODGE_DURATION_MS = 21000;
export const HEART_SIZE = 20;
export const DODGE_BOX_W = 400;
export const DODGE_BOX_H = 300;
export const INVINCIBLE_MS = 500;

export const BATTLE_INTRO_FALA: Record<string, string[]> = {
  pt: [
    "* Envy bloqueia seu caminho com um sorriso provocador.",
    "Um Hom\u00fanculo consumido pela inveja. Odeia a capacidade humana de criar conex\u00f5es verdadeiras.",
  ],
  en: [
    "* Envy blocks your path with a provoking smile.",
    "A Homunculus consumed by envy. Hates the human ability to create true bonds.",
  ],
};

export const ENVY_TURN_VARIACOES: Record<string, string[][]> = {
  pt: [
    ["Envy sorri de forma perturbadora.", "Voc\u00ea v\u00ea rostos familiares observando voc\u00ea..."],
    ["O ar fica pesado ao redor de Envy.", "Sombras come\u00e7am a tomar forma."],
    ["Envy revira os olhos, entediado.", "As paredes parecem ganhar vida."],
  ],
  en: [
    ["Envy smiles disturbingly.", "You see familiar faces watching you..."],
    ["The air grows heavy around Envy.", "Shadows begin to take shape."],
    ["Envy rolls his eyes, bored.", "The walls seem to come alive."],
  ],
};

export const LUTAR_VARIACOES: Record<string, string[][]> = {
  pt: [
    ["Voc\u00ea tentou acertar Envy.", "Ele riu e assumiu a apar\u00eancia de outra pessoa."],
    ["Voc\u00ea avança com um golpe r\u00e1pido.", "Envy desvia parcialmente, mas sente o impacto."],
    ["Voc\u00ea ataca com tudo!", "Envy cambaleia, mas ainda sorri."],
  ],
  en: [
    ["You tried to hit Envy.", "He laughed and took on the appearance of someone else."],
    ["You strike with a quick blow.", "Envy dodges partially, but feels the impact."],
    ["You attack with all your might!", "Envy staggers, but still smiles."],
  ],
};

export const BLEFAR_FALA: Record<string, Record<string, string[]>> = {
  stage1: {
    pt: [
      "Voc\u00ea diz que sabe o quanto Envy inveja os humanos.",
      "Envy fica irritado. (DEF: 15 \u2192 12)",
      "CALE A BOCA!",
    ],
    en: [
      "You say you know how much Envy envies humans.",
      "Envy gets irritated. (DEF: 15 \u2192 12)",
      "SHUT UP!",
    ],
  },
  stage2: {
    pt: [
      "Voc\u00ea diz a Envy que a forma humana dele parece rid\u00edcula. (ATK: 18 \u2192 20, DEF: 12 \u2192 9)",
      "O qu\u00ea?! Voc\u00ea n\u00e3o sabe nada sobre moda, seu verme caipira!",
    ],
    en: [
      "You tell Envy his human form looks ridiculous. (ATK: 18 \u2192 20, DEF: 12 \u2192 9)",
      "What?! You don't know anything about fashion, you hick worm!",
    ],
  },
  stage3: {
    pt: [
      "Voc\u00ea afirma que os humanos conseguem criar la\u00e7os verdadeiros. (ATK: 20 \u2192 15)",
      "Envy hesita por um momento.",
    ],
    en: [
      "You claim that humans can create true bonds. (ATK: 20 \u2192 15)",
      "Envy hesitates for a moment.",
    ],
  },
  done: {
    pt: ["Envy n\u00e3o parece reagir a mais nada que voc\u00ea diga."],
    en: ["Envy doesn't seem to react to anything else you say."],
  },
};

export const FUGIR_FAIL_FALA: Record<string, string[]> = {
  pt: ["Voc\u00ea tentou fugir...", "Envy bloqueou sua passagem."],
  en: ["You tried to flee...", "Envy blocked your path."],
};

export const FUGIR_OK_FALA: Record<string, string[]> = {
  pt: ["Voc\u00ea se afasta lentamente.", "Envy n\u00e3o parece interessado em perseguir voc\u00ea."],
  en: ["You slowly step away.", "Envy doesn't seem interested in chasing you."],
};

export const FINAL_BLOW_FALA: Record<string, string[]> = {
  pt: [
    "Você desfere o golpe final!",
    "Envy cambaleia, sua forma começa a tremer descontroladamente.",
    "Envy: Não... isso não pode... estar acontecendo...",
    "Envy grita e se desfaz em fumaça negra diante dos seus olhos.",
  ],
  en: [
    "You land the final blow!",
    "Envy staggers, his form beginning to tremble uncontrollably.",
    "Envy: No... this can't... be happening...",
    "Envy screams and dissolves into black smoke before your eyes.",
  ],
};

export const ITEM_POCAO_FALA: Record<string, string[]> = {
  pt: ["Voc\u00ea usou uma Po\u00e7\u00e3o. Recuperou 20 HP!"],
  en: ["You used a Potion. Restored 20 HP!"],
};

export const ITEM_ELIXIR_FALA: Record<string, string[]> = {
  pt: ["Voc\u00ea usou um Elixir. HP totalmente recuperado!"],
  en: ["You used an Elixir. HP fully restored!"],
};

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calcularDanoLutar(envyDefAtual: number): number {
  const bonus = ENVY_DEF_BASE - envyDefAtual;
  return LUTAR_DANO_BASE + bonus;
}
