// Espera o HTML carregar antes de rodar qualquer coisa
document.addEventListener("DOMContentLoaded", function () {
  var cabecalho = document.getElementById("cabecalho");
  var menuBotao = document.getElementById("menuBotao");
  var menu = document.getElementById("menu");
  var linksDoMenu = document.querySelectorAll(".menu__link");

  /* ---------- 01. Menu hambúrguer ---------- */

  function menuEstaAberto() {
    return menu.classList.contains("menu--aberto");
  }

  function abrirOuFechar(abrir) {
    menu.classList.toggle("menu--aberto", abrir);
    menuBotao.classList.toggle("menu-botao--aberto", abrir);
    // Avisa leitores de tela se está aberto ou fechado
    menuBotao.setAttribute("aria-expanded", String(abrir));
  }

  if (menuBotao && menu) {
    menuBotao.addEventListener("click", function () {
      abrirOuFechar(!menuEstaAberto());
    });

    // Fecha ao clicar em um link do próprio menu
    linksDoMenu.forEach(function (link) {
      link.addEventListener("click", function () {
        if (menuEstaAberto()) abrirOuFechar(false);
      });
    });

    // Fecha com a tecla Esc
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && menuEstaAberto()) {
        abrirOuFechar(false);
        menuBotao.focus();
      }
    });

    // Fecha ao tocar fora do menu
    document.addEventListener("click", function (evento) {
      if (!menuEstaAberto()) return;
      var dentro =
        menu.contains(evento.target) || menuBotao.contains(evento.target);
      if (!dentro) abrirOuFechar(false);
    });

    // Se a tela crescer e o menu virar barra de novo, não deixa o estado preso
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000 && menuEstaAberto()) abrirOuFechar(false);
    });
  }

  /* ---------- 02. Seções que o menu acompanha ---------- */

  // Só os links que apontam para uma seção desta página. O botão
  // "Acessar o app" leva para fora, então fica de fora da lista.
  var secoes = [];

  linksDoMenu.forEach(function (link) {
    var destino = link.getAttribute("href") || "";
    if (destino.charAt(0) !== "#") return;

    var secao = document.getElementById(destino.slice(1));
    if (secao) secoes.push({ link: link, elemento: secao });
  });

  function marcarSecaoAtual() {
    if (secoes.length === 0) return;

    // 40% da altura da tela: a seção "vale" quando já passou desse ponto
    var linha = window.innerHeight * 0.4;
    var atual = secoes[0];

    secoes.forEach(function (item) {
      if (item.elemento.getBoundingClientRect().top <= linha) atual = item;
    });

    // No fim da página, marca sempre a última (senão a última seção,
    // que costuma ser curta, nunca chega a ser marcada)
    var fimDaPagina =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    if (fimDaPagina) atual = secoes[secoes.length - 1];

    secoes.forEach(function (item) {
      item.link.classList.toggle("menu__link--ativo", item === atual);
    });
  }

  /* ---------- 03. Sombra no cabeçalho ao rolar ---------- */

  function atualizarCabecalho() {
    if (!cabecalho) return;
    cabecalho.classList.toggle("cabecalho--rolado", window.scrollY > 20);
  }

  /* ---------- 04. Um único ouvinte de rolagem ---------- */

  // Dois ouvintes separados rodavam o dobro de vezes à toa. Aqui o
  // navegador avisa uma vez e o requestAnimationFrame segura o trabalho
  // até o próximo quadro, que é quando ele de fato vai desenhar.
  var aguardando = false;

  function aoRolar() {
    if (aguardando) return;
    aguardando = true;

    window.requestAnimationFrame(function () {
      atualizarCabecalho();
      marcarSecaoAtual();
      aguardando = false;
    });
  }

  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);
  aoRolar(); // estado correto já no carregamento

  /* ---------- 05. Animação de entrada ---------- */

  var elementos = document.querySelectorAll(
    ".secao__cabecalho, .dor, .card, .passo, .integrante, .tec-grupo",
  );

  var querMenosAnimacao =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !querMenosAnimacao) {
    elementos.forEach(function (el) {
      el.classList.add("revelar");
    });

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target); // anima só uma vez
        });
      },
      { threshold: 0.12 },
    );

    elementos.forEach(function (el) {
      observador.observe(el);
    });
  }
});
