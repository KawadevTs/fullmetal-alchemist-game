<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import "../../assets/styles/fase1.css";
  import { language, stopMusic, playMusic } from "$lib/stores";

  // ─── Constantes ─────────────────────────────────
  const WORLD_W = 1690;
  const SPEED = 4;
  const WINRY_X = 700;
  const VOVO_X = 1100;
  const PORTAL_X = 1580;
  const DIALOGUE_RANGE = 65;
  const WALK_RIGHT = "/images/fase1/edward_walk.png";
  const WALK_LEFT = "/images/fase1/edwardC.png";
  const IDLE = "/images/fase1/edward.png";

  const FALA: Record<string, string[]> = {
    pt: [
      "Winry: Edward! Você está bem? Fiquei preocupada.",
      "Edward: Estou bem, Winry. Suas peças estão funcionando perfeitamente.",
      "Winry: Que bom... Cuidado com o que está por vir, ouviu?",
    ],
    en: [
      "Winry: Edward! Are you okay? I was so worried.",
      "Edward: I'm fine, Winry. Your auto-mail is working perfectly.",
      "Winry: Good... Be careful of what lies ahead, okay?",
    ],
  };

  const VOVO_FALA: Record<string, string[]> = {
    pt: [
      "Vovó: Então... vocês chegaram até aqui. Eu tinha esperança de que encontrassem respostas, mas este lugar guarda mais mentiras do que verdades.",
      "Edward: Não importa. Se existir qualquer pista sobre a Pedra Filosofal, nós vamos encontrá-la.",
      "Edward: Mesmo que seja perigoso.",
      "Uma risada ecoa pelas ruínas.",
    ],
    en: [
      "Grandma: So... you've made it this far. I hoped you'd find answers here, but this place holds more lies than truths.",
      "Edward: It doesn't matter. If there's any clue about the Philosopher's Stone, we'll find it.",
      "Edward: Even if it's dangerous.",
      "A laugh echoes through the ruins.",
    ],
  };

  const PORTAL_FALA: Record<string, string[]> = {
    pt: ["Edward: Esse portal... eu conheço ele."],
    en: ["Edward: This portal... I know it."],
  };

  // ─── Estado ────────────────────────────────────
  let playerX = $state(100);
  let scrollX = $state(0);
  let walking = $state(false);
  let sprite = $state(IDLE);
  let inDialogue = $state(false);
  let dialLines = $state<string[]>([]);
  let dialIdx = $state(0);
  let typed = $state("");
  let charIdx = $state(0);
  let metWinry = $state(false);
  let metVovo = $state(false);
  let passedPortal = $state(false);
  let fading = $state(false);
  let inPortalThought = $state(false);
  let dialogueSource = $state<"winry" | "vovo" | "portal">("winry");
  let lang = $state("pt");
  let vw = $state(0);

  let facingRight = $state(true);
  let typeTimer: ReturnType<typeof setInterval> | null = null;
  let raf = 0;
  let right = $state(false);
  let left = $state(false);

  const unsub = language.subscribe((v) => lang = v);

  // ─── Eventos de teclado ────────────────────────
  function kd(e: KeyboardEvent) {
    if (inDialogue || inPortalThought) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); adv(); }
      return;
    }
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") { e.preventDefault(); right = true; facingRight = true; }
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") { e.preventDefault(); left = true; facingRight = false; }
  }
  function ku(e: KeyboardEvent) {
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") { e.preventDefault(); right = false; }
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") { e.preventDefault(); left = false; }
  }

  // ─── Game loop ─────────────────────────────────
  function loop() {
    walking = false;

    if (!inDialogue && !inPortalThought && !fading) {
      if (right) { playerX = Math.min(playerX + SPEED, PORTAL_X); walking = true; }
      if (left) { playerX = Math.max(playerX - SPEED, 0); walking = true; }
    }

    // Sprite: WALK_RIGHT (D) ou WALK_LEFT (A), IDLE quando parado
    sprite = walking ? (facingRight ? WALK_RIGHT : WALK_LEFT) : IDLE;

    // Câmera segue o jogador (30% da esquerda da tela)
    const target = playerX - vw * 0.3;
    scrollX = Math.max(0, Math.min(target, WORLD_W - vw));

    // Colisão com Winry
    if (!metWinry && !inDialogue && Math.abs(playerX - WINRY_X) < DIALOGUE_RANGE) {
      triggerDial();
    }

    // Colisão com Vovó
    if (!metVovo && !inDialogue && !inPortalThought && Math.abs(playerX - VOVO_X) < DIALOGUE_RANGE) {
      triggerVovoDial();
    }

    // Portal no fim do caminho — pensamento antes de entrar
    if (!passedPortal && !inPortalThought && playerX >= PORTAL_X) {
      triggerPortalThought();
    }

    raf = requestAnimationFrame(loop);
  }

  // ─── Diálogo ───────────────────────────────────
  function triggerDial() {
    inDialogue = true;
    dialogueSource = "winry";
    right = false; left = false; walking = false;
    dialLines = FALA[lang] ?? FALA.pt;
    dialIdx = 0;
    startType();
  }

  function triggerVovoDial() {
    inDialogue = true;
    dialogueSource = "vovo";
    right = false; left = false; walking = false;
    dialLines = VOVO_FALA[lang] ?? VOVO_FALA.pt;
    dialIdx = 0;
    startType();
  }
  function startType() {
    typed = ""; charIdx = 0;
    clearInterval(typeTimer!);
    typeTimer = setInterval(() => {
      if (charIdx < dialLines[dialIdx].length) {
        typed += dialLines[dialIdx][charIdx];
        charIdx++;
      } else {
        clearInterval(typeTimer!);
        typeTimer = null;
      }
    }, 30);
  }
  function adv() {
    if (!typeTimer && typed.length < dialLines[dialIdx].length) {
      typed = dialLines[dialIdx]; return;
    }
    if (dialIdx < dialLines.length - 1) {
      dialIdx++; startType();
    } else {
      inDialogue = false;
      if (dialogueSource === "portal") {
        inPortalThought = false;
        enterPortal();
      } else if (dialogueSource === "vovo") {
        metVovo = true;
      } else {
        metWinry = true;
      }
    }
  }

  // ─── Portal — pensamento antes de entrar ───────
  function triggerPortalThought() {
    inPortalThought = true;
    dialogueSource = "portal";
    right = false; left = false; walking = false;
    dialLines = PORTAL_FALA[lang] ?? PORTAL_FALA.pt;
    dialIdx = 0;
    startType();
  }

  function enterPortal() {
    passedPortal = true;
    fading = true;
    setTimeout(() => goto("/envybattle"), 1000);
  }

  // ─── Lifecycle ─────────────────────────────────
  onMount(() => {
    vw = window.innerWidth;
    playMusic("/music/newgame.mp3");
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    raf = requestAnimationFrame(loop);
  });
  onDestroy(() => {
    window.removeEventListener("keydown", kd);
    window.removeEventListener("keyup", ku);
    cancelAnimationFrame(raf);
    if (typeTimer) clearInterval(typeTimer);
    unsub();
  });
</script>

<svelte:head>
  <title>Fase 1 - Fullmetal Alchemist</title>
</svelte:head>

<div class="fase1">
  <div class="scene">

    <!-- Fundo panorâmico responsivo (largura total) -->
    <img
      class="world-bg"
      src="/images/fase1/background.png"
      alt="Vila abandonada ao entardecer"
      draggable="false"
    />

    <div class="world" style="transform: translateX(-{scrollX}px);">

      <!-- Winry (NPC) -->
      <div
        class="char winry"
        style="left: {WINRY_X}px; background-image: url('/images/fase1/winry.png');"
      ></div>

      <!-- Vovó (NPC) -->
      <div
        class="char vovo"
        style="left: {VOVO_X}px; background-image: url('/images/fase1/vovo.png');"
      ></div>

      <!-- Edward (jogador) -->
      <div
        class="char player"
        style="left: {playerX}px; background-image: url({sprite}); transform: scaleX({walking ? 1 : (facingRight ? 1 : -1)});"
      ></div>

      <!-- Portal no fim -->
      <div class="portal" style="left: {PORTAL_X}px;"></div>

    </div><!-- /world -->
  </div><!-- /scene -->

  <!-- HUD -->
  <div class="hud">
    {#if !metWinry}
      {lang === "pt"
        ? "Use as teclas A e D ou as setas esquerda e direita para movimentar o personagem."
        : "Use A and D keys or left and right arrows to move the character."}
    {:else if !metVovo}
      {lang === "pt" ? "Continue em frente..." : "Keep moving forward..."}
    {:else if !passedPortal}
      {lang === "pt" ? "Siga até o portal..." : "Head to the portal..."}
    {/if}
  </div>

  <!-- Diálogo -->
  {#if inDialogue || inPortalThought}
    <div class="dialogue-overlay">
      <div class="dialogue-box">
        <p class="dialogue-text">
          {typed}<span class="dialogue-cursor">_</span>
        </p>
        <p class="dialogue-hint">
          {lang === "pt" ? "ENTER para avançar" : "ENTER to advance"}
        </p>
      </div>
    </div>
  {/if}

  <!-- Fade out para o portal -->
  {#if fading}
    <div class="fade-overlay"></div>
  {/if}
</div>
