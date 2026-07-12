<script lang="ts">
  import "../assets/styles/menu.css";
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { language, playMusic, loadProgress, clearProgress } from "$lib/stores";

  const textos: Record<"pt" | "en", string[]> = {
    pt: ["NOVO JOGO", "CONTINUE", "OPÇÕES", "CRÉDITOS", "SOBRE", "SAIR"],
    en: ["NEW GAME", "CONTINUE", "OPTIONS", "CREDITS", "ABOUT", "EXIT"]
  };

  let selectedIndex = $state<number>(0);
  let currentLanguage: "pt" | "en" = $state<"pt" | "en">("pt");

  const unsubscribe = language.subscribe((value: "pt" | "en"): void => {
    currentLanguage = value;
  });

  let menuOptions = $derived<string[]>(textos[currentLanguage]);

  function selectOption(): void {
    switch (selectedIndex) {
      case 0: // NOVO JOGO
        clearProgress();
        playMusic("/music/newgame.mp3");
        goto("/cutscene");
        break;

      case 1: // CONTINUE
        {
          const saved = loadProgress();
          if (saved === "envyBattle") {
            playMusic("/music/newgame.mp3");
            goto("/envybattle");
          } else if (saved === "postEnvy") {
            if (currentLanguage === "pt") {
              alert("Continuação ainda não disponível.");
            } else {
              alert("Continuation not yet available.");
            }
          } else {
            if (currentLanguage === "pt") {
              alert("Nenhum save encontrado.");
            } else {
              alert("No save found.");
            }
          }
        }
        break;

      case 2: // OPÇÕES
        goto("/options");
        break;

      case 3: // CRÉDITOS
        goto("/credits");
        break;

      case 4: // SOBRE
        window.open("https://game-demoweek.vercel.app/", "_blank");
        break;

      case 5: // SAIR
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
  <video src="/motion-background.mp4" autoplay muted loop playsinline class="background"></video>
  <div class="dark-overlay"></div>
  <div class="menu-contrast"></div>
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

  <div class="footer-text">
    {currentLanguage === "pt"
      ? "Projeto desenvolvido para fins acadêmicos, com inspirações no jogo Full Metal Alchemist e no jogo Undertale."
      : "Academic project inspired by Full Metal Alchemist and Undertale."}
  </div>
</div>