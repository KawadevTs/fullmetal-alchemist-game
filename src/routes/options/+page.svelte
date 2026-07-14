<script lang="ts">
  import "../../assets/styles/opçoes.css";
  import { goto } from "$app/navigation";
  import { language } from "$lib/stores";

  function alternarIdioma(): void {
    language.update((lang: "pt" | "en") => (lang === "pt" ? "en" : "pt"));
  }
</script>

<div class="menu2">
  
  <img src="/images/background.png" alt="Background" class="background2" />

  <div class="menu-container1">
    
    <h2>{$language === "pt" ? "OPÇÕES" : "OPTIONS"}</h2>

    <div class="option-group">
      <span class="label">{$language === "pt" ? "Idioma" : "Language"}</span>
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