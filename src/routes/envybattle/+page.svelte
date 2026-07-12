<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import "../../assets/styles/envybattle.css";
  import { language, playMusic, stopMusic, saveProgress, loadProgress } from "$lib/stores";
  import type { BattlePhase, Obstacle } from "$lib/envyBattleLogic";
  import {
    ENVY_MAX_HP, PLAYER_MAX_HP, LUTAR_DANO_BASE, ENVY_DEF_BASE,
    DANO_ESQUIVA, DODGE_DURATION_MS, HEART_SIZE, DODGE_BOX_W, DODGE_BOX_H,
    INVINCIBLE_MS,
    BATTLE_INTRO_FALA, ENVY_TURN_VARIACOES, LUTAR_VARIACOES,
    BLEFAR_FALA, FUGIR_FAIL_FALA, FUGIR_OK_FALA,
    FINAL_BLOW_FALA, ITEM_POCAO_FALA, ITEM_ELIXIR_FALA,
    clamp, randomBetween, calcularDanoLutar
  } from "$lib/envyBattleLogic";

  // ═══════════════════════════════════════════════
  // INTRO DIALOGUE
  // ═══════════════════════════════════════════════

  const MYSTERY_FALA: Record<string, string[]> = {
    pt: ["??? Hahaha... Que bonito. Ainda acreditando que podem mudar o destino."],
    en: ["??? Hahaha... How sweet. Still believing you can change fate."],
  };

  const MAIN_FALA: Record<string, string[]> = {
    pt: [
      "Envy: Voc\u00eas dois nunca aprendem. Quantas pessoas precisam sofrer por causa dessa obsess\u00e3o?",
      "Edward: Cala a boca, Envy! Voc\u00ea sabe alguma coisa sobre a Pedra Filosofal.",
      "Envy: Talvez eu saiba. Talvez eu tenha vindo s\u00f3 para ver a express\u00e3o de voc\u00eas quando perceberem que tudo foi em v\u00e3o.",
      "Vov\u00f3: Edward... Alphonse... cuidado. Ele est\u00e1 tentando provocar voc\u00eas.",
      "Envy: Ent\u00e3o? O que v\u00e3o fazer?",
    ],
    en: [
      "Envy: You two never learn. How many people need to suffer because of this obsession?",
      "Edward: Shut up, Envy! Do you know anything about the Philosopher's Stone?",
      "Envy: Maybe I do. Maybe I just came to see the look on your faces when you realize it was all in vain.",
      "Vov\u00f3: Edward... Alphonse... be careful. He's trying to provoke you.",
      "Envy: So? What are you going to do?",
    ],
  };

  const CONSEQUENCE_B_FALA: Record<string, string[]> = {
    pt: [
      "Edward: Fala! Onde est\u00e1 a Pedra Filosofal?",
      "Envy: Hahaha... Achou mesmo que eu responderia? Voc\u00eas v\u00e3o ter que arrancar essa resposta de mim.",
    ],
    en: [
      "Edward: Talk! Where is the Philosopher's Stone?",
      "Envy: Hahaha... Did you really think I'd answer? You'll have to tear that answer out of me.",
    ],
  };

  const CONSEQUENCE_C_FALA: Record<string, string[]> = {
    pt: [
      "Vov\u00f3: Ele est\u00e1 tentando ganhar tempo...",
      "Envy: Esperto... mas isso n\u00e3o vai salvar voc\u00eas.",
    ],
    en: [
      "Vov\u00f3: He's trying to buy time...",
      "Envy: Clever... but that won't save you.",
    ],
  };

  const COMMON_FALA: Record<string, string[]> = {
    pt: [
      "Envy: Chega de conversa. Quero ver se voc\u00eas ficaram mais fortes.",
      "Envy: Ent\u00e3o venham... me entretenham!",
    ],
    en: [
      "Envy: Enough talk. Let's see if you've gotten stronger.",
      "Envy: So come on... entertain me!",
    ],
  };

  // ═══════════════════════════════════════════════
  // INTRO STATE
  // ═══════════════════════════════════════════════

  type Phase = "mystery" | "reveal" | "dialogue" | "choice" | "consequence" | "common" | "battle";

  let phase = $state<Phase>("mystery");
  let inDialogue = $state<boolean>(false);
  let dialLines = $state<string[]>([]);
  let dialIdx = $state<number>(0);
  let typed = $state<string>("");
  let charIdx = $state<number>(0);
  let lang = $state<"pt" | "en">("pt");

  let typeTimer: ReturnType<typeof setInterval> | null = null;
  let revealTimer: ReturnType<typeof setTimeout> | null = null;

  const unsub = language.subscribe((v: "pt" | "en"): void => { lang = v; });

  // ═══════════════════════════════════════════════
  // BATTLE STATE
  // ═══════════════════════════════════════════════

  let battlePhase = $state<BattlePhase>("battleIntro");
  let playerHp = $state<number>(PLAYER_MAX_HP);
  let envyHp = $state<number>(ENVY_MAX_HP);
  let envyDef = $state<number>(15);
  let blefarStage = $state<number>(0);
  let envyEnraged = $state<boolean>(false);
  let portraitSrc = $state<string>("/images/envybattle/envy_full.png");

  // Dodge state
  let heartX = $state<number>(DODGE_BOX_W / 2);
  let heartY = $state<number>(DODGE_BOX_H / 2);
  let obstacles = $state<Obstacle[]>([]);
  let invincible = $state<boolean>(false);
  let dodgeSecondsLeft = $state<number>(6);

  let dodgeKeys = new Set<string>();
  let dodgeRaf: number = 0;
  let obstacleIdCounter: number = 0;
  let dodgeIntervals: ReturnType<typeof setInterval>[] = [];
  let dodgeTimeout: ReturnType<typeof setTimeout> | null = null;
  let pendingAction: string | null = null;
  let endingTimer: ReturnType<typeof setTimeout> | null = null;
  let hitFlashTimer: ReturnType<typeof setTimeout> | null = null;
  let invincibleTimer: ReturnType<typeof setTimeout> | null = null;
  let dodgeShaking = $state<boolean>(false);
  let dodgeShakeTimer: ReturnType<typeof setTimeout> | null = null;

  // ═══════════════════════════════════════════════
  // TYPEWRITER
  // ═══════════════════════════════════════════════

  function startType(): void {
    typed = "";
    charIdx = 0;
    clearInterval(typeTimer!);
    typeTimer = setInterval((): void => {
      if (charIdx < dialLines[dialIdx].length) {
        typed += dialLines[dialIdx][charIdx];
        charIdx++;
      } else {
        clearInterval(typeTimer!);
        typeTimer = null;
      }
    }, 30);
  }

  function showDialogue(lines: string[]): void {
    dialLines = lines;
    dialIdx = 0;
    inDialogue = true;
    startType();
  }

  // ═══════════════════════════════════════════════
  // ADVANCE DIALOGUE
  // ═══════════════════════════════════════════════

  function adv(): void {
    // Complete current line if still typing
    if (!typeTimer && typed.length < dialLines[dialIdx].length) {
      typed = dialLines[dialIdx];
      return;
    }
    // Advance to next line
    if (dialIdx < dialLines.length - 1) {
      dialIdx++;
      startType();
      if (battlePhase === "playerAction" || battlePhase === "envyTurn") {
        if (isTransformText(dialLines[dialIdx])) {
          portraitSrc = `/images/envybattle/${Math.random() < 0.5 ? "winry_portrait.png" : "trisha.png"}`;
        } else {
          portraitSrc = "/images/envybattle/envy_battle.png";
        }
      }
      return;
    }
    // End of dialogue block — revert portrait and transition
    portraitSrc = "/images/envybattle/envy_battle.png";
    if (phase === "battle") {
      advanceBattle();
    } else {
      advanceIntro();
    }
  }

  function isTransformText(text: string): boolean {
    const lower: string = text.toLowerCase();
    return (
      lower.includes("assumiu") ||
      lower.includes("appearance of someone") ||
      lower.includes("rostos familiares") ||
      lower.includes("familiar faces") ||
      lower.includes("tomar forma") ||
      lower.includes("take shape")
    );
  }

  function advanceIntro(): void {
    switch (phase) {
      case "mystery":
        inDialogue = false;
        phase = "reveal";
        revealTimer = setTimeout((): void => {
          phase = "dialogue";
          showDialogue(MAIN_FALA[lang] ?? MAIN_FALA.pt);
        }, 3000);
        break;
      case "dialogue":
        inDialogue = false;
        phase = "choice";
        break;
      case "consequence":
        phase = "common";
        showDialogue(COMMON_FALA[lang] ?? COMMON_FALA.pt);
        break;
      case "common":
        inDialogue = false;
        phase = "battle";
        enterBattle();
        break;
    }
  }

  function advanceBattle(): void {
    switch (battlePhase) {
      case "battleIntro":
        inDialogue = false;
        battlePhase = "actionMenu";
        break;
      case "playerAction":
        inDialogue = false;
        if (pendingAction) {
          const action: string = pendingAction;
          pendingAction = null;
          executeAction(action);
        }
        break;
      case "itemSubmenu":
        inDialogue = false;
        if (pendingAction) {
          const action: string = pendingAction;
          pendingAction = null;
          executeAction(action);
        }
        break;
      case "envyTurn":
        inDialogue = false;
        startDodge();
        break;
      case "finalBlow":
        inDialogue = false;
        showEnding();
        break;
    }
  }

  // ═══════════════════════════════════════════════
  // ENTER BATTLE
  // ═══════════════════════════════════════════════

  function enterBattle(): void {
    battlePhase = "battleIntro";
    portraitSrc = "/images/envybattle/envy_battle.png";
    playMusic("/music/boss_theme.mp3");
    showDialogue(BATTLE_INTRO_FALA[lang] ?? BATTLE_INTRO_FALA.pt);
  }

  function showEnvyTurn(): void {
    battlePhase = "envyTurn";
    const vars: string[][] = ENVY_TURN_VARIACOES[lang] ?? ENVY_TURN_VARIACOES.pt;
    const idx: number = Math.floor(Math.random() * vars.length);
    showDialogue(vars[idx]);
  }

  // ═══════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════

  function actionLutar(): void {
    pendingAction = "lutar";
    battlePhase = "playerAction";
    const vars: string[][] = LUTAR_VARIACOES[lang] ?? LUTAR_VARIACOES.pt;
    const idx: number = Math.floor(Math.random() * vars.length);
    showDialogue(vars[idx]);
  }

  function actionBlefar(): void {
    pendingAction = "blefar";
    battlePhase = "playerAction";
    if (blefarStage >= 3) {
      showDialogue(BLEFAR_FALA.done[lang] ?? BLEFAR_FALA.done.pt);
    } else {
      const key: string = `stage${blefarStage + 1}`;
      showDialogue(BLEFAR_FALA[key][lang] ?? BLEFAR_FALA[key].pt);
    }
  }

  function actionItem(): void {
    pendingAction = null;
    battlePhase = "itemSubmenu";
  }

  function actionFugir(): void {
    pendingAction = "fugir";
    battlePhase = "playerAction";
    if (blefarStage >= 3) {
      showDialogue(FUGIR_OK_FALA[lang] ?? FUGIR_OK_FALA.pt);
    } else {
      showDialogue(FUGIR_FAIL_FALA[lang] ?? FUGIR_FAIL_FALA.pt);
    }
  }

  function usePocao(): void {
    const healed: number = Math.min(playerHp + 20, PLAYER_MAX_HP);
    playerHp = healed;
    pendingAction = "item";
    battlePhase = "itemSubmenu";
    showDialogue(ITEM_POCAO_FALA[lang] ?? ITEM_POCAO_FALA.pt);
  }

  function useElixir(): void {
    playerHp = PLAYER_MAX_HP;
    pendingAction = "item";
    battlePhase = "itemSubmenu";
    showDialogue(ITEM_ELIXIR_FALA[lang] ?? ITEM_ELIXIR_FALA.pt);
  }

  function executeAction(action: string): void {
    switch (action) {
      case "lutar": {
        const dano: number = calcularDanoLutar(envyDef);
        const isFinalBlow: boolean = dano >= envyHp;
        if (isFinalBlow) {
          envyHp = 0;
          showHitFlash();
          battlePhase = "finalBlow";
          showDialogue(FINAL_BLOW_FALA[lang] ?? FINAL_BLOW_FALA.pt);
        } else {
          envyHp = envyHp - dano;
          if (envyHp <= ENVY_MAX_HP / 2 && !envyEnraged) {
            envyEnraged = true;
          }
          showHitFlash();
          const danoLine: string = `${lang === "pt" ? "Envy sofreu dano!" : "Envy took damage!"}`;
          pendingAction = "afterLutar";
          showDialogue([danoLine]);
        }
        break;
      }
      case "afterLutar": {
        showEnvyTurn();
        break;
      }
      case "blefar": {
        if (blefarStage >= 3) {
          showEnvyTurn();
          break;
        }
        blefarStage++;
        if (blefarStage === 1) envyDef = 12;
        else if (blefarStage === 2) { envyDef = 9; }
        else if (blefarStage === 3) { /* ATK nerf via dialogue only */ }
        showEnvyTurn();
        break;
      }
      case "item": {
        showEnvyTurn();
        break;
      }
      case "fugir": {
        if (blefarStage >= 3) {
          stopMusic();
          saveProgress("envyBattle");
          battlePhase = "fled";
          inDialogue = false;
        } else {
          battlePhase = "actionMenu";
        }
        break;
      }
    }
  }

  function showEnding(): void {
    stopMusic();
    saveProgress("postEnvy");
    battlePhase = "ending";
    endingTimer = setTimeout((): void => {
      goto("/");
    }, 4000);
  }

  function showHitFlash(): void {
    hitFlash = true;
    hitFlashTimer = setTimeout((): void => { hitFlash = false; }, 250);
  }

  // ═══════════════════════════════════════════════
  // DODGE MINIGAME
  // ═══════════════════════════════════════════════

  function spawnObstacle(type: "face" | "arm"): void {
    const id: number = ++obstacleIdCounter;
    const edge: number = randomBetween(0, 3); // 0=top,1=right,2=bottom,3=left
    let x: number, y: number, w: number, h: number, speed: number, dir: Obstacle["dir"];
    if (type === "face") {
      w = 36; h = 44; speed = 3.8 + Math.random() * 3.8;
    } else {
      w = 12; h = 60; speed = 5.7;
    }
    switch (edge) {
      case 0: x = randomBetween(0, DODGE_BOX_W - w); y = -h; dir = "down"; break;
      case 1: x = DODGE_BOX_W; y = randomBetween(0, DODGE_BOX_H - h); dir = "left"; break;
      case 2: x = randomBetween(0, DODGE_BOX_W - w); y = DODGE_BOX_H; dir = "up"; break;
      default: x = -w; y = randomBetween(0, DODGE_BOX_H - h); dir = "right"; break;
    }
    obstacles = [...obstacles, { id, x, y, w, h, speed, dir, type }];
  }

  function startDodge(): void {
    heartX = DODGE_BOX_W / 2;
    heartY = DODGE_BOX_H / 2;
    obstacles = [];
    dodgeKeys.clear();
    invincible = false;
    dodgeShaking = false;
    clearTimeout(dodgeShakeTimer!);
    battlePhase = "dodge";
    dodgeSecondsLeft = 6;

    const faceInterval: ReturnType<typeof setInterval> = setInterval((): void => { spawnObstacle("face"); }, 800);
    const armInterval: ReturnType<typeof setInterval> = setInterval((): void => { spawnObstacle("arm"); }, 1200);
    dodgeIntervals = [faceInterval, armInterval];
    const startTime: number = Date.now();

    dodgeTimeout = setTimeout((): void => { endDodge(); }, DODGE_DURATION_MS);

    function loop(): void {
      if (battlePhase !== "dodge") return;

      const elapsed: number = Date.now() - startTime;
      dodgeSecondsLeft = Math.ceil((DODGE_DURATION_MS - elapsed) / 1000);

      const spd: number = 4;
      if (dodgeKeys.has("ArrowUp") || dodgeKeys.has("w") || dodgeKeys.has("W")) heartY = clamp(heartY - spd, 0, DODGE_BOX_H);
      if (dodgeKeys.has("ArrowDown") || dodgeKeys.has("s") || dodgeKeys.has("S")) heartY = clamp(heartY + spd, 0, DODGE_BOX_H);
      if (dodgeKeys.has("ArrowLeft") || dodgeKeys.has("a") || dodgeKeys.has("A")) heartX = clamp(heartX - spd, 0, DODGE_BOX_W);
      if (dodgeKeys.has("ArrowRight") || dodgeKeys.has("d") || dodgeKeys.has("D")) heartX = clamp(heartX + spd, 0, DODGE_BOX_W);

      obstacles = obstacles.map((o: Obstacle): Obstacle => {
        let { x, y } = o;
        switch (o.dir) {
          case "up": y -= o.speed; break;
          case "down": y += o.speed; break;
          case "left": x -= o.speed; break;
          case "right": x += o.speed; break;
        }
        return { ...o, x, y };
      }).filter((o: Obstacle): boolean => {
        if (o.x + o.w < -60 || o.x > DODGE_BOX_W + 60) return false;
        if (o.y + o.h < -60 || o.y > DODGE_BOX_H + 60) return false;
        return true;
      });

      if (!invincible) {
        const hx: number = heartX, hy: number = heartY, hs: number = HEART_SIZE;
        for (const o of obstacles) {
          if (hx < o.x + o.w && hx + hs > o.x && hy < o.y + o.h && hy + hs > o.y) {
            playerHp = Math.max(0, playerHp - DANO_ESQUIVA);
            invincible = true;
            clearTimeout(dodgeShakeTimer!);
            dodgeShaking = false;
            requestAnimationFrame((): void => { dodgeShaking = true; });
            dodgeShakeTimer = setTimeout((): void => { dodgeShaking = false; }, 400);
            invincibleTimer = setTimeout((): void => { invincible = false; }, INVINCIBLE_MS);
            if (playerHp <= 0) {
              clearTimeout(dodgeTimeout!);
              dodgeIntervals.forEach(clearInterval);
              battlePhase = "defeat";
              return;
            }
            break;
          }
        }
      }

      dodgeRaf = requestAnimationFrame(loop);
    }

    dodgeRaf = requestAnimationFrame(loop);
  }

  function endDodge(): void {
    dodgeIntervals.forEach(clearInterval);
    cancelAnimationFrame(dodgeRaf);
    obstacles = [];
    battlePhase = "actionMenu";
  }

  // ═══════════════════════════════════════════════
  // INTRO CHOICE
  // ═══════════════════════════════════════════════

  function choose(opt: "A" | "B" | "C"): void {
    if (opt === "A") {
      phase = "battle";
      enterBattle();
    } else {
      phase = "consequence";
      showDialogue((opt === "B" ? CONSEQUENCE_B_FALA : CONSEQUENCE_C_FALA)[lang] ?? CONSEQUENCE_B_FALA.pt);
    }
  }

  // ═══════════════════════════════════════════════
  // KEYBOARD
  // ═══════════════════════════════════════════════

  function kd(e: KeyboardEvent): void {
    if ((e.key === "Enter" || e.key === " ") && inDialogue) {
      e.preventDefault();
      adv();
      return;
    }
    if (battlePhase === "dodge") {
      const arrows: string[] = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "s", "S", "a", "A", "d", "D"];
      if (arrows.includes(e.key)) {
        e.preventDefault();
        dodgeKeys.add(e.key);
      }
    }
  }

  function ku(e: KeyboardEvent): void {
    if (battlePhase === "dodge") {
      dodgeKeys.delete(e.key);
    }
  }

  // ═══════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════

  onMount((): void => {
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    if (loadProgress() === "envyBattle") {
      phase = "battle";
      enterBattle();
    } else {
      showDialogue(MYSTERY_FALA[lang] ?? MYSTERY_FALA.pt);
    }
  });

  onDestroy((): void => {
    window.removeEventListener("keydown", kd);
    window.removeEventListener("keyup", ku);
    if (typeTimer) clearInterval(typeTimer);
    if (revealTimer) clearTimeout(revealTimer);
    if (dodgeTimeout) clearTimeout(dodgeTimeout);
    if (endingTimer) clearTimeout(endingTimer);
    if (hitFlashTimer) clearTimeout(hitFlashTimer);
    if (invincibleTimer) clearTimeout(invincibleTimer);
    dodgeIntervals.forEach(clearInterval);
    cancelAnimationFrame(dodgeRaf);
    stopMusic();
    unsub();
  });

  // HP bar colors
  let hpBarClass = $derived<string>(
    playerHp / PLAYER_MAX_HP <= 0.25 ? "hp-bar-fill low"
    : playerHp / PLAYER_MAX_HP <= 0.5 ? "hp-bar-fill mid"
    : "hp-bar-fill"
  );

  let hitFlash = $state<boolean>(false);
</script>

<svelte:head>
  <title>Envy Battle - Fullmetal Alchemist</title>
</svelte:head>

<div class="envybattle" style="background: {phase === 'mystery' ? '#fff' : '#000'}">
  {#if phase !== 'mystery' && phase !== 'battle'}
    <img class="bg-img" src="/images/envybattle/background.png" alt="" draggable="false" />

    {#if phase === 'reveal'}
      <div class="char envy" style="background-image: url('/images/envybattle/envy_laugh.png');"></div>
    {:else}
      <div class="char envy" style="background-image: url('/images/envybattle/envy_full.png');"></div>
      <div class="char edward" style="background-image: url('/images/fase1/edward.png');"></div>
    {/if}
  {/if}

  {#if phase === "choice"}
    <div class="choices">
      <button class="choice-btn" onclick={(): void => { choose("A"); }}>
        {lang === "pt" ? "Eu vou acabar com voc\u00ea!" : "I'll finish you!"}
      </button>
      <button class="choice-btn" onclick={(): void => { choose("B"); }}>
        {lang === "pt" ? "Responda \u00e0s nossas perguntas." : "Answer our questions."}
      </button>
      <button class="choice-btn" onclick={(): void => { choose("C"); }}>
        {lang === "pt" ? "Observe o ambiente." : "Observe the surroundings."}
      </button>
    </div>
  {/if}

  {#if inDialogue && phase !== "battle"}
    <div class="dialogue-overlay">
      <div class="dialogue-box">
        <p class="dialogue-text">{typed}<span class="dialogue-cursor">_</span></p>
        <p class="dialogue-hint">{lang === "pt" ? "ENTER para avan\u00e7ar" : "ENTER to advance"}</p>
      </div>
    </div>
  {/if}

  <!-- ═══════════════════════════════════════════
       BATTLE UI
       ═══════════════════════════════════════════ -->

  {#if phase === "battle"}

    <!-- Battle intro dialogue uses standard dialogue box -->
    {#if battlePhase === "battleIntro" && inDialogue}
      <div class="dialogue-overlay">
        <div class="dialogue-box">
          <p class="dialogue-text">{typed}<span class="dialogue-cursor">_</span></p>
          <p class="dialogue-hint">{lang === "pt" ? "ENTER para avan\u00e7ar" : "ENTER to advance"}</p>
        </div>
      </div>
    {/if}

    {#if battlePhase !== "battleIntro" && battlePhase !== "victory" && battlePhase !== "defeat" && battlePhase !== "fled" && battlePhase !== "ending"}
      <div class="battle-scene">
        <!-- Portrait -->
        <img
          class="battle-portrait portrait-battle {envyEnraged ? 'enraged-glow' : ''} {hitFlash ? 'hit-flash' : ''}"
          src={portraitSrc}
          alt="Envy"
          draggable="false"
        />

        <!-- Player HP bar -->
        <div class="hp-container">
          <div class="hp-label">
            <span>Edward</span>
            <span>{playerHp}/{PLAYER_MAX_HP}</span>
          </div>
          <div class="hp-bar-bg">
            <div class="{hpBarClass}" style="width: {(playerHp / PLAYER_MAX_HP) * 100}%;"></div>
            <span class="hp-text">{playerHp}/{PLAYER_MAX_HP}</span>
          </div>
        </div>

        <!-- Action menu -->
        {#if battlePhase === "actionMenu"}
          <div class="action-menu">
            <button class="action-btn" onclick={actionLutar}>
              {lang === "pt" ? "LUTAR" : "FIGHT"}
            </button>
            <button class="action-btn" onclick={actionBlefar}>
              {lang === "pt" ? "BLEFAR" : "BLUFF"}
            </button>
            <button class="action-btn" onclick={actionItem}>
              {lang === "pt" ? "ITEM" : "ITEM"}
            </button>
            <button class="action-btn" onclick={actionFugir}>
              {lang === "pt" ? "FUGIR" : "FLEE"}
            </button>
          </div>
        {/if}

        <!-- Item submenu -->
        {#if battlePhase === "itemSubmenu" && !inDialogue}
          <div class="item-menu">
            <button class="item-btn" onclick={usePocao}>
              {lang === "pt" ? "Po\u00e7\u00e3o (+20 HP)" : "Potion (+20 HP)"}
            </button>
            <button class="item-btn" onclick={useElixir}>
              {lang === "pt" ? "Elixir (Cura total)" : "Elixir (Full heal)"}
            </button>
            <button class="item-btn back" onclick={(): void => { battlePhase = "actionMenu"; }}>
              {lang === "pt" ? "Voltar" : "Back"}
            </button>
          </div>
        {/if}

        <!-- Player action dialogue -->
        {#if (battlePhase === "playerAction" || battlePhase === "envyTurn" || battlePhase === "finalBlow" || (battlePhase === "itemSubmenu" && inDialogue)) && inDialogue}
          <div class="dialogue-overlay">
            <div class="dialogue-box">
              <p class="dialogue-text">{typed}<span class="dialogue-cursor">_</span></p>
              <p class="dialogue-hint">{lang === "pt" ? "ENTER para avan\u00e7ar" : "ENTER to advance"}</p>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Dodge minigame -->
    {#if battlePhase === "dodge"}
      <div class="dodge-wrapper">
        <div class="dodge-box" class:shake={dodgeShaking}>
          <div class="dodge-heart" style="left: {heartX}px; top: {heartY}px;">&#9829;</div>

          {#each obstacles as obs (obs.id)}
            <div class="obstacle-bar -{obs.type}" style="left: {obs.x}px; top: {obs.y}px; width: {obs.w}px; height: {obs.h}px;"></div>
          {/each}

          <div class="dodge-timer">{dodgeSecondsLeft}s</div>
        </div>
      </div>
    {/if}

    <!-- Victory -->
    {#if battlePhase === "victory"}
      <div class="result-screen">
        <p class="result-text">{lang === "pt" ? "Voc\u00ea derrotou Envy!" : "You defeated Envy!"}</p>
        <!-- TODO: o que acontece ap\u00f3s vencer -->
        <button class="result-btn" onclick={(): void => { goto("/"); }}>
          {lang === "pt" ? "Menu Principal" : "Main Menu"}
        </button>
      </div>
    {/if}

    <!-- Defeat -->
    {#if battlePhase === "defeat"}
      <div class="result-screen">
        <p class="result-text">{lang === "pt" ? "Voc\u00ea foi derrotado..." : "You were defeated..."}</p>
        <!-- TODO: o que acontece ap\u00f3s derrota -->
        <button class="result-btn" onclick={(): void => { goto("/"); }}>
          {lang === "pt" ? "Menu Principal" : "Main Menu"}
        </button>
      </div>
    {/if}

    <!-- Fled -->
    {#if battlePhase === "fled"}
      <div class="result-screen">
        <p class="result-text">
          {lang === "pt" ? "Voc\u00ea fugiu com sucesso." : "You fled successfully."}
        </p>
        <button class="result-btn" onclick={(): void => { goto("/"); }}>
          {lang === "pt" ? "Menu Principal" : "Main Menu"}
        </button>
      </div>
    {/if}

    <!-- Ending (fade to black + "Continua...") -->
    {#if battlePhase === "ending"}
      <div class="ending-screen">
        <p class="ending-text">{lang === "pt" ? "Continua..." : "To be continued..."}</p>
      </div>
    {/if}

  {/if}
</div>
