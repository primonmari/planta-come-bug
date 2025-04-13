const planta = document.getElementById("planta");
const gameOverEl = document.getElementById("game-over");
const placarEl = document.getElementById("placar");
const titulo = document.getElementById("titulo");
const pontuacaoFinal = document.getElementById("pontuacao-final");

let plantaX = window.innerWidth / 2; //pega a largura da janela do navegador e divide por 2, plantaX vai valer o meio da tela
let gameAtivo = true;
let pontos = 0;
let bugsIntervalo; // status do jogo (ativo ou game over)
const bugsAtivos = []; // armazena intervalos de movimento dos bugs

const erros = [
  "SyntaxError: Unexpected token 'else'",
  "TypeError: Cannot read properties of null",
  "ReferenceError: score is not defined",
  "RangeError: Maximum call stack size exceeded",
  "TypeError: undefined is not a function",
  "Error: Division by zero",
  "SyntaxError: Unexpected end of input",
  "ReferenceError: player not defined",
  "TypeError: Cannot set property 'lives' of undefined",
  "Error: Invalid game state",
  "URIError: Invalid URI character",
  "Error: Unexpected movement detected",
  "TypeError: Failed to execute 'appendChild' on 'Node'",
  "SyntaxError: Invalid or unexpected token",
  "Error: Game loop exceeded frame limit",
  "ReferenceError: enemySpeed is not defined",
  "TypeError: Cannot convert undefined or null to object",
  "Error: Position out of bounds",
  "Error: Collision logic failed",
  "TypeError: 'undefined' is not an object",
];

planta.style.left = `${plantaX}px`;

//movimento com as seta do teclado

let movimentoInterval = null; //guarda o setInterval que vai ficar movendo a planta, p/ que possa parar movim. com clearInterval

//documento inteiro vai escutar quando uma tecla for pressionada
// (E) é uma função que guarda a tecla apertada
document.addEventListener("keydown", (e) => {
  //Se o jogo tiver acabado (!gameAtivo), não faz nada.
  //Se movimentoInterval já estiver ativo, não cria outro intervalo — evita bugs de mover mais rápido quando segura por muito tempo
  if (!gameAtivo || movimentoInterval) return;

  const step = 20;//planta anda de 10px por vez

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    //Dentro do setInterval, a planta anda 10 pixels a cada 30 milisseg.
    movimentoInterval = setInterval(() => {
      if (e.key === "ArrowLeft") {
        //Subtrai 10 de plantaX, move pra esquerda
        plantaX -= step;
        //Se a planta tentar passar do canto esquerdo da tela (< 0), ele trava em 0
        if (plantaX < 0) plantaX = 0;
        //se a planta tentar sair da tela pela direita, limita o valor.
      } else if (e.key === "ArrowRight") {
        plantaX += step;
        if (plantaX > window.innerWidth - 120)
          plantaX = window.innerWidth - 120;
      }
      planta.style.left = `${plantaX}px`;
    }, 30);
  }
});

document.addEventListener("keyup", () => {
  clearInterval(movimentoInterval);
  movimentoInterval = null;
});


function atualizarPlacar() {
  //placarEl é a referência ao elemento HTML onde aparece o placar (<div id="placar">)
  //.textContent muda o texto dentro dessa <div>.
  placarEl.textContent = `Placar: ${pontos}`;
}

function animarPlanta() {
  //animate função nativa do Javascript
  planta.animate(
    [
      { transform: "scale(1)" }, // tamanho normal (início)
      { transform: "scale(1.2)" }, // aumenta 20%
      { transform: "scale(1)" }, // volta ao tamanho original
    ],
    {
      duration: 300, // duração de 300ms (0.3 segundos)
      easing: "ease-in-out", // começa e termina suavemente
    }
  );
}

function criarBug() {
  if (!gameAtivo) return;
  const bug = document.createElement("div");
  bug.classList.add("bug");
  const erro = erros[Math.floor(Math.random() * erros.length)];

  bug.innerHTML = `
        <div class="error-msg">${erro}</div>
        <img src="./images/bug.png" />
      `;
  //coloca bug em posição horizontal na tela
  //window.innerWidth = largura da tela e - 50 evita que ele vá além da borda
  //Math.random() = valor entre 0 e 1
  bug.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
  document.body.appendChild(bug); //add bug no html

  const intervalo = setInterval(() => {
    if (!gameAtivo) {
      bug.remove(); // remove o bug se o jogo parou
      clearInterval(intervalo); // para a animação desse bug
      return;
    }

    const topAtual = parseInt(bug.style.top || -60); //Se ainda não tem valor (primeira vez), começa em -60 (fora da tela, lá em cima)
    bug.style.top = `${topAtual + 2}px`; // define a posição vertical do bug (topo).
    //A cada rodada, soma +2px → Faz o bug cair lentamente pra baixo.

    const bugRect = bug.getBoundingClientRect(); //posição do bug
    const plantaRect = planta.getBoundingClientRect(); //posição da planta

    const encostou = !(
      //verifica se NÃO há separação entre os dois elementos
      bugRect.bottom < plantaRect.top || //Se não estão um em cima do outro
      bugRect.top > plantaRect.bottom ||
      bugRect.right < plantaRect.left || //Se não estão um ao lado do outro
      bugRect.left > plantaRect.right
    );

    if (encostou) {
      bug.remove();               // tira o bug da tela
      clearInterval(intervalo);   // para de mover esse bug
      pontos++;                   // soma 1 ponto
      atualizarPlacar();          // atualiza o placar na tela
      animarPlanta();             // anima a plantinha
    //em caso de game over 
    }else if (bugRect.top > window.innerHeight) {
      bug.remove();               // sumiu da tela, então remove
      clearInterval(intervalo);   // para o movimento
      if (gameAtivo) encerrarJogo(); // se o jogo ainda tá rolando, é game over
    }
  },20);
  
  bugsAtivos.push(intervalo); //útil pra dar clearInterval se precisar resetar o jogo.

}


function encerrarJogo(){
  gameAtivo = false;
  clearInterval(bugsIntervalo); //para criação de novos bugs
  bugsAtivos.forEach(clearInterval); //passa por todos os intervalos de animação dos bugs que já estão na tela e para todos com clearInterval.
  bugsAtivos.length = 0;  //limpa/zera o array 

  //Seleciona todos os elementos com a classe bug e remove
  document.querySelectorAll(".bug").forEach((b) => b.remove());

  pontuacaoFinal.textContent = pontos; //pontos é a variável que foi contando os acertos
  titulo.style.display = "none";
  gameOverEl.style.display = "block";
}


function reiniciarJogo() {
  gameOverEl.style.display = "none";
  titulo.style.display = "block";
  plantaX = window.innerWidth / 2;
  planta.style.left = `${plantaX}px`;
  pontos = 0;
  atualizarPlacar();
  gameAtivo = true;

  // recomeçar criação de bugs
  bugsIntervalo = setInterval(() => {
    if (gameAtivo) criarBug();
  }, 1500);
}

// Iniciar o jogo
bugsIntervalo = setInterval(() => {
  if (gameAtivo) criarBug();
}, 1000);

