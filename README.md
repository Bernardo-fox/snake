# Snake Bots

Jogo web estilo Snake.io com bots, mapa com bordas e drops de comida valiosos.

## Requisitos

- Node.js 18+

Para verificar se voce ja tem instalado:

```bash
node -v
```

Se der erro de comando nao encontrado, instale o Node em [nodejs.org](https://nodejs.org) (versao LTS) ou, no Mac, via [Homebrew](https://brew.sh):

```bash
brew install node
```

## Como instalar e rodar

```bash
git clone <url-do-repositorio>
cd snake-bots
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador. A tela inicial mostra suas conquistas e as novidades do jogo; clique em "Jogar" para entrar na arena.

> O jogo roda localmente (nao tem link publico). Enquanto o terminal com `npm run dev` estiver aberto, o endereco continua acessivel; se fechar, e so rodar `npm run dev` de novo dentro da pasta do projeto.

## Controles

- **Mouse / arrastar o dedo**: direciona a cobra
- **Segurar Espaco, clique ou o botao de impulso (aparece em telas de toque)**: impulso (mais velocidade, consome um pouco do tamanho)
- **Espaco / clique**: reinicia apos game over

## Mecanicas

- Mapa 4000x3000 com bordas mortais
- 11 bots + jogador
- Comida normal: +1 tamanho / +1 ponto
- Drop de morte: +2 tamanho / +2 pontos (pellet maior e brilhante)
- Drop de impulso: +1 tamanho / +1 ponto (cai do rabo ao usar o impulso)

## Personalidades dos bots

- **Comilao** (laranja) - Guloso, Faminto, Ganancioso, Devorador: prioriza comida, grande campo de visao para comida
- **Medroso** (tons pastel) - Medroso, Fujao, Assustado, Tremulo: foge de qualquer cobra que se aproxime, so busca comida quando esta seguro
- **Malvado** (vermelho escuro) - Assassino, Cruel, Predador: vai ativamente atras de quem estiver mais perto (bot ou jogador, sem distincao), mais rapido e mais agressivo, tenta cortar o caminho da presa

## Ciclo de dia e noite

O mapa alterna suavemente entre dia e noite (ciclo completo de 90s), com indicador no topo da tela. A noite tambem muda o comportamento dos bots:

- **Comilao**: enxerga pior no escuro, campo de visao para comida reduzido
- **Medroso**: fica mais paranoico, percebe ameacas de mais longe
- **Malvado**: caca melhor no escuro, campo de visao e mira aumentados

## Eventos aleatorios

A cada 20-40s (aproximadamente) acontece um evento, avisado por um banner no topo da tela:

- **Chuva de comida**: 40 comidas normais aparecem de uma vez perto do jogador, cada uma com um anel verde que pulsa por 1.2s
- **Comida gigante**: uma comida dourada bem maior aparece (+8 tamanho / +8 pontos), some sozinha depois de 25s se ninguem pegar
- **Nevoa**: por 18s, uma nevoa cobre o mapa visualmente e reduz o campo de visao de todos os bots pela metade

## Conquistas

Progresso salvo no navegador (persiste entre sessoes). Contador no HUD, aviso na tela ao desbloquear:

- **Sobreviveu 10 minutos**: uma vida continua de pelo menos 10 minutos
- **Comeu 500 comidas**: cumulativo, conta qualquer comida (normal, drop, gigante, impulso)
- **Eliminou 20 cobras**: outra cobra bate no seu corpo e morre por causa disso

## Rei da Arena

A cobra viva com maior pontuacao usa uma coroa dourada acima da cabeca, visivel no mapa, alem de um icone ao lado do nome dela no ranking Top 5 — assim da pra saber quem esta em primeiro mesmo de longe.

## Mensagens de eliminacao

Sempre que uma cobra (bot ou jogador) elimina outra, uma mensagem tipo "Predador eliminou Guloso" aparece no canto inferior esquerdo por alguns segundos, colorida com a cor de quem eliminou.
