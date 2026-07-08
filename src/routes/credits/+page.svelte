<script lang="ts">
  import "../../assets/styles/credits.css";
  import { goto } from "$app/navigation";
  import { language } from "$lib/stores";
</script>

<div class="menu2">
  
  <img src="/images/background.png" alt="Background" class="background2" />

  <div class="menu-container2">
    
    <h2>{$language === "pt" ? "CRÉDITOS" : "CREDITS"}</h2>

    <div class="option-group">
      <span class="label">
        {$language === "pt" ? "Desenvolvido por:" : "Developed by:"}
      </span>

      <div class="credits-list">
        <p>Gabrielly Oliveira</p>
        <p>Natasha Scanoni</p>
        <p>Shislayny Evelen</p>
        <p>Tacila Souza</p>
        <p>Wesllan Kawã</p>
      </div>
    </div>

    <hr />

    <div class="option-group">
      <button class="pixel-btn" onclick={() => goto("/")}>
        {$language === "pt" ? "Voltar" : "Back"}
      </button>
    </div>

  </div>
</div>