import { writable, get } from "svelte/store";

export const language = writable<"pt" | "en">("pt");
export const volume = writable<number>(0.1);

let currentAudio: HTMLAudioElement | null = null;

volume.subscribe((v: number): void => {
  if (currentAudio) currentAudio.volume = v;
});

export function playMusic(src: string, loop: boolean = true): void {
  if (currentAudio) {
    currentAudio.pause();
  }
  currentAudio = new Audio(src);
  currentAudio.loop = loop;
  currentAudio.volume = get(volume);
  currentAudio.play();
}

export function stopMusic(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// ─── Save system ───

const SAVE_KEY: string = "fullmetal_save";

export function saveProgress(progress: string): void {
  localStorage.setItem(SAVE_KEY, progress);
}

export function loadProgress(): string | null {
  return localStorage.getItem(SAVE_KEY);
}

export function clearProgress(): void {
  localStorage.removeItem(SAVE_KEY);
}
