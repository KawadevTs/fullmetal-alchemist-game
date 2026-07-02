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
        {$language === "pt" ? "Desenvolvimento" : "Development"}
      </span>

      <div class="credits-list">
        <p>Elcana</p>
        <p>Gabrielly</p>
        <p>Nathasha</p>
        <p>Shislayny</p>
        <p>Wesllan</p>
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