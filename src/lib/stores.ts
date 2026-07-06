import { writable } from "svelte/store";

export const language = writable<"pt" | "en">("pt");
export const volume = writable<number>(0.1);

// 「 ✦ TOCADOR DE MÚSICA CENTRAL ✦ 」
// Guarda a música tocando atualmente, pra ela sobreviver à troca de rota
let currentAudio: HTMLAudioElement | null = null;

export function playMusic(src: string, loop: boolean = true) {
  if (currentAudio) {
    currentAudio.pause();
  }
  currentAudio = new Audio(src);
  currentAudio.loop = loop;
  volume.subscribe((v) => {
    if (currentAudio) currentAudio.volume = v;
  })();
  currentAudio.play();
}

export function stopMusic() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// ─── Save system ───

const SAVE_KEY = "fullmetal_save";

export function saveProgress(progress: string) {
  localStorage.setItem(SAVE_KEY, progress);
}

export function loadProgress(): string | null {
  return localStorage.getItem(SAVE_KEY);
}

export function clearProgress() {
  localStorage.removeItem(SAVE_KEY);
}