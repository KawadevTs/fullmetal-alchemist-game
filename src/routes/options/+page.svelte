<script lang="ts">
  import "../../assets/styles/opçoes.css";
  import { goto } from "$app/navigation";
  import { language, volume } from "$lib/stores";

  function aumentarVolume(): void {
    volume.update((v: number) => {
      if (v < 1) {
        const novoVolume = parseFloat((v + 0.1).toFixed(1));
        console.log("🔊🔊🔊 AUMENTOU PARA:", novoVolume);
        // 🔥 FORÇA O VOLUME DIRETO
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.volume = novoVolume;
          console.log("🎵 AUDIO DIRETO ATUALIZADO:", novoVolume);
        });
        return novoVolume;
      }
      return v;
    });
  }

  function diminuirVolume(): void {
    volume.update((v: number) => {
      if (v > 0) {
        const novoVolume = parseFloat((v - 0.1).toFixed(1));
        console.log("🔊🔊🔊 DIMINUIU PARA:", novoVolume);
        // 🔥 FORÇA O VOLUME DIRETO
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          audio.volume = novoVolume;
          console.log("🎵 AUDIO DIRETO ATUALIZADO:", novoVolume);
        });
        return novoVolume;
      }
      return v;
    });
  }

  function alternarIdioma(): void {
    language.update((lang: "pt" | "en") => (lang === "pt" ? "en" : "pt"));
  }
</script>

<div class="menu2">
  
  <img src="/images/background.png" alt="Background" class="background2" />

  <div class="menu-container1">
    
    <h2>{$language === "pt" ? "OPÇÕES" : "OPTIONS"}</h2>

    <div class="option-group">
      <span class="label">Volume</span>
      <div class="volume-controls">
        <button class="pixel-btn sm" onclick={diminuirVolume}>-</button>
        <span class="volume-value">{Math.round($volume * 100)}%</span> 
        <button class="pixel-btn sm" onclick={aumentarVolume}>+</button>
      </div>
    </div>

    <div class="option-group">
      <button class="pixel-btn" onclick={alternarIdioma}>
        {$language === "pt" ? "Português" : "English"} 
      </button>
    </div>
    
    <hr />

    <div class="option-group">
      <button class="pixel-btn" onclick={() => goto("/")}>
        {$language === "pt" ? "Voltar" : "Back"}
      </button>
    </div>
  </div> 
</div>