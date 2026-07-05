<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import "../../assets/styles/envybattle.css";
  import { language } from "$lib/stores";

  // ─── Diálogos ───────────────────────────────────
  const MYSTERY_FALA: Record<string, string[]> = {
    pt: ["??? Hahaha... Que bonito. Ainda acreditando que podem mudar o destino."],
    en: ["??? Hahaha... How sweet. Still believing you can change fate."],
  };

  const MAIN_FALA: Record<string, string[]> = {
    pt: [
      "Envy: Vocês dois nunca aprendem. Quantas pessoas precisam sofrer por causa dessa obsessão?",
      "Edward: Cala a boca, Envy! Você sabe alguma coisa sobre a Pedra Filosofal.",
      "Envy: Talvez eu saiba. Talvez eu tenha vindo só para ver a expressão de vocês quando perceberem que tudo foi em vão.",
      "Vovó: Edward... Alphonse... cuidado. Ele está tentando provocar vocês.",
      "Envy: Então? O que vão fazer?",
    ],
    en: [
      "Envy: You two never learn. How many people need to suffer because of this obsession?",
      "Edward: Shut up, Envy! Do you know anything about the Philosopher's Stone?",
      "Envy: Maybe I do. Maybe I just came to see the look on your faces when you realize it was all in vain.",
      "Vovó: Edward... Alphonse... be careful. He's trying to provoke you.",
      "Envy: So? What are you going to do?",
    ],
  };

  const CONSEQUENCE_B_FALA: Record<string, string[]> = {
    pt: [
      "Edward: Fala! Onde está a Pedra Filosofal?",
      "Envy: Hahaha... Achou mesmo que eu responderia? Vocês vão ter que arrancar essa resposta de mim.",
    ],
    en: [
      "Edward: Talk! Where is the Philosopher's Stone?",
      "Envy: Hahaha... Did you really think I'd answer? You'll have to tear that answer out of me.",
    ],
  };

  const CONSEQUENCE_C_FALA: Record<string, string[]> = {
    pt: [
      "Vovó: Ele está tentando ganhar tempo...",
      "Envy: Esperto... mas isso não vai salvar vocês.",
    ],
    en: [
      "Vovó: He's trying to buy time...",
      "Envy: Clever... but that won't save you.",
    ],
  };

  const COMMON_FALA: Record<string, string[]> = {
    pt: [
      "Envy: Chega de conversa. Quero ver se vocês ficaram mais fortes.",
      "Envy: Então venham... me entretenham!",
    ],
    en: [
      "Envy: Enough talk. Let's see if you've gotten stronger.",
      "Envy: So come on... entertain me!",
    ],
  };

  // ─── Estado ────────────────────────────────────
  type Phase = "mystery" | "reveal" | "dialogue" | "choice" | "consequence" | "common" | "battle";

  let phase = $state<Phase>("mystery");
  let inDialogue = $state(false);
  let dialLines = $state<string[]>([]);
  let dialIdx = $state(0);
  let typed = $state("");
  let charIdx = $state(0);
  let chosen = $state<"A" | "B" | "C" | null>(null);
  let lang = $state("pt");

  let typeTimer: ReturnType<typeof setInterval> | null = null;
  let revealTimer: ReturnType<typeof setTimeout> | null = null;

  const unsub = language.subscribe((v) => lang = v);

  // ─── Digitação ─────────────────────────────────
  function startType() {
    typed = "";
    charIdx = 0;
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
      typed = dialLines[dialIdx];
      return;
    }
    if (dialIdx < dialLines.length - 1) {
      dialIdx++;
      startType();
    } else {
      switch (phase) {
        case "mystery":
          inDialogue = false;
          phase = "reveal";
          revealTimer = setTimeout(() => {
            phase = "dialogue";
            dialLines = MAIN_FALA[lang] ?? MAIN_FALA.pt;
            dialIdx = 0;
            inDialogue = true;
            startType();
          }, 3000);
          break;

        case "dialogue":
          inDialogue = false;
          phase = "choice";
          break;

        case "consequence":
          phase = "common";
          dialLines = COMMON_FALA[lang] ?? COMMON_FALA.pt;
          dialIdx = 0;
          startType();
          break;

        case "common":
          inDialogue = false;
          phase = "battle";
          break;
      }
    }
  }

  // ─── Escolha ───────────────────────────────────
  function choose(opt: "A" | "B" | "C") {
    chosen = opt;
    if (opt === "A") {
      phase = "battle";
    } else {
      phase = "consequence";
      dialLines =
        (opt === "B" ? CONSEQUENCE_B_FALA : CONSEQUENCE_C_FALA)[lang] ??
        CONSEQUENCE_B_FALA.pt;
      dialIdx = 0;
      inDialogue = true;
      startType();
    }
  }

  // ─── Teclado ───────────────────────────────────
  function kd(e: KeyboardEvent) {
    if ((e.key === "Enter" || e.key === " ") && inDialogue) {
      e.preventDefault();
      adv();
    }
  }

  // ─── Lifecycle ─────────────────────────────────
  onMount(() => {
    window.addEventListener("keydown", kd);
    dialLines = MYSTERY_FALA[lang] ?? MYSTERY_FALA.pt;
    dialIdx = 0;
    inDialogue = true;
    startType();
  });

  onDestroy(() => {
    window.removeEventListener("keydown", kd);
    if (typeTimer) clearInterval(typeTimer);
    if (revealTimer) clearTimeout(revealTimer);
    unsub();
  });
</script>

<svelte:head>
  <title>Envy Battle - Fullmetal Alchemist</title>
</svelte:head>

<div class="envybattle" style="background: {phase === 'mystery' ? '#fff' : '#000'}">
  {#if phase !== 'mystery'}
    <img
      class="bg-img"
      src="/images/envybattle/background.png"
      alt=""
      draggable="false"
    />

    {#if phase === 'reveal'}
      <div
        class="char envy"
        style="background-image: url('/images/envybattle/envy_laugh.png');"
      ></div>
    {:else}
      <div
        class="char envy"
        style="background-image: url('/images/envybattle/envy_full.png');"
      ></div>
    {/if}

    <div
      class="char edward"
      style="background-image: url('/images/fase1/edward.png');"
    ></div>
  {/if}

  {#if inDialogue}
    <div class="dialogue-overlay">
      <div class="dialogue-box">
        <p class="dialogue-text">{typed}<span class="dialogue-cursor">_</span></p>
        <p class="dialogue-hint">
          {lang === "pt" ? "ENTER para avançar" : "ENTER to advance"}
        </p>
      </div>
    </div>
  {/if}

  {#if phase === "choice"}
    <div class="choices">
      <button class="choice-btn" onclick={() => choose("A")}>
        {lang === "pt" ? "Eu vou acabar com você!" : "I'll finish you!"}
      </button>
      <button class="choice-btn" onclick={() => choose("B")}>
        {lang === "pt" ? "Responda às nossas perguntas." : "Answer our questions."}
      </button>
      <button class="choice-btn" onclick={() => choose("C")}>
        {lang === "pt" ? "Observe o ambiente." : "Observe the surroundings."}
      </button>
    </div>
  {/if}

  {#if phase === "battle"}
    <div class="battle-placeholder">
      <p class="battle-text">⚔️ A batalha contra Envy começa...</p>
      <!-- TODO: implementar mecânica de batalha (LUTAR/BLEFAR/ITEM/FUGIR) -->
    </div>
  {/if}
</div>
