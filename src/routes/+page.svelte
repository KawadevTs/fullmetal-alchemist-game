<script lang="ts">
  import "../assets/styles/menu.css";
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { language, playMusic, stopMusic } from "$lib/stores";

  const music = new Audio("/music/theme.mp3");
  music.loop = true;
  
  const textos: Record<"pt" | "en", string[]> = {
    pt: ["NOVO JOGO", "CONTINUE", "OPÇÕES", "CRÉDITOS", "SAIR"],
    en: ["NEW GAME", "CONTINUE", "OPTIONS", "CREDITS", "EXIT"]
  };

  let selectedIndex = $state<number>(0);
  let currentLanguage: "pt" | "en" = $state<"pt" | "en">("pt");

  const unsubscribe = language.subscribe((value: "pt" | "en") => {
    currentLanguage = value;
  });

  let menuOptions = $derived<string[]>(textos[currentLanguage]);

  function selectOption(): void {
    switch (selectedIndex) {
      case 0: // NOVO JOGO
        music.pause();
  playMusic("/music/newgame.mp3");
  goto("/cutscene");
  break;

      case 1: // CONTINUE
        if (currentLanguage === "pt") {
          alert("Sistema de save ainda não implementado.");
        } else {
          alert("Save system not implemented yet.");
        }
        break;

      case 2: // OPÇÕES
        goto("/options");
        break;

      case 3: // CRÉDITOS
        goto("/credits");
        break;

      case 4: // SAIR
        window.close();
        break;
    }
  }

  function handleKey(event: KeyboardEvent): void {
    if (event.key === "ArrowDown") {
      selectedIndex++;
      if (selectedIndex >= menuOptions.length) selectedIndex = 0;
    }

    if (event.key === "ArrowUp") {
      selectedIndex--;
      if (selectedIndex < 0) selectedIndex = menuOptions.length - 1;
    }

    if (event.key === "Enter") {
      selectOption();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKey);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKey);
    unsubscribe();
  });
</script>

<div class="menu">
  <img src="/images/background.png" alt="Background" class="background" />
  <div class="dark-overlay"></div>
  <img src="/images/logo.png" alt="Logo" class="logo" />

  <div class="menu-container">
    {#each menuOptions as option, index}
      <button
        class:selected={index === selectedIndex}
        class="menu-button"
        onclick={() => {
          selectedIndex = index;
          selectOption();
        }}
      >
        {option}
      </button>
    {/each}
  </div>
</div>