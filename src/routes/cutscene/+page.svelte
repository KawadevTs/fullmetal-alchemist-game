<script lang="ts">
  import "../../assets/styles/cutscene.css";
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { language, playMusic, stopMusic } from "$lib/stores";

  // 🖼️ Lista das imagens
  const imagens: string[] = [
    "/images/cutscene/CS1.jpeg",
    "/images/cutscene/CS2.jpeg",
    "/images/cutscene/CS3.jpeg",
    "/images/cutscene/CS4.jpeg",
    "/images/cutscene/CS5.jpeg",
    "/images/cutscene/CS6.jpeg",
    "/images/cutscene/CS7.jpeg",
    "/images/cutscene/CS8.jpeg",
    "/images/cutscene/CS9.jpeg",
    "/images/cutscene/CS10.jpeg",
    "/images/cutscene/CS11.jpeg",
    "/images/cutscene/CS12.jpeg",
    "/images/cutscene/CS13.jpeg",
    "/images/cutscene/CS14.jpeg",
    "/images/cutscene/CS15.jpeg",
    "/images/cutscene/CS16.jpeg",
    "/images/cutscene/CS17.jpeg",
    "/images/cutscene/CS18.jpeg",
    "/images/cutscene/CS19.jpeg",
    "/images/cutscene/CS20.jpeg",
    "/images/cutscene/CS21.jpeg",
    "/images/cutscene/CS22.jpeg"
  ];

  type Cena = { imagem: number; texto: string };

  const historia: Record<"pt" | "en", Cena[]> = {
    pt: [
      { imagem: 0, texto: "Após a morte de sua mãe, Trisha Elric..." },
      { imagem: 1, texto: "os irmãos Edward e Alphonse Elric ficam devastados, incapazes de aceitar a perda." },
      { imagem: 2, texto: "Eles decidem desafiar uma das maiores leis da alquimia: a Transmutação Humana." },
      { imagem: 3, texto: "35L de água, 20kg de carbono, 4L de amônia, 1.5kg de cal, 800g de fósforo, 250g de sais, 100g de nitrogênio, 80g de enxofre..." },
      { imagem: 4, texto: "7.5g de flúor, 5g de ferro, 3g de silício. E a alma de sua mãe." },
      { imagem: 5, texto: "A fórmula dos elementos que compõem um corpo humano. Mas a tentativa falha miseravelmente." },
      { imagem: 6, texto: "A transmutação é interrompida por uma força desconhecida. Edward perde sua perna e Alphonse perde seu corpo inteiro." },
      { imagem: 7, texto: "No momento da transmutação, um portal misterioso se abre diante deles. Edward encontra uma entidade." },
      { imagem: 7, texto: "- Ah que bom que você perguntou. " },
      { imagem: 7, texto: "- Eu sou a existência que vocês chamam de mundo" },
      { imagem: 7, texto: "- também sou chamado de universo, ou de deus, ou de verdade, ou de tudo" },
      { imagem: 7, texto: "- ou ainda de um e mais" },
      { imagem: 8, texto: "- eu sou você" },
      { imagem: 9, texto: "- eu sou o que vocês são" },
      { imagem: 9, texto: "- eu sou o que vocês querem ser" },
      { imagem: 9, texto: "- eu sou o que vocês temem ser" },
      { imagem: 10, texto: "- eu sou a lei da Troca Equivalente" },
      { imagem: 10, texto: "- a lei que rege a alquimia" },
      { imagem: 10, texto: "- a lei que rege tudo" },
      { imagem: 10, texto: "- mas eu não sou um deus. Eu sou apenas um reflexo do desejo humano por poder e conhecimento." },
      { imagem: 10, texto: "- e é por isso que eu estou aqui. Para testar os limites da humanidade e ver até onde eles podem chegar." },
      { imagem: 10, texto: "- me mostre mais" },
      { imagem: 11, texto: "- So posso mostrar o equivalente à taxa que você pagou" },
      { imagem: 11, texto: "- taxa?." },
      { imagem: 11, texto: "- sim taxa." },
      { imagem: 12, texto: " " },
      { imagem: 12, texto: "- Não... não era isso." },
      { imagem: 12, texto: "- Droga" },
      { imagem: 12, texto: "- Socorro... Me ajudem..." },
      { imagem: 13, texto: "- Não pode ser, Não..." },
      { imagem: 14, texto: "- Nâo era isso que eu queria!" },
      { imagem: 13, texto: "- Al... Alphonse." },
      { imagem: 13, texto: "- Por minha culpa.." },
      { imagem: 13, texto: "- Droga!" },
      { imagem: 13, texto: "- Devolva... Ele é meu irmãozinho..." },
      { imagem: 13, texto: "- Que seja um braço, uma perna..."  },
      { imagem: 15, texto: "- Que seja meu coração! Pode levar!" },
      { imagem: 15, texto: "- Then me dê ele de volta..." },
      { imagem: 16, texto: "- É meu único irmão!" },
      { imagem: 17, texto: "Desesperado para salvar o irmão, Edward sacrifica seu braço direito para prender a alma de Alphonse em uma armadura de aço." },
      { imagem: 17, texto: "Quando o ritual acaba, os irmãos percebem que cometeram um erro irreversível. " },
      { imagem: 20, texto: " " },
      { imagem: 20, texto: "em meio aos destroços do porão, um Alquimista Federal surge diante dos irmãos caídos. Roy Mustang" },
      { imagem: 18, texto: "- Vão passar o resto da vida chorando em desespero...ou se ajoelhar perante o exercito em busca das possibilidades que ele oferece?" },
      { imagem: 18, texto: "- Havendo qualquer possibilidade nesse caminho, vocês devem seguir em frente para recuperar seus corpos. Mesmo que seja um rio lamacento" },
      { imagem: 19, texto: "O convite é aceito. O Führer King Bradley assina o decreto formal:" }, 
      { imagem: 21, texto: "Eu, Führer King Bradley por meio deste designo Edward Elric, como alquimista federal sob o titulo de alquimista de aço" },
      { imagem: 19, texto: "Carregando o peso de seus pecados em próteses de metal e armaduras frias, os irmãos Elric partem atrás de uma única pista: A lendária Pedra Filosofal." }
    ],
    en: [
      { imagem: 0, texto: "After the death of their mother, Trisha Elric..." },
      { imagem: 1, texto: "The brothers Edward and Alphonse Elric are devastated, unable to accept the loss." },
      { imagem: 2, texto: "They decide to challenge one of the greatest laws of alchemy: Human Transmutation." },
      { imagem: 3, texto: "35L of water, 20kg of carbon, 4L of ammonia, 1.5kg of lime, 800g of phosphorus, 250g of salts, 100g of nitrogen, 80g of sulfur..." },
      { imagem: 4, texto: "7.5g of fluorine, 5g of iron, 3g of silicon. And the soul of their mother." },
      { imagem: 5, texto: "The formula of the elements that compose a human body. But the attempt fails miserably." },
      { imagem: 6, texto: "The transmutation is interrupted by an unknown force. Edward loses his leg and Alphonse loses his entire body." },
      { imagem: 7, texto: "At the moment of transmutation, a mysterious portal opens before them. Edward encounters an entity." },
      { imagem: 7, texto: "- Oh, that's great that you asked. " },
      { imagem: 7, texto: "- I am the existence that you call the world" },
      { imagem: 7, texto: "- I am also called the universe, or God, or truth, or everything" },
      { imagem: 7, texto: "- or still the one and the many" },
      { imagem: 8, texto: "- I am you" },
      { imagem: 9, texto: "- I am what you are" },
      { imagem: 9, texto: "- I am what you want to be." },
      { imagem: 9, texto: "- I am what you fear to be" },
      { imagem: 10, texto: "- I am the law of Equivalent Exchange" },
      { imagem: 10, texto: "- the law that governs alchemy" },
      { imagem: 10, texto: "- the law that governs everything" },
      { imagem: 10, texto: "- but I am not a god. I am merely a reflection of the human desire for power and knowledge." },
      { imagem: 10, texto: "- And that's why I'm here. To test the limits of humanity and see how far they can go." },
      { imagem: 10, texto: "- Show me more." },
      { imagem: 11, texto: "- I can only show you the equivalent of the fee you paid." },
      { imagem: 11, texto: "- tax?." },
      { imagem: 11, texto: "- yes, tax." },
      { imagem: 12, texto: " " },
      { imagem: 12, texto: "- No... that wasn't it." },
      { imagem: 12, texto: "- no..." },
      { imagem: 12, texto: "- Help... Please help me..." },
      { imagem: 13, texto: "- It can't be, no..." },
      { imagem: 14, texto: "- That's not what I wanted!" },
      { imagem: 13, texto: "- Al... Alphonse." },
      { imagem: 13, texto: "- It's my fault..." },
      { imagem: 13, texto: "- Please!" },
      { imagem: 13, texto: "- Give him back... He's my little brother..." },
      { imagem: 13, texto: "- Whether it's an arm, a leg..."  },
      { imagem: 15, texto: "- Let it be my heart! You can take it!" },
      { imagem: 15, texto: "- Then give it back to me..." },
      { imagem: 16, texto: "- He's my only brother!" },
      { imagem: 17, texto: "Desperate to save his brother, Edward sacrifices his right arm to trap Alphonse's soul in a suit of steel." },
      { imagem: 17, texto: "When the ritual ends, the brothers realize they have made an irreversible mistake. " },
      { imagem: 20, texto: " " },
      { imagem: 20, texto: "Amidst the wreckage of the basement, a State Alchemist emerges before the fallen brothers. Roy Mustang" },
      { imagem: 18, texto: "- Will you spend the rest of their lives crying in despair...or kneel before the army seeking the opportunities it offers?" },
      { imagem: 18, texto: "- If there is any possibility along this path, you must press on to recover your bodies. Even if it is a muddy river." },
      { imagem: 19, texto: "The invitation is accepted. Führer King Bradley signs the formal decree:" }, 
      { imagem: 21, texto: "I, Führer King Bradley, hereby appoint Edward Elric as a State Alchemist under the title of Fullmetal Alchemist." },
      { imagem: 19, texto: "Carrying the weight of their sins in metal prosthetics and cold armor, the Elric brothers set out in search of a single clue: The legendary Philosopher's Stone." }
    ]
  };
  
  let atuais: Cena[] = $derived(historia[$language as "pt" | "en"] ?? historia.pt);
  let indexAtual = $state<number>(0);
  let textoExibido = $state<string>("");
  let caractereIndex = $state<number>(0);
  let intervaloDigitação: ReturnType<typeof setInterval> | null = null;
  let mostrarBalao = $state<boolean>(false);

  function iniciarDigitação(): void {
    clearInterval(intervaloDigitação!);
    textoExibido = "";
    caractereIndex = 0;
    mostrarBalao = false; 

    if (!atuais[indexAtual]) return;

    const textoCompleto = atuais[indexAtual].texto;

    intervaloDigitação = setInterval(() => {
      if (caractereIndex < textoCompleto.length) {
        textoExibido += textoCompleto[caractereIndex];
        caractereIndex++;
      } else {
        clearInterval(intervaloDigitação!);
        if (indexAtual === 7) {
          mostrarBalao = true; 
        }
      }
    }, 40); 
  }

  function proximaCena(): void {
    if (mostrarBalao) return; 
    if (!atuais[indexAtual]) return;

    const textoCompleto = atuais[indexAtual].texto;

    if (textoExibido.length < textoCompleto.length) {
      clearInterval(intervaloDigitação!);
      textoExibido = textoCompleto;
      if (indexAtual === 7) mostrarBalao = true;
      return;
    } 

    if (indexAtual < atuais.length - 1) {
      indexAtual++;
      iniciarDigitação(); 
    } else {
      finalizar();
    }
  }

  function selecionarEscolha(): void {
    mostrarBalao = false;
    indexAtual++;
    iniciarDigitação();
  }

  function voltarCena(): void {
    if (indexAtual > 0) {
      indexAtual--;
      iniciarDigitação();
    }
  }

  function finalizar(): void {
    clearInterval(intervaloDigitação!);
    stopMusic();
    goto("/fase1");
  }

  function sairCutscene(): void {
    clearInterval(intervaloDigitação!);
    stopMusic();
    goto("/");
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      proximaCena();
    }

    if (event.key.toLowerCase() === "x") {
      event.preventDefault();
      event.stopPropagation();
      finalizar();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      sairCutscene();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      voltarCena();
    }
  }

  onMount(() => {
    playMusic("/music/newgame.mp3");
    iniciarDigitação(); 
    window.addEventListener("keydown", handleKeyDown); 
  });

  onDestroy(() => {
    clearInterval(intervaloDigitação!); 
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

<div class="cutscene-container">
  
  <button class="esc-tip" onclick={sairCutscene}>
    {$language === "pt" ? "Pressione ESC para sair" : "Press ESC to exit"}
  </button>

  <button class="skip-tip" onclick={finalizar}>
    {$language === "pt" ? "Pressione [X] para pular" : "Press [X] to skip"}
  </button>

  <div class="image-wrapper">
    <img src={imagens[atuais[indexAtual].imagem]} alt="Story" class="story-img" />
    
    {#if mostrarBalao}
      <div class="choice-balloon">
        <button class="choice-btn" onclick={selecionarEscolha}>
          ➟ {$language === "pt" ? "Quem é você?" : "Who are you?"}
        </button>
      </div>
    {/if}
  </div> 
  
  <div class="text-wrapper">
    <p class="story-text">{textoExibido}<span class="cursor">_</span></p>
  </div>

  {#if !mostrarBalao}
    <button class="prev-btn" onclick={voltarCena}>➟</button>
    <button class="next-btn" onclick={proximaCena}>➟</button>
  {/if}

</div>