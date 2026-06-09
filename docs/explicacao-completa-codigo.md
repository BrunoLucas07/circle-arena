# Explicação completa do código

Este arquivo foi feito para ajudar a equipe a estudar o projeto antes da apresentação. Ele mostra onde ficam as principais partes do código e explica linha por linha os arquivos que fazem o Circle Arena funcionar.

## Integrantes

- Antônio Carlos
- Bruno Lucas dos Santos
- Breno Benítez Falqueiro
- Eduardo do Prado Pereira
- Túlio Henrique Santos Gonçalves

## Resumo rápido por arquivo

- `index.html`: estrutura da tela, campos, botões, canvas e painel de telemetria.
- `styles.css`: visual da interface, layout, botões, cards, canvas e console de mensagens.
- `app.js`: lógica principal do jogo, MQTT no navegador, movimento, colisão e desenho no canvas.
- `wokwi/sketch.ino`: firmware do ESP32 simulado, botões, LED e MQTT TCP.
- `wokwi/diagram.json`: componentes e ligações do circuito no Wokwi.
- `netlify.toml`: configuração simples de publicação no Netlify.

## Mapa das funções principais

### `app.js`

| Função | Linhas | O que faz |
|---|---:|---|
| `clamp` | 55-57 | Limita um valor entre mínimo e máximo. |
| `randomBetween` | 59-61 | Gera posição ou tamanho aleatório dentro de um intervalo. |
| `playerRadius` | 63-65 | Calcula o tamanho da bolinha com base na pontuação. |
| `respawnPlayer` | 67-75 | Reposiciona jogador após reinício ou quando é engolido. |
| `addLog` | 77-82 | Adiciona mensagem no histórico visual. |
| `setLastPayload` | 84-87 | Atualiza o console de última mensagem MQTT. |
| `sanitizeTopic` | 89-91 | Limpa o nome da sala para virar tópico válido. |
| `playerTemplate` | 93-108 | Cria o objeto base de um jogador. |
| `localPlayer` | 110-115 | Garante que o jogador local exista no mapa de jogadores. |
| `seedWorld` | 117-133 | Cria energia e obstáculos da arena. |
| `setStatus` | 135-138 | Atualiza status de conexão na interface. |
| `syncTopicLabels` | 140-144 | Mostra os tópicos atuais no painel. |
| `publish` | 146-152 | Publica payload JSON via MQTT. |
| `publishLocalState` | 154-167 | Publica estado do jogador local. |
| `publishPresence` | 169-177 | Publica online/offline. |
| `handleMessage` | 179-234 | Recebe e interpreta mensagens MQTT. |
| `connectMqtt` | 236-304 | Conecta ao broker, configura LWT e assina tópicos. |
| `enableLocalMode` | 306-317 | Desliga MQTT e volta ao modo local. |
| `movePlayer` | 319-340 | Move o jogador local com teclado. |
| `updateSimulator` | 342-368 | Move o rival local simulado. |
| `collectEnergy` | 370-381 | Detecta coleta de energia e soma pontos. |
| `applyHazards` | 383-392 | Aplica efeito dos obstáculos. |
| `canEatPlayer` | 394-399 | Verifica se uma bolinha pode engolir outra. |
| `eatPlayer` | 401-424 | Executa a ação de engolir e pontuar. |
| `resolvePlayerEating` | 426-442 | Verifica colisões entre jogadores. |
| `updateWorld` | 444-479 | Atualiza o estado geral da partida. |
| `drawGrid` | 481-499 | Desenha fundo quadriculado. |
| `drawWorld` | 501-543 | Desenha arena, energia, obstáculos e jogadores. |
| `loop` | 546-552 | Loop principal da animação. |
| `resetGame` | 554-560 | Reinicia a partida. |
| `bindEvents` | 562-611 | Liga botões e teclado às funções do jogo. |

### `wokwi/sketch.ino`

| Função | Linhas | O que faz |
|---|---:|---|
| `onMessage` | 24-46 | Trata mensagens MQTT recebidas pelo ESP32. |
| `connectWifi` | 48-53 | Conecta o ESP32 ao Wi-Fi do Wokwi. |
| `connectMqtt` | 55-66 | Conecta ao broker, assina tópicos e publica presença. |
| `setup` | 68-78 | Configura pinos, Wi-Fi, MQTT e callback. |
| `loop` | 80-102 | Mantém MQTT ativo e publica comandos dos botões. |

## index.html

Estrutura da interface web.

| Linha | Código | Explicação |
|---:|---|---|
| 1 | `<!doctype html>` | Declara que o documento usa HTML5. |
| 2 | `<html lang="pt-BR">` | Abre o documento HTML e define o idioma da página. |
| 3 | `  <head>` | Abre a área de metadados da página. |
| 4 | `    <meta charset="utf-8">` | Define um elemento HTML usado na estrutura da página. |
| 5 | `    <meta name="viewport" content="width=device-width, initial-scale=1">` | Define um elemento HTML usado na estrutura da página. |
| 6 | `    <title>Circle Arena</title>` | Define o título que aparece na aba do navegador. |
| 7 | `    <link rel="stylesheet" href="styles.css">` | Carrega o arquivo CSS com a aparência da interface. |
| 8 | `    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js" defer></script>` | Carrega a biblioteca MQTT.js, usada para conectar o navegador ao broker via WebSocket. |
| 9 | `    <script src="app.js" defer></script>` | Carrega o JavaScript principal do jogo. |
| 10 | `  </head>` | Fecha a área de metadados. |
| 11 | `  <body>` | Abre o corpo visível da página. |
| 12 | `    <main class="shell">` | Abre a área principal da aplicação. |
| 13 | `      <section class="topbar">` | Abre uma seção visual da interface. |
| 14 | `        <div>` | Abre um bloco de layout. |
| 15 | `          <p class="eyebrow">Projeto distribuido com MQTT</p>` | Mostra um parágrafo de apoio na interface. |
| 16 | `          <h1>Circle Arena</h1>` | Mostra o nome principal do projeto na interface. |
| 17 | `        </div>` | Fecha um bloco de layout. |
| 18 | `        <div class="status-strip" aria-live="polite">` | Abre um bloco de layout. |
| 19 | `          <span id="statusDot" class="dot"></span>` | Cria um pequeno elemento de texto usado por status ou informação. |
| 20 | `          <span id="connectionStatus">Modo local</span>` | Cria um pequeno elemento de texto usado por status ou informação. |
| 21 | `        </div>` | Fecha um bloco de layout. |
| 22 | `      </section>` | Fecha uma seção visual da interface. |
| 23 | `(em branco)` | Linha em branco usada para separar blocos do HTML. |
| 24 | `      <section class="layout">` | Abre uma seção visual da interface. |
| 25 | `        <aside class="panel controls" aria-label="Configuracoes da partida">` | Define um elemento HTML usado na estrutura da página. |
| 26 | `          <div class="field">` | Abre um bloco de layout. |
| 27 | `            <label for="playerName">Jogador</label>` | Cria um rótulo para um campo do formulário. |
| 28 | `            <input id="playerName" maxlength="16" autocomplete="off">` | Cria um campo de entrada usado pela interface. |
| 29 | `          </div>` | Fecha um bloco de layout. |
| 30 | `          <div class="field">` | Abre um bloco de layout. |
| 31 | `            <label for="brokerUrl">Broker WebSocket</label>` | Cria um rótulo para um campo do formulário. |
| 32 | `            <input id="brokerUrl" value="wss://broker.hivemq.com:8884/mqtt" spellcheck="false">` | Cria um campo de entrada usado pela interface. |
| 33 | `          </div>` | Fecha um bloco de layout. |
| 34 | `          <div class="field">` | Abre um bloco de layout. |
| 35 | `            <label for="brokerUser">Usuario MQTT</label>` | Cria um rótulo para um campo do formulário. |
| 36 | `            <input id="brokerUser" placeholder="opcional" autocomplete="off" spellcheck="false">` | Cria um campo de entrada usado pela interface. |
| 37 | `          </div>` | Fecha um bloco de layout. |
| 38 | `          <div class="field">` | Abre um bloco de layout. |
| 39 | `            <label for="brokerPass">Senha MQTT</label>` | Cria um rótulo para um campo do formulário. |
| 40 | `            <input id="brokerPass" type="password" placeholder="opcional" autocomplete="off">` | Cria um campo de entrada usado pela interface. |
| 41 | `          </div>` | Fecha um bloco de layout. |
| 42 | `          <div class="field">` | Abre um bloco de layout. |
| 43 | `            <label for="roomTopic">Sala MQTT</label>` | Cria um rótulo para um campo do formulário. |
| 44 | `            <input id="roomTopic" value="circle-arena-demo" spellcheck="false">` | Cria um campo de entrada usado pela interface. |
| 45 | `          </div>` | Fecha um bloco de layout. |
| 46 | `          <div class="split">` | Abre um bloco de layout. |
| 47 | `            <button id="connectBtn" class="primary" type="button">Conectar</button>` | Cria um botão de ação da interface. |
| 48 | `            <button id="localBtn" type="button">Modo local</button>` | Cria um botão de ação da interface. |
| 49 | `          </div>` | Fecha um bloco de layout. |
| 50 | `          <div class="split">` | Abre um bloco de layout. |
| 51 | `            <button id="simulateBtn" type="button">Simular rival</button>` | Cria um botão de ação da interface. |
| 52 | `            <button id="resetBtn" type="button">Reiniciar</button>` | Cria um botão de ação da interface. |
| 53 | `          </div>` | Fecha um bloco de layout. |
| 54 | `          <div class="split">` | Abre um bloco de layout. |
| 55 | `            <button id="deviceBtn" type="button">Piscar ESP32</button>` | Cria um botão de ação da interface. |
| 56 | `            <button id="pingBtn" type="button">Ping MQTT</button>` | Cria um botão de ação da interface. |
| 57 | `          </div>` | Fecha um bloco de layout. |
| 58 | `          <div class="hint">` | Abre um bloco de layout. |
| 59 | `            Use WASD ou setas. Colete energia para crescer, evite zonas vermelhas e engula bolinhas menores.` | Texto ou atributo usado pela estrutura HTML da interface. |
| 60 | `          </div>` | Fecha um bloco de layout. |
| 61 | `        </aside>` | Fecha a tag HTML correspondente. |
| 62 | `(em branco)` | Linha em branco usada para separar blocos do HTML. |
| 63 | `        <section class="arena-wrap" aria-label="Arena do jogo">` | Abre uma seção visual da interface. |
| 64 | `          <canvas id="game" width="960" height="620"></canvas>` | Cria o canvas onde a arena do jogo é desenhada. |
| 65 | `          <div class="hud">` | Abre um bloco de layout. |
| 66 | `            <div>` | Abre um bloco de layout. |
| 67 | `              <strong id="score">0</strong>` | Define um elemento HTML usado na estrutura da página. |
| 68 | `              <span>pontos</span>` | Cria um pequeno elemento de texto usado por status ou informação. |
| 69 | `            </div>` | Fecha um bloco de layout. |
| 70 | `            <div>` | Abre um bloco de layout. |
| 71 | `              <strong id="playersOnline">1</strong>` | Define um elemento HTML usado na estrutura da página. |
| 72 | `              <span>online</span>` | Cria um pequeno elemento de texto usado por status ou informação. |
| 73 | `            </div>` | Fecha um bloco de layout. |
| 74 | `            <div>` | Abre um bloco de layout. |
| 75 | `              <strong id="latency">--</strong>` | Define um elemento HTML usado na estrutura da página. |
| 76 | `              <span>latencia</span>` | Cria um pequeno elemento de texto usado por status ou informação. |
| 77 | `            </div>` | Fecha um bloco de layout. |
| 78 | `          </div>` | Fecha um bloco de layout. |
| 79 | `        </section>` | Fecha uma seção visual da interface. |
| 80 | `(em branco)` | Linha em branco usada para separar blocos do HTML. |
| 81 | `        <aside class="panel telemetry" aria-label="Telemetria MQTT">` | Define um elemento HTML usado na estrutura da página. |
| 82 | `          <div class="section-title">` | Abre um bloco de layout. |
| 83 | `            <h2>Telemetria</h2>` | Mostra um título de seção na interface. |
| 84 | `            <span id="topicLabel">offline</span>` | Cria um pequeno elemento de texto usado por status ou informação. |
| 85 | `          </div>` | Fecha um bloco de layout. |
| 86 | `          <dl>` | Define um elemento HTML usado na estrutura da página. |
| 87 | `            <div>` | Abre um bloco de layout. |
| 88 | `              <dt>Topico de comandos</dt>` | Define um elemento HTML usado na estrutura da página. |
| 89 | `              <dd id="cmdTopic">local</dd>` | Define um elemento HTML usado na estrutura da página. |
| 90 | `            </div>` | Fecha um bloco de layout. |
| 91 | `            <div>` | Abre um bloco de layout. |
| 92 | `              <dt>Topico de estado</dt>` | Define um elemento HTML usado na estrutura da página. |
| 93 | `              <dd id="stateTopic">local</dd>` | Define um elemento HTML usado na estrutura da página. |
| 94 | `            </div>` | Fecha um bloco de layout. |
| 95 | `            <div>` | Abre um bloco de layout. |
| 96 | `              <dt>Última mensagem</dt>` | Define um elemento HTML usado na estrutura da página. |
| 97 | `              <dd>` | Define um elemento HTML usado na estrutura da página. |
| 98 | `                <textarea id="lastPayload" class="payload-console" readonly aria-label="Última mensagem recebida">nenhuma</textarea>` | Cria a caixa tipo console usada para mostrar a última mensagem MQTT. |
| 99 | `              </dd>` | Fecha a tag HTML correspondente. |
| 100 | `            </div>` | Fecha um bloco de layout. |
| 101 | `          </dl>` | Fecha a tag HTML correspondente. |
| 102 | `          <ol id="log" class="log"></ol>` | Define um elemento HTML usado na estrutura da página. |
| 103 | `        </aside>` | Fecha a tag HTML correspondente. |
| 104 | `      </section>` | Fecha uma seção visual da interface. |
| 105 | `    </main>` | Fecha a área principal da aplicação. |
| 106 | `  </body>` | Fecha o corpo visível da página. |
| 107 | `</html>` | Fecha o documento HTML. |

## styles.css

Aparência visual da interface.

| Linha | Código | Explicação |
|---:|---|---|
| 1 | `:root {` | Inicia uma regra CSS para o seletor indicado. |
| 2 | `  color-scheme: dark;` | Define a propriedade CSS \`color-scheme\` para ajustar o visual ou o layout. |
| 3 | `  --bg: #111318;` | Define a propriedade CSS \`--bg\` para ajustar o visual ou o layout. |
| 4 | `  --panel: #1d2028;` | Define a propriedade CSS \`--panel\` para ajustar o visual ou o layout. |
| 5 | `  --panel-2: #252936;` | Define a propriedade CSS \`--panel-2\` para ajustar o visual ou o layout. |
| 6 | `  --line: #383d4c;` | Define a propriedade CSS \`--line\` para ajustar o visual ou o layout. |
| 7 | `  --text: #f4f6fb;` | Define a propriedade CSS \`--text\` para ajustar o visual ou o layout. |
| 8 | `  --muted: #aeb5c7;` | Define a propriedade CSS \`--muted\` para ajustar o visual ou o layout. |
| 9 | `  --green: #46d48f;` | Define a propriedade CSS \`--green\` para ajustar o visual ou o layout. |
| 10 | `  --cyan: #49c7e8;` | Define a propriedade CSS \`--cyan\` para ajustar o visual ou o layout. |
| 11 | `  --yellow: #ffd166;` | Define a propriedade CSS \`--yellow\` para ajustar o visual ou o layout. |
| 12 | `  --red: #ff5d73;` | Define a propriedade CSS \`--red\` para ajustar o visual ou o layout. |
| 13 | `}` | Fecha a regra CSS atual. |
| 14 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 15 | `* {` | Inicia uma regra CSS para o seletor indicado. |
| 16 | `  box-sizing: border-box;` | Define a propriedade CSS \`box-sizing\` para ajustar o visual ou o layout. |
| 17 | `}` | Fecha a regra CSS atual. |
| 18 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 19 | `html,` | Linha de CSS usada para composição visual da interface. |
| 20 | `body {` | Inicia uma regra CSS para o seletor indicado. |
| 21 | `  margin: 0;` | Define espaçamento externo. |
| 22 | `  min-height: 100%;` | Define altura mínima. |
| 23 | `  background:` | Define cor ou fundo visual do elemento. |
| 24 | `    radial-gradient(circle at 20% 10%, rgba(73, 199, 232, 0.14), transparent 32rem),` | Linha de CSS usada para composição visual da interface. |
| 25 | `    linear-gradient(145deg, #111318 0%, #171922 44%, #101217 100%);` | Linha de CSS usada para composição visual da interface. |
| 26 | `  color: var(--text);` | Define a cor do texto. |
| 27 | `  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;` | Define a propriedade CSS \`font-family\` para ajustar o visual ou o layout. |
| 28 | `}` | Fecha a regra CSS atual. |
| 29 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 30 | `button,` | Linha de CSS usada para composição visual da interface. |
| 31 | `input,` | Linha de CSS usada para composição visual da interface. |
| 32 | `textarea {` | Inicia uma regra CSS para o seletor indicado. |
| 33 | `  font: inherit;` | Define a propriedade CSS \`font\` para ajustar o visual ou o layout. |
| 34 | `}` | Fecha a regra CSS atual. |
| 35 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 36 | `.shell {` | Inicia uma regra CSS para o seletor indicado. |
| 37 | `  width: min(1460px, calc(100vw - 32px));` | Define largura. |
| 38 | `  margin: 0 auto;` | Define espaçamento externo. |
| 39 | `  padding: 24px 0;` | Define espaçamento interno. |
| 40 | `}` | Fecha a regra CSS atual. |
| 41 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 42 | `.topbar {` | Inicia uma regra CSS para o seletor indicado. |
| 43 | `  display: flex;` | Define como o elemento será exibido no layout. |
| 44 | `  align-items: end;` | Alinha itens no eixo transversal. |
| 45 | `  justify-content: space-between;` | Alinha itens no eixo principal. |
| 46 | `  gap: 16px;` | Define o espaçamento entre elementos. |
| 47 | `  margin-bottom: 18px;` | Define a propriedade CSS \`margin-bottom\` para ajustar o visual ou o layout. |
| 48 | `}` | Fecha a regra CSS atual. |
| 49 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 50 | `.eyebrow {` | Inicia uma regra CSS para o seletor indicado. |
| 51 | `  margin: 0 0 4px;` | Define espaçamento externo. |
| 52 | `  color: var(--cyan);` | Define a cor do texto. |
| 53 | `  font-size: 0.78rem;` | Define tamanho da fonte. |
| 54 | `  font-weight: 800;` | Define peso da fonte. |
| 55 | `  text-transform: uppercase;` | Define a propriedade CSS \`text-transform\` para ajustar o visual ou o layout. |
| 56 | `}` | Fecha a regra CSS atual. |
| 57 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 58 | `h1,` | Linha de CSS usada para composição visual da interface. |
| 59 | `h2 {` | Inicia uma regra CSS para o seletor indicado. |
| 60 | `  margin: 0;` | Define espaçamento externo. |
| 61 | `  letter-spacing: 0;` | Define a propriedade CSS \`letter-spacing\` para ajustar o visual ou o layout. |
| 62 | `}` | Fecha a regra CSS atual. |
| 63 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 64 | `h1 {` | Inicia uma regra CSS para o seletor indicado. |
| 65 | `  font-size: clamp(2rem, 3.5vw, 4rem);` | Define tamanho da fonte. |
| 66 | `  line-height: 0.95;` | Define a propriedade CSS \`line-height\` para ajustar o visual ou o layout. |
| 67 | `}` | Fecha a regra CSS atual. |
| 68 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 69 | `h2 {` | Inicia uma regra CSS para o seletor indicado. |
| 70 | `  font-size: 1.05rem;` | Define tamanho da fonte. |
| 71 | `}` | Fecha a regra CSS atual. |
| 72 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 73 | `.status-strip {` | Inicia uma regra CSS para o seletor indicado. |
| 74 | `  display: inline-flex;` | Define como o elemento será exibido no layout. |
| 75 | `  align-items: center;` | Alinha itens no eixo transversal. |
| 76 | `  gap: 10px;` | Define o espaçamento entre elementos. |
| 77 | `  min-height: 42px;` | Define altura mínima. |
| 78 | `  padding: 0 14px;` | Define espaçamento interno. |
| 79 | `  border: 1px solid var(--line);` | Define borda do elemento. |
| 80 | `  border-radius: 8px;` | Arredonda os cantos do elemento. |
| 81 | `  background: rgba(29, 32, 40, 0.8);` | Define cor ou fundo visual do elemento. |
| 82 | `  color: var(--muted);` | Define a cor do texto. |
| 83 | `}` | Fecha a regra CSS atual. |
| 84 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 85 | `.dot {` | Inicia uma regra CSS para o seletor indicado. |
| 86 | `  width: 10px;` | Define largura. |
| 87 | `  height: 10px;` | Define altura. |
| 88 | `  border-radius: 999px;` | Arredonda os cantos do elemento. |
| 89 | `  background: var(--yellow);` | Define cor ou fundo visual do elemento. |
| 90 | `  box-shadow: 0 0 18px var(--yellow);` | Define sombra visual. |
| 91 | `}` | Fecha a regra CSS atual. |
| 92 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 93 | `.dot.online {` | Inicia uma regra CSS para o seletor indicado. |
| 94 | `  background: var(--green);` | Define cor ou fundo visual do elemento. |
| 95 | `  box-shadow: 0 0 18px var(--green);` | Define sombra visual. |
| 96 | `}` | Fecha a regra CSS atual. |
| 97 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 98 | `.dot.error {` | Inicia uma regra CSS para o seletor indicado. |
| 99 | `  background: var(--red);` | Define cor ou fundo visual do elemento. |
| 100 | `  box-shadow: 0 0 18px var(--red);` | Define sombra visual. |
| 101 | `}` | Fecha a regra CSS atual. |
| 102 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 103 | `.layout {` | Inicia uma regra CSS para o seletor indicado. |
| 104 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 105 | `  grid-template-columns: minmax(250px, 300px) minmax(420px, 1fr) minmax(260px, 330px);` | Define as colunas do layout em grid. |
| 106 | `  gap: 16px;` | Define o espaçamento entre elementos. |
| 107 | `  align-items: stretch;` | Alinha itens no eixo transversal. |
| 108 | `}` | Fecha a regra CSS atual. |
| 109 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 110 | `.panel {` | Inicia uma regra CSS para o seletor indicado. |
| 111 | `  border: 1px solid var(--line);` | Define borda do elemento. |
| 112 | `  border-radius: 8px;` | Arredonda os cantos do elemento. |
| 113 | `  background: rgba(29, 32, 40, 0.86);` | Define cor ou fundo visual do elemento. |
| 114 | `  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);` | Define sombra visual. |
| 115 | `}` | Fecha a regra CSS atual. |
| 116 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 117 | `.controls,` | Linha de CSS usada para composição visual da interface. |
| 118 | `.telemetry {` | Inicia uma regra CSS para o seletor indicado. |
| 119 | `  padding: 16px;` | Define espaçamento interno. |
| 120 | `}` | Fecha a regra CSS atual. |
| 121 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 122 | `.field {` | Inicia uma regra CSS para o seletor indicado. |
| 123 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 124 | `  gap: 7px;` | Define o espaçamento entre elementos. |
| 125 | `  margin-bottom: 14px;` | Define a propriedade CSS \`margin-bottom\` para ajustar o visual ou o layout. |
| 126 | `}` | Fecha a regra CSS atual. |
| 127 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 128 | `label,` | Linha de CSS usada para composição visual da interface. |
| 129 | `dt {` | Inicia uma regra CSS para o seletor indicado. |
| 130 | `  color: var(--muted);` | Define a cor do texto. |
| 131 | `  font-size: 0.78rem;` | Define tamanho da fonte. |
| 132 | `  font-weight: 700;` | Define peso da fonte. |
| 133 | `  text-transform: uppercase;` | Define a propriedade CSS \`text-transform\` para ajustar o visual ou o layout. |
| 134 | `}` | Fecha a regra CSS atual. |
| 135 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 136 | `input {` | Inicia uma regra CSS para o seletor indicado. |
| 137 | `  width: 100%;` | Define largura. |
| 138 | `  min-height: 42px;` | Define altura mínima. |
| 139 | `  border: 1px solid var(--line);` | Define borda do elemento. |
| 140 | `  border-radius: 6px;` | Arredonda os cantos do elemento. |
| 141 | `  background: #11141b;` | Define cor ou fundo visual do elemento. |
| 142 | `  color: var(--text);` | Define a cor do texto. |
| 143 | `  padding: 0 11px;` | Define espaçamento interno. |
| 144 | `  outline: none;` | Define a propriedade CSS \`outline\` para ajustar o visual ou o layout. |
| 145 | `}` | Fecha a regra CSS atual. |
| 146 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 147 | `input:focus {` | Inicia uma regra CSS para o seletor indicado. |
| 148 | `  border-color: var(--cyan);` | Define a propriedade CSS \`border-color\` para ajustar o visual ou o layout. |
| 149 | `  box-shadow: 0 0 0 3px rgba(73, 199, 232, 0.16);` | Define sombra visual. |
| 150 | `}` | Fecha a regra CSS atual. |
| 151 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 152 | `.payload-console {` | Inicia uma regra CSS para o seletor indicado. |
| 153 | `  width: 100%;` | Define largura. |
| 154 | `  min-height: 118px;` | Define altura mínima. |
| 155 | `  resize: vertical;` | Controla se o campo pode ser redimensionado. |
| 156 | `  border: 1px solid var(--line);` | Define borda do elemento. |
| 157 | `  border-radius: 6px;` | Arredonda os cantos do elemento. |
| 158 | `  background: #0b0e13;` | Define cor ou fundo visual do elemento. |
| 159 | `  color: #d7f8ff;` | Define a cor do texto. |
| 160 | `  padding: 10px;` | Define espaçamento interno. |
| 161 | `  outline: none;` | Define a propriedade CSS \`outline\` para ajustar o visual ou o layout. |
| 162 | `  font-family: "Cascadia Code", "Consolas", ui-monospace, monospace;` | Define a propriedade CSS \`font-family\` para ajustar o visual ou o layout. |
| 163 | `  font-size: 0.78rem;` | Define tamanho da fonte. |
| 164 | `  line-height: 1.4;` | Define a propriedade CSS \`line-height\` para ajustar o visual ou o layout. |
| 165 | `  overflow-wrap: normal;` | Define a propriedade CSS \`overflow-wrap\` para ajustar o visual ou o layout. |
| 166 | `  white-space: pre-wrap;` | Define a propriedade CSS \`white-space\` para ajustar o visual ou o layout. |
| 167 | `}` | Fecha a regra CSS atual. |
| 168 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 169 | `.payload-console:focus {` | Inicia uma regra CSS para o seletor indicado. |
| 170 | `  border-color: var(--cyan);` | Define a propriedade CSS \`border-color\` para ajustar o visual ou o layout. |
| 171 | `  box-shadow: 0 0 0 3px rgba(73, 199, 232, 0.16);` | Define sombra visual. |
| 172 | `}` | Fecha a regra CSS atual. |
| 173 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 174 | `.split {` | Inicia uma regra CSS para o seletor indicado. |
| 175 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 176 | `  grid-template-columns: 1fr 1fr;` | Define as colunas do layout em grid. |
| 177 | `  gap: 9px;` | Define o espaçamento entre elementos. |
| 178 | `  margin-top: 10px;` | Define a propriedade CSS \`margin-top\` para ajustar o visual ou o layout. |
| 179 | `}` | Fecha a regra CSS atual. |
| 180 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 181 | `button {` | Inicia uma regra CSS para o seletor indicado. |
| 182 | `  min-height: 42px;` | Define altura mínima. |
| 183 | `  border: 1px solid var(--line);` | Define borda do elemento. |
| 184 | `  border-radius: 6px;` | Arredonda os cantos do elemento. |
| 185 | `  background: var(--panel-2);` | Define cor ou fundo visual do elemento. |
| 186 | `  color: var(--text);` | Define a cor do texto. |
| 187 | `  cursor: pointer;` | Define a propriedade CSS \`cursor\` para ajustar o visual ou o layout. |
| 188 | `  font-weight: 800;` | Define peso da fonte. |
| 189 | `}` | Fecha a regra CSS atual. |
| 190 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 191 | `button:hover {` | Inicia uma regra CSS para o seletor indicado. |
| 192 | `  border-color: var(--cyan);` | Define a propriedade CSS \`border-color\` para ajustar o visual ou o layout. |
| 193 | `}` | Fecha a regra CSS atual. |
| 194 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 195 | `button.primary {` | Inicia uma regra CSS para o seletor indicado. |
| 196 | `  background: linear-gradient(135deg, #2ab979, #26a8ce);` | Define cor ou fundo visual do elemento. |
| 197 | `  border-color: transparent;` | Define a propriedade CSS \`border-color\` para ajustar o visual ou o layout. |
| 198 | `  color: #061016;` | Define a cor do texto. |
| 199 | `}` | Fecha a regra CSS atual. |
| 200 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 201 | `.hint {` | Inicia uma regra CSS para o seletor indicado. |
| 202 | `  margin-top: 16px;` | Define a propriedade CSS \`margin-top\` para ajustar o visual ou o layout. |
| 203 | `  padding: 12px;` | Define espaçamento interno. |
| 204 | `  border: 1px solid rgba(255, 209, 102, 0.35);` | Define borda do elemento. |
| 205 | `  border-radius: 8px;` | Arredonda os cantos do elemento. |
| 206 | `  background: rgba(255, 209, 102, 0.08);` | Define cor ou fundo visual do elemento. |
| 207 | `  color: #f2d993;` | Define a cor do texto. |
| 208 | `  font-size: 0.92rem;` | Define tamanho da fonte. |
| 209 | `  line-height: 1.35;` | Define a propriedade CSS \`line-height\` para ajustar o visual ou o layout. |
| 210 | `}` | Fecha a regra CSS atual. |
| 211 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 212 | `.arena-wrap {` | Inicia uma regra CSS para o seletor indicado. |
| 213 | `  position: relative;` | Define a propriedade CSS \`position\` para ajustar o visual ou o layout. |
| 214 | `  min-height: 520px;` | Define altura mínima. |
| 215 | `  overflow: hidden;` | Controla o que acontece quando o conteúdo passa do limite. |
| 216 | `  border: 1px solid var(--line);` | Define borda do elemento. |
| 217 | `  border-radius: 8px;` | Arredonda os cantos do elemento. |
| 218 | `  background: #0c0f14;` | Define cor ou fundo visual do elemento. |
| 219 | `}` | Fecha a regra CSS atual. |
| 220 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 221 | `canvas {` | Inicia uma regra CSS para o seletor indicado. |
| 222 | `  display: block;` | Define como o elemento será exibido no layout. |
| 223 | `  width: 100%;` | Define largura. |
| 224 | `  height: 100%;` | Define altura. |
| 225 | `  min-height: 520px;` | Define altura mínima. |
| 226 | `}` | Fecha a regra CSS atual. |
| 227 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 228 | `.hud {` | Inicia uma regra CSS para o seletor indicado. |
| 229 | `  position: absolute;` | Define a propriedade CSS \`position\` para ajustar o visual ou o layout. |
| 230 | `  left: 12px;` | Define a propriedade CSS \`left\` para ajustar o visual ou o layout. |
| 231 | `  right: 12px;` | Define a propriedade CSS \`right\` para ajustar o visual ou o layout. |
| 232 | `  bottom: 12px;` | Define a propriedade CSS \`bottom\` para ajustar o visual ou o layout. |
| 233 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 234 | `  grid-template-columns: repeat(3, minmax(0, 1fr));` | Define as colunas do layout em grid. |
| 235 | `  gap: 10px;` | Define o espaçamento entre elementos. |
| 236 | `  pointer-events: none;` | Define a propriedade CSS \`pointer-events\` para ajustar o visual ou o layout. |
| 237 | `}` | Fecha a regra CSS atual. |
| 238 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 239 | `.hud > div {` | Inicia uma regra CSS para o seletor indicado. |
| 240 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 241 | `  gap: 2px;` | Define o espaçamento entre elementos. |
| 242 | `  min-height: 58px;` | Define altura mínima. |
| 243 | `  padding: 8px 10px;` | Define espaçamento interno. |
| 244 | `  border: 1px solid rgba(255, 255, 255, 0.11);` | Define borda do elemento. |
| 245 | `  border-radius: 8px;` | Arredonda os cantos do elemento. |
| 246 | `  background: rgba(12, 15, 20, 0.76);` | Define cor ou fundo visual do elemento. |
| 247 | `}` | Fecha a regra CSS atual. |
| 248 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 249 | `.hud strong {` | Inicia uma regra CSS para o seletor indicado. |
| 250 | `  font-size: 1.35rem;` | Define tamanho da fonte. |
| 251 | `}` | Fecha a regra CSS atual. |
| 252 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 253 | `.hud span {` | Inicia uma regra CSS para o seletor indicado. |
| 254 | `  color: var(--muted);` | Define a cor do texto. |
| 255 | `  font-size: 0.78rem;` | Define tamanho da fonte. |
| 256 | `  font-weight: 700;` | Define peso da fonte. |
| 257 | `  text-transform: uppercase;` | Define a propriedade CSS \`text-transform\` para ajustar o visual ou o layout. |
| 258 | `}` | Fecha a regra CSS atual. |
| 259 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 260 | `.section-title {` | Inicia uma regra CSS para o seletor indicado. |
| 261 | `  display: flex;` | Define como o elemento será exibido no layout. |
| 262 | `  justify-content: space-between;` | Alinha itens no eixo principal. |
| 263 | `  gap: 10px;` | Define o espaçamento entre elementos. |
| 264 | `  align-items: center;` | Alinha itens no eixo transversal. |
| 265 | `  margin-bottom: 12px;` | Define a propriedade CSS \`margin-bottom\` para ajustar o visual ou o layout. |
| 266 | `}` | Fecha a regra CSS atual. |
| 267 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 268 | `.section-title span {` | Inicia uma regra CSS para o seletor indicado. |
| 269 | `  max-width: 150px;` | Define largura máxima. |
| 270 | `  overflow: hidden;` | Controla o que acontece quando o conteúdo passa do limite. |
| 271 | `  text-overflow: ellipsis;` | Define a propriedade CSS \`text-overflow\` para ajustar o visual ou o layout. |
| 272 | `  white-space: nowrap;` | Define a propriedade CSS \`white-space\` para ajustar o visual ou o layout. |
| 273 | `  color: var(--cyan);` | Define a cor do texto. |
| 274 | `  font-size: 0.8rem;` | Define tamanho da fonte. |
| 275 | `  font-weight: 800;` | Define peso da fonte. |
| 276 | `}` | Fecha a regra CSS atual. |
| 277 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 278 | `dl {` | Inicia uma regra CSS para o seletor indicado. |
| 279 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 280 | `  gap: 10px;` | Define o espaçamento entre elementos. |
| 281 | `  margin: 0 0 14px;` | Define espaçamento externo. |
| 282 | `}` | Fecha a regra CSS atual. |
| 283 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 284 | `dl > div {` | Inicia uma regra CSS para o seletor indicado. |
| 285 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 286 | `  gap: 4px;` | Define o espaçamento entre elementos. |
| 287 | `  padding-bottom: 10px;` | Define a propriedade CSS \`padding-bottom\` para ajustar o visual ou o layout. |
| 288 | `  border-bottom: 1px solid var(--line);` | Define a propriedade CSS \`border-bottom\` para ajustar o visual ou o layout. |
| 289 | `}` | Fecha a regra CSS atual. |
| 290 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 291 | `dd {` | Inicia uma regra CSS para o seletor indicado. |
| 292 | `  margin: 0;` | Define espaçamento externo. |
| 293 | `  color: var(--text);` | Define a cor do texto. |
| 294 | `  overflow-wrap: anywhere;` | Define a propriedade CSS \`overflow-wrap\` para ajustar o visual ou o layout. |
| 295 | `}` | Fecha a regra CSS atual. |
| 296 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 297 | `.log {` | Inicia uma regra CSS para o seletor indicado. |
| 298 | `  display: grid;` | Define como o elemento será exibido no layout. |
| 299 | `  gap: 8px;` | Define o espaçamento entre elementos. |
| 300 | `  max-height: 298px;` | Define a propriedade CSS \`max-height\` para ajustar o visual ou o layout. |
| 301 | `  margin: 0;` | Define espaçamento externo. |
| 302 | `  padding: 0;` | Define espaçamento interno. |
| 303 | `  overflow: auto;` | Controla o que acontece quando o conteúdo passa do limite. |
| 304 | `  list-style: none;` | Define a propriedade CSS \`list-style\` para ajustar o visual ou o layout. |
| 305 | `}` | Fecha a regra CSS atual. |
| 306 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 307 | `.log li {` | Inicia uma regra CSS para o seletor indicado. |
| 308 | `  padding: 9px;` | Define espaçamento interno. |
| 309 | `  border-radius: 6px;` | Arredonda os cantos do elemento. |
| 310 | `  background: #11141b;` | Define cor ou fundo visual do elemento. |
| 311 | `  color: var(--muted);` | Define a cor do texto. |
| 312 | `  font-size: 0.82rem;` | Define tamanho da fonte. |
| 313 | `  overflow-wrap: anywhere;` | Define a propriedade CSS \`overflow-wrap\` para ajustar o visual ou o layout. |
| 314 | `}` | Fecha a regra CSS atual. |
| 315 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 316 | `@media (max-width: 1050px) {` | Inicia uma regra CSS para o seletor indicado. |
| 317 | `  .layout {` | Inicia uma regra CSS para o seletor indicado. |
| 318 | `    grid-template-columns: 1fr;` | Define as colunas do layout em grid. |
| 319 | `  }` | Fecha a regra CSS atual. |
| 320 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 321 | `  .arena-wrap,` | Linha de CSS usada para composição visual da interface. |
| 322 | `  canvas {` | Inicia uma regra CSS para o seletor indicado. |
| 323 | `    min-height: 440px;` | Define altura mínima. |
| 324 | `  }` | Fecha a regra CSS atual. |
| 325 | `}` | Fecha a regra CSS atual. |
| 326 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 327 | `@media (max-width: 620px) {` | Inicia uma regra CSS para o seletor indicado. |
| 328 | `  .shell {` | Inicia uma regra CSS para o seletor indicado. |
| 329 | `    width: min(100vw - 20px, 1460px);` | Define largura. |
| 330 | `    padding: 14px 0;` | Define espaçamento interno. |
| 331 | `  }` | Fecha a regra CSS atual. |
| 332 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 333 | `  .topbar {` | Inicia uma regra CSS para o seletor indicado. |
| 334 | `    align-items: stretch;` | Alinha itens no eixo transversal. |
| 335 | `    flex-direction: column;` | Define a propriedade CSS \`flex-direction\` para ajustar o visual ou o layout. |
| 336 | `  }` | Fecha a regra CSS atual. |
| 337 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 338 | `  .split,` | Linha de CSS usada para composição visual da interface. |
| 339 | `  .hud {` | Inicia uma regra CSS para o seletor indicado. |
| 340 | `    grid-template-columns: 1fr;` | Define as colunas do layout em grid. |
| 341 | `  }` | Fecha a regra CSS atual. |
| 342 | `(em branco)` | Linha em branco usada para separar blocos de estilo. |
| 343 | `  .arena-wrap,` | Linha de CSS usada para composição visual da interface. |
| 344 | `  canvas {` | Inicia uma regra CSS para o seletor indicado. |
| 345 | `    min-height: 390px;` | Define altura mínima. |
| 346 | `  }` | Fecha a regra CSS atual. |
| 347 | `}` | Fecha a regra CSS atual. |

## app.js

Lógica do jogo e comunicação MQTT no navegador.

| Linha | Código | Explicação |
|---:|---|---|
| 1 | `const canvas = document.querySelector("#game");` | Busca o canvas da arena no HTML. |
| 2 | `const ctx = canvas.getContext("2d");` | Obtém o contexto 2D usado para desenhar no canvas. |
| 3 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 4 | `const ui = {` | Inicia o objeto que guarda referências aos elementos da interface. |
| 5 | `  statusDot: document.querySelector("#statusDot"),` | Busca um elemento do HTML pelo seletor informado. |
| 6 | `  connectionStatus: document.querySelector("#connectionStatus"),` | Busca um elemento do HTML pelo seletor informado. |
| 7 | `  playerName: document.querySelector("#playerName"),` | Busca um elemento do HTML pelo seletor informado. |
| 8 | `  brokerUrl: document.querySelector("#brokerUrl"),` | Busca um elemento do HTML pelo seletor informado. |
| 9 | `  brokerUser: document.querySelector("#brokerUser"),` | Busca um elemento do HTML pelo seletor informado. |
| 10 | `  brokerPass: document.querySelector("#brokerPass"),` | Busca um elemento do HTML pelo seletor informado. |
| 11 | `  roomTopic: document.querySelector("#roomTopic"),` | Busca um elemento do HTML pelo seletor informado. |
| 12 | `  connectBtn: document.querySelector("#connectBtn"),` | Busca um elemento do HTML pelo seletor informado. |
| 13 | `  localBtn: document.querySelector("#localBtn"),` | Busca um elemento do HTML pelo seletor informado. |
| 14 | `  simulateBtn: document.querySelector("#simulateBtn"),` | Busca um elemento do HTML pelo seletor informado. |
| 15 | `  resetBtn: document.querySelector("#resetBtn"),` | Busca um elemento do HTML pelo seletor informado. |
| 16 | `  deviceBtn: document.querySelector("#deviceBtn"),` | Busca um elemento do HTML pelo seletor informado. |
| 17 | `  pingBtn: document.querySelector("#pingBtn"),` | Busca um elemento do HTML pelo seletor informado. |
| 18 | `  score: document.querySelector("#score"),` | Busca um elemento do HTML pelo seletor informado. |
| 19 | `  playersOnline: document.querySelector("#playersOnline"),` | Busca um elemento do HTML pelo seletor informado. |
| 20 | `  latency: document.querySelector("#latency"),` | Busca um elemento do HTML pelo seletor informado. |
| 21 | `  topicLabel: document.querySelector("#topicLabel"),` | Busca um elemento do HTML pelo seletor informado. |
| 22 | `  cmdTopic: document.querySelector("#cmdTopic"),` | Busca um elemento do HTML pelo seletor informado. |
| 23 | `  stateTopic: document.querySelector("#stateTopic"),` | Busca um elemento do HTML pelo seletor informado. |
| 24 | `  lastPayload: document.querySelector("#lastPayload"),` | Busca um elemento do HTML pelo seletor informado. |
| 25 | `  log: document.querySelector("#log")` | Busca um elemento do HTML pelo seletor informado. |
| 26 | `};` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 27 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 28 | `const colors = ["#46d48f", "#49c7e8", "#ffd166", "#ff8f5a", "#c792ea", "#ff5d73"];` | Define as cores possíveis das bolinhas dos jogadores. |
| 29 | `const MIN_PLAYER_RADIUS = 16;` | Define o tamanho mínimo da bolinha. |
| 30 | `const MAX_PLAYER_RADIUS = 58;` | Define o tamanho máximo da bolinha. |
| 31 | `const EAT_SIZE_RATIO = 1.16;` | Define quanto maior uma bolinha precisa ser para engolir outra. |
| 32 | `const state = {` | Inicia o objeto que guarda o estado geral do jogo e da conexão MQTT. |
| 33 | `  id: crypto.randomUUID().slice(0, 8),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 34 | `  client: null,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 35 | `  connected: false,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 36 | `  mode: "local",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 37 | `  keys: new Set(),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 38 | `  players: new Map(),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 39 | `  energy: [],` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 40 | `  hazards: [],` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 41 | `  simulator: false,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 42 | `  lastPublish: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 43 | `  lastPing: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 44 | `  lastPong: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 45 | `  room: "",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 46 | `  baseTopic: "",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 47 | `  topics: {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 48 | `    cmd: "local",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 49 | `    state: "local",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 50 | `    ping: "local",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 51 | `    presence: "local"` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 52 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 53 | `};` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 54 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 55 | `function clamp(value, min, max) {` | Declara a função \`clamp\`, usada por uma parte da lógica do projeto. |
| 56 | `  return Math.max(min, Math.min(max, value));` | Retorna um valor calculado pela função atual. |
| 57 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 58 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 59 | `function randomBetween(min, max) {` | Declara a função \`randomBetween\`, usada por uma parte da lógica do projeto. |
| 60 | `  return min + Math.random() * (max - min);` | Retorna um valor calculado pela função atual. |
| 61 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 62 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 63 | `function playerRadius(player) {` | Declara a função \`playerRadius\`, usada por uma parte da lógica do projeto. |
| 64 | `  return clamp(MIN_PLAYER_RADIUS + Math.sqrt(Math.max(0, player.score)) * 1.18, MIN_PLAYER_RADIUS, MAX_PLAYER_RADIUS);` | Retorna um valor calculado pela função atual. |
| 65 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 66 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 67 | `function respawnPlayer(player, score = 0) {` | Declara a função \`respawnPlayer\`, usada por uma parte da lógica do projeto. |
| 68 | `  const radius = playerRadius(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 69 | `  player.x = randomBetween(radius + 18, canvas.width - radius - 18);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 70 | `  player.y = randomBetween(radius + 18, canvas.height - radius - 100);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 71 | `  player.vx = 0;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 72 | `  player.vy = 0;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 73 | `  player.score = score;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 74 | `  player.updatedAt = Date.now();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 75 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 76 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 77 | `function addLog(message) {` | Declara a função \`addLog\`, usada por uma parte da lógica do projeto. |
| 78 | `  const item = document.createElement("li");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 79 | `  item.textContent = \`${new Date().toLocaleTimeString()} - ${message}\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 80 | `  ui.log.prepend(item);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 81 | `  while (ui.log.children.length > 9) ui.log.lastElementChild.remove();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 82 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 83 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 84 | `function setLastPayload(value) {` | Declara a função \`setLastPayload\`, usada por uma parte da lógica do projeto. |
| 85 | `  ui.lastPayload.value = value;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 86 | `  ui.lastPayload.scrollTop = ui.lastPayload.scrollHeight;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 87 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 88 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 89 | `function sanitizeTopic(value) {` | Declara a função \`sanitizeTopic\`, usada por uma parte da lógica do projeto. |
| 90 | `  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "-") \|\| "circle-arena-demo";` | Retorna um valor calculado pela função atual. |
| 91 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 92 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 93 | `function playerTemplate(id, name, isLocal = false) {` | Declara a função \`playerTemplate\`, usada por uma parte da lógica do projeto. |
| 94 | `  const color = colors[Math.abs([...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % colors.length];` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 95 | `  return {` | Retorna um valor calculado pela função atual. |
| 96 | `    id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 97 | `    name,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 98 | `    isLocal,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 99 | `    color,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 100 | `    x: randomBetween(80, canvas.width - 80),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 101 | `    y: randomBetween(80, canvas.height - 120),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 102 | `    vx: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 103 | `    vy: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 104 | `    score: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 105 | `    alive: true,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 106 | `    updatedAt: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 107 | `  };` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 108 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 109 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 110 | `function localPlayer() {` | Declara a função \`localPlayer\`, usada por uma parte da lógica do projeto. |
| 111 | `  if (!state.players.has(state.id)) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 112 | `    state.players.set(state.id, playerTemplate(state.id, ui.playerName.value, true));` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 113 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 114 | `  return state.players.get(state.id);` | Retorna um valor calculado pela função atual. |
| 115 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 116 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 117 | `function seedWorld() {` | Declara a função \`seedWorld\`, usada por uma parte da lógica do projeto. |
| 118 | `  state.energy = Array.from({ length: 18 }, (_, index) => ({` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 119 | `    id: \`e${index}\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 120 | `    x: randomBetween(34, canvas.width - 34),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 121 | `    y: randomBetween(34, canvas.height - 104),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 122 | `    r: randomBetween(7, 12),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 123 | `    phase: Math.random() * Math.PI * 2` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 124 | `  }));` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 125 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 126 | `  state.hazards = Array.from({ length: 5 }, (_, index) => ({` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 127 | `    id: \`h${index}\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 128 | `    x: randomBetween(90, canvas.width - 90),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 129 | `    y: randomBetween(90, canvas.height - 150),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 130 | `    r: randomBetween(22, 36),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 131 | `    drift: randomBetween(-0.65, 0.65)` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 132 | `  }));` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 133 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 134 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 135 | `function setStatus(label, variant = "local") {` | Declara a função \`setStatus\`, usada por uma parte da lógica do projeto. |
| 136 | `  ui.connectionStatus.textContent = label;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 137 | `  ui.statusDot.className = \`dot ${variant === "online" ? "online" : variant === "error" ? "error" : ""}\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 138 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 139 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 140 | `function syncTopicLabels() {` | Declara a função \`syncTopicLabels\`, usada por uma parte da lógica do projeto. |
| 141 | `  ui.topicLabel.textContent = state.mode === "mqtt" ? state.room : "offline";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 142 | `  ui.cmdTopic.textContent = state.topics.cmd === "local" ? "local" : \`${state.topics.cmd} (QoS 1)\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 143 | `  ui.stateTopic.textContent = state.topics.state === "local" ? "local" : \`${state.topics.state} (QoS 0, wildcard)\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 144 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 145 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 146 | `function publish(topic, payload, options = {}) {` | Declara a função \`publish\`, usada por uma parte da lógica do projeto. |
| 147 | `  const text = JSON.stringify(payload);` | Converte um objeto JavaScript em texto JSON para enviar pelo MQTT. |
| 148 | `  setLastPayload(text);` | Atualiza a caixa de última mensagem na interface. |
| 149 | `  if (state.connected && state.client) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 150 | `    state.client.publish(topic, text, { qos: options.qos ?? 0, retain: options.retain ?? false });` | Publica uma mensagem MQTT em um tópico. |
| 151 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 152 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 153 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 154 | `function publishLocalState() {` | Declara a função \`publishLocalState\`, usada por uma parte da lógica do projeto. |
| 155 | `  const p = localPlayer();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 156 | `  publish(\`${state.baseTopic}/jogadores/${state.id}/estado\`, {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 157 | `    type: "state",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 158 | `    id: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 159 | `    name: p.name,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 160 | `    x: Math.round(p.x),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 161 | `    y: Math.round(p.y),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 162 | `    score: p.score,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 163 | `    radius: Math.round(playerRadius(p)),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 164 | `    color: p.color,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 165 | `    t: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 166 | `  }, { qos: 0, retain: true });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 167 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 168 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 169 | `function publishPresence(status) {` | Declara a função \`publishPresence\`, usada por uma parte da lógica do projeto. |
| 170 | `  publish(\`${state.baseTopic}/jogadores/${state.id}/presenca\`, {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 171 | `    type: "presence",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 172 | `    id: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 173 | `    name: ui.playerName.value \|\| "Jogador",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 174 | `    status,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 175 | `    t: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 176 | `  }, { qos: 1, retain: true });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 177 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 178 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 179 | `function handleMessage(topic, raw) {` | Declara a função \`handleMessage\`, usada por uma parte da lógica do projeto. |
| 180 | `  let payload;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 181 | `  try {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 182 | `    payload = JSON.parse(raw.toString());` | Converte o texto JSON recebido em objeto JavaScript. |
| 183 | `  } catch {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 184 | `    addLog(\`mensagem invalida em ${topic}\`);` | Registra uma mensagem no histórico visual da interface. |
| 185 | `    return;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 186 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 187 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 188 | `  setLastPayload(JSON.stringify(payload, null, 2));` | Converte um objeto JavaScript em texto JSON para enviar pelo MQTT. |
| 189 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 190 | `  if (payload.type === "presence" && payload.id !== state.id) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 191 | `    addLog(\`${payload.name \|\| payload.id}: ${payload.status}\`);` | Registra uma mensagem no histórico visual da interface. |
| 192 | `    if (payload.status === "offline") {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 193 | `      state.players.delete(payload.id);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 194 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 195 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 196 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 197 | `  if (payload.type === "state" && payload.id !== state.id) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 198 | `    const player = state.players.get(payload.id) \|\| playerTemplate(payload.id, payload.name \|\| "Remoto");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 199 | `    Object.assign(player, {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 200 | `      name: payload.name \|\| player.name,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 201 | `      x: payload.x,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 202 | `      y: payload.y,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 203 | `      score: payload.score \|\| 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 204 | `      color: payload.color \|\| player.color,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 205 | `      updatedAt: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 206 | `    });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 207 | `    state.players.set(payload.id, player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 208 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 209 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 210 | `  if (payload.type === "eaten" && payload.source !== state.id && payload.target === state.id) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 211 | `    const p = localPlayer();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 212 | `    respawnPlayer(p, 0);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 213 | `    publishLocalState();` | Publica o estado atual do jogador local. |
| 214 | `    addLog(\`${payload.by \|\| "Outro jogador"} engoliu sua bolinha\`);` | Registra uma mensagem no histórico visual da interface. |
| 215 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 216 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 217 | `  const isExternalCommand = payload.type === "cmd" && payload.source !== state.id;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 218 | `  const isCommandForThisClient = payload.target === state.id \|\| payload.target === "all" \|\| !payload.target;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 219 | `  if (isExternalCommand && isCommandForThisClient) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 220 | `    const p = localPlayer();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 221 | `    p.vx += (payload.dx \|\| 0) * 2.2;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 222 | `    p.vy += (payload.dy \|\| 0) * 2.2;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 223 | `    addLog(\`comando recebido: dx=${payload.dx \|\| 0}, dy=${payload.dy \|\| 0}\`);` | Registra uma mensagem no histórico visual da interface. |
| 224 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 225 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 226 | `  if (payload.type === "ping") {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 227 | `    publish(\`${state.baseTopic}/telemetria/ping\`, { type: "pong", id: state.id, t: payload.t }, { qos: 0 });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 228 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 229 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 230 | `  if (payload.type === "pong" && payload.id === state.id) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 231 | `    state.lastPong = Date.now() - payload.t;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 232 | `    ui.latency.textContent = \`${state.lastPong} ms\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 233 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 234 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 235 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 236 | `function connectMqtt() {` | Declara a função \`connectMqtt\`, usada por uma parte da lógica do projeto. |
| 237 | `  if (!window.mqtt) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 238 | `    setStatus("Biblioteca MQTT nao carregou", "error");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 239 | `    addLog("abra com internet ou use o modo local");` | Registra uma mensagem no histórico visual da interface. |
| 240 | `    return;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 241 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 242 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 243 | `  if (state.client) state.client.end(true);` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 244 | `  state.room = sanitizeTopic(ui.roomTopic.value);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 245 | `  state.baseTopic = \`n461/circle-arena/${state.room}\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 246 | `  state.topics = {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 247 | `    cmd: \`${state.baseTopic}/jogadores/${state.id}/comando\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 248 | `    cmdWildcard: \`${state.baseTopic}/jogadores/+/comando\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 249 | `    state: \`${state.baseTopic}/jogadores/+/estado\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 250 | `    ping: \`${state.baseTopic}/telemetria/ping\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 251 | `    presence: \`${state.baseTopic}/jogadores/+/presenca\`` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 252 | `  };` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 253 | `  syncTopicLabels();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 254 | `  setStatus("Conectando...", "local");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 255 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 256 | `  const options = {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 257 | `    clientId: \`circle_arena_${state.id}_${Date.now()}\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 258 | `    clean: true,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 259 | `    reconnectPeriod: 2500,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 260 | `    connectTimeout: 8000,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 261 | `    will: {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 262 | `      topic: \`${state.baseTopic}/jogadores/${state.id}/presenca\`,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 263 | `      payload: JSON.stringify({` | Converte um objeto JavaScript em texto JSON para enviar pelo MQTT. |
| 264 | `        type: "presence",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 265 | `        id: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 266 | `        name: ui.playerName.value \|\| "Jogador",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 267 | `        status: "offline",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 268 | `        t: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 269 | `      }),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 270 | `      qos: 1,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 271 | `      retain: true` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 272 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 273 | `  };` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 274 | `  if (ui.brokerUser.value.trim()) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 275 | `    options.username = ui.brokerUser.value.trim();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 276 | `    options.password = ui.brokerPass.value;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 277 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 278 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 279 | `  state.client = mqtt.connect(ui.brokerUrl.value.trim(), options);` | Cria a conexão MQTT com o broker configurado na interface. |
| 280 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 281 | `  state.client.on("connect", () => {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 282 | `    state.mode = "mqtt";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 283 | `    state.connected = true;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 284 | `    setStatus("Conectado ao MQTT", "online");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 285 | `    state.client.subscribe(state.topics.state, { qos: 0 });` | Assina um tópico MQTT para receber mensagens. |
| 286 | `    state.client.subscribe(state.topics.cmdWildcard, { qos: 1 });` | Assina um tópico MQTT para receber mensagens. |
| 287 | `    state.client.subscribe(state.topics.presence, { qos: 1 });` | Assina um tópico MQTT para receber mensagens. |
| 288 | `    state.client.subscribe(state.topics.ping, { qos: 0 });` | Assina um tópico MQTT para receber mensagens. |
| 289 | `    publishPresence("online");` | Publica presença online/offline do jogador. |
| 290 | `    publishLocalState();` | Publica o estado atual do jogador local. |
| 291 | `    addLog(\`conectado na sala ${state.room}\`);` | Registra uma mensagem no histórico visual da interface. |
| 292 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 293 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 294 | `  state.client.on("message", handleMessage);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 295 | `  state.client.on("reconnect", () => setStatus("Reconectando...", "local"));` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 296 | `  state.client.on("close", () => {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 297 | `    state.connected = false;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 298 | `    if (state.mode === "mqtt") setStatus("Desconectado", "error");` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 299 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 300 | `  state.client.on("error", (error) => {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 301 | `    setStatus("Erro no MQTT", "error");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 302 | `    addLog(error.message);` | Registra uma mensagem no histórico visual da interface. |
| 303 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 304 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 305 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 306 | `function enableLocalMode() {` | Declara a função \`enableLocalMode\`, usada por uma parte da lógica do projeto. |
| 307 | `  if (state.connected) publishPresence("offline");` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 308 | `  if (state.client) state.client.end(true);` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 309 | `  state.client = null;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 310 | `  state.connected = false;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 311 | `  state.mode = "local";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 312 | `  state.baseTopic = "";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 313 | `  state.topics = { cmd: "local", state: "local", ping: "local", presence: "local" };` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 314 | `  syncTopicLabels();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 315 | `  setStatus("Modo local", "local");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 316 | `  addLog("modo local ativado");` | Registra uma mensagem no histórico visual da interface. |
| 317 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 318 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 319 | `function movePlayer(player, dt) {` | Declara a função \`movePlayer\`, usada por uma parte da lógica do projeto. |
| 320 | `  const radius = playerRadius(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 321 | `  const sizePenalty = clamp(1.1 - (radius - MIN_PLAYER_RADIUS) / 80, 0.55, 1);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 322 | `  const accel = 860 * sizePenalty;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 323 | `  let dx = 0;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 324 | `  let dy = 0;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 325 | `  if (state.keys.has("ArrowLeft") \|\| state.keys.has("KeyA")) dx -= 1;` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 326 | `  if (state.keys.has("ArrowRight") \|\| state.keys.has("KeyD")) dx += 1;` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 327 | `  if (state.keys.has("ArrowUp") \|\| state.keys.has("KeyW")) dy -= 1;` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 328 | `  if (state.keys.has("ArrowDown") \|\| state.keys.has("KeyS")) dy += 1;` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 329 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 330 | `  if (dx \|\| dy) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 331 | `    const length = Math.hypot(dx, dy);` | Calcula distância entre pontos, usada em colisão ou busca de alvo. |
| 332 | `    player.vx += (dx / length) * accel * dt;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 333 | `    player.vy += (dy / length) * accel * dt;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 334 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 335 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 336 | `  player.vx *= 0.88;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 337 | `  player.vy *= 0.88;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 338 | `  player.x = clamp(player.x + player.vx * dt, radius, canvas.width - radius);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 339 | `  player.y = clamp(player.y + player.vy * dt, radius, canvas.height - radius - 64);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 340 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 341 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 342 | `function updateSimulator(dt) {` | Declara a função \`updateSimulator\`, usada por uma parte da lógica do projeto. |
| 343 | `  const id = "bot-rival";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 344 | `  if (!state.simulator) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 345 | `    state.players.delete(id);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 346 | `    return;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 347 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 348 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 349 | `  const bot = state.players.get(id) \|\| playerTemplate(id, "Rival MQTT");` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 350 | `  const target = state.energy.reduce((best, item) => {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 351 | `    const distance = Math.hypot(item.x - bot.x, item.y - bot.y);` | Calcula distância entre pontos, usada em colisão ou busca de alvo. |
| 352 | `    return !best \|\| distance < best.distance ? { item, distance } : best;` | Retorna um valor calculado pela função atual. |
| 353 | `  }, null);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 354 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 355 | `  if (target) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 356 | `    const angle = Math.atan2(target.item.y - bot.y, target.item.x - bot.x);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 357 | `    bot.vx += Math.cos(angle) * 340 * dt;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 358 | `    bot.vy += Math.sin(angle) * 340 * dt;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 359 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 360 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 361 | `  bot.vx *= 0.91;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 362 | `  bot.vy *= 0.91;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 363 | `  const radius = playerRadius(bot);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 364 | `  bot.x = clamp(bot.x + bot.vx * dt, radius, canvas.width - radius);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 365 | `  bot.y = clamp(bot.y + bot.vy * dt, radius, canvas.height - radius - 64);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 366 | `  bot.updatedAt = Date.now();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 367 | `  state.players.set(id, bot);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 368 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 369 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 370 | `function collectEnergy(player) {` | Declara a função \`collectEnergy\`, usada por uma parte da lógica do projeto. |
| 371 | `  const radius = playerRadius(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 372 | `  state.energy.forEach((item) => {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 373 | `    if (Math.hypot(player.x - item.x, player.y - item.y) < item.r + radius) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 374 | `      player.score += 10;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 375 | `      item.x = randomBetween(34, canvas.width - 34);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 376 | `      item.y = randomBetween(34, canvas.height - 104);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 377 | `      item.phase = Math.random() * Math.PI * 2;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 378 | `      if (player.isLocal) publishLocalState();` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 379 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 380 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 381 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 382 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 383 | `function applyHazards(player) {` | Declara a função \`applyHazards\`, usada por uma parte da lógica do projeto. |
| 384 | `  const radius = playerRadius(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 385 | `  for (const hazard of state.hazards) {` | Inicia um laço de repetição. |
| 386 | `    if (Math.hypot(player.x - hazard.x, player.y - hazard.y) < hazard.r + radius * 0.75) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 387 | `      player.score = Math.max(0, player.score - 1);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 388 | `      player.vx *= -0.72;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 389 | `      player.vy *= -0.72;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 390 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 391 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 392 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 393 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 394 | `function canEatPlayer(hunter, prey) {` | Declara a função \`canEatPlayer\`, usada por uma parte da lógica do projeto. |
| 395 | `  const hunterRadius = playerRadius(hunter);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 396 | `  const preyRadius = playerRadius(prey);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 397 | `  const distance = Math.hypot(hunter.x - prey.x, hunter.y - prey.y);` | Calcula distância entre pontos, usada em colisão ou busca de alvo. |
| 398 | `  return hunterRadius > preyRadius * EAT_SIZE_RATIO && distance < hunterRadius * 0.82;` | Retorna um valor calculado pela função atual. |
| 399 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 400 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 401 | `function eatPlayer(hunter, prey) {` | Declara a função \`eatPlayer\`, usada por uma parte da lógica do projeto. |
| 402 | `  const gain = Math.max(25, Math.round(prey.score * 0.65 + playerRadius(prey)));` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 403 | `  hunter.score += gain;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 404 | `  hunter.vx *= 0.75;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 405 | `  hunter.vy *= 0.75;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 406 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 407 | `  if (prey.isLocal \|\| prey.id === "bot-rival") {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 408 | `    respawnPlayer(prey, 0);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 409 | `  } else if (hunter.isLocal && state.connected) {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 410 | `    publish(\`${state.baseTopic}/jogadores/${prey.id}/comando\`, {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 411 | `      type: "eaten",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 412 | `      source: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 413 | `      target: prey.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 414 | `      by: hunter.name,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 415 | `      t: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 416 | `    }, { qos: 1 });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 417 | `    respawnPlayer(prey, 0);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 418 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 419 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 420 | `  if (hunter.isLocal \|\| prey.isLocal) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 421 | `    addLog(\`${hunter.name} engoliu ${prey.name}\`);` | Registra uma mensagem no histórico visual da interface. |
| 422 | `    publishLocalState();` | Publica o estado atual do jogador local. |
| 423 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 424 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 425 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 426 | `function resolvePlayerEating() {` | Declara a função \`resolvePlayerEating\`, usada por uma parte da lógica do projeto. |
| 427 | `  const players = Array.from(state.players.values());` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 428 | `  for (let i = 0; i < players.length; i += 1) {` | Inicia um laço de repetição. |
| 429 | `    for (let j = i + 1; j < players.length; j += 1) {` | Inicia um laço de repetição. |
| 430 | `      const a = players[i];` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 431 | `      const b = players[j];` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 432 | `      const pairIsRelevantHere = a.isLocal \|\| b.isLocal \|\| a.id === "bot-rival" \|\| b.id === "bot-rival";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 433 | `      if (!pairIsRelevantHere) continue;` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 434 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 435 | `      if (canEatPlayer(a, b)) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 436 | `        eatPlayer(a, b);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 437 | `      } else if (canEatPlayer(b, a)) {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 438 | `        eatPlayer(b, a);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 439 | `      }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 440 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 441 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 442 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 443 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 444 | `function updateWorld(dt) {` | Declara a função \`updateWorld\`, usada por uma parte da lógica do projeto. |
| 445 | `  const p = localPlayer();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 446 | `  p.name = ui.playerName.value \|\| "Jogador";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 447 | `  movePlayer(p, dt);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 448 | `  updateSimulator(dt);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 449 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 450 | `  for (const player of state.players.values()) {` | Inicia um laço de repetição. |
| 451 | `    collectEnergy(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 452 | `    applyHazards(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 453 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 454 | `  resolvePlayerEating();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 455 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 456 | `  for (const hazard of state.hazards) {` | Inicia um laço de repetição. |
| 457 | `    hazard.x += Math.sin(Date.now() / 900 + hazard.drift) * 0.22;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 458 | `    hazard.y += Math.cos(Date.now() / 1100 + hazard.drift) * 0.18;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 459 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 460 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 461 | `  for (const [id, player] of state.players) {` | Inicia um laço de repetição. |
| 462 | `    if (!player.isLocal && id !== "bot-rival" && Date.now() - player.updatedAt > 9000) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 463 | `      state.players.delete(id);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 464 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 465 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 466 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 467 | `  if (Date.now() - state.lastPublish > 240) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 468 | `    state.lastPublish = Date.now();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 469 | `    publishLocalState();` | Publica o estado atual do jogador local. |
| 470 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 471 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 472 | `  if (state.connected && Date.now() - state.lastPing > 5000) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 473 | `    state.lastPing = Date.now();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 474 | `    publish(state.topics.ping, { type: "ping", id: state.id, t: Date.now() }, { qos: 0 });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 475 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 476 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 477 | `  ui.score.textContent = p.score;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 478 | `  ui.playersOnline.textContent = state.players.size;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 479 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 480 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 481 | `function drawGrid() {` | Declara a função \`drawGrid\`, usada por uma parte da lógica do projeto. |
| 482 | `  ctx.fillStyle = "#0c0f14";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 483 | `  ctx.fillRect(0, 0, canvas.width, canvas.height);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 484 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 485 | `  ctx.strokeStyle = "rgba(255,255,255,0.055)";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 486 | `  ctx.lineWidth = 1;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 487 | `  for (let x = 0; x < canvas.width; x += 40) {` | Inicia um laço de repetição. |
| 488 | `    ctx.beginPath();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 489 | `    ctx.moveTo(x, 0);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 490 | `    ctx.lineTo(x, canvas.height);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 491 | `    ctx.stroke();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 492 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 493 | `  for (let y = 0; y < canvas.height; y += 40) {` | Inicia um laço de repetição. |
| 494 | `    ctx.beginPath();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 495 | `    ctx.moveTo(0, y);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 496 | `    ctx.lineTo(canvas.width, y);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 497 | `    ctx.stroke();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 498 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 499 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 500 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 501 | `function drawWorld() {` | Declara a função \`drawWorld\`, usada por uma parte da lógica do projeto. |
| 502 | `  drawGrid();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 503 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 504 | `  for (const hazard of state.hazards) {` | Inicia um laço de repetição. |
| 505 | `    ctx.beginPath();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 506 | `    ctx.fillStyle = "rgba(255, 93, 115, 0.18)";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 507 | `    ctx.strokeStyle = "rgba(255, 93, 115, 0.72)";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 508 | `    ctx.lineWidth = 2;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 509 | `    ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 510 | `    ctx.fill();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 511 | `    ctx.stroke();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 512 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 513 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 514 | `  for (const item of state.energy) {` | Inicia um laço de repetição. |
| 515 | `    const pulse = Math.sin(Date.now() / 260 + item.phase) * 2;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 516 | `    ctx.beginPath();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 517 | `    ctx.fillStyle = "#ffd166";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 518 | `    ctx.shadowColor = "#ffd166";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 519 | `    ctx.shadowBlur = 14;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 520 | `    ctx.arc(item.x, item.y, item.r + pulse, 0, Math.PI * 2);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 521 | `    ctx.fill();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 522 | `    ctx.shadowBlur = 0;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 523 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 524 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 525 | `  for (const player of state.players.values()) {` | Inicia um laço de repetição. |
| 526 | `    const radius = playerRadius(player);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 527 | `    ctx.beginPath();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 528 | `    ctx.fillStyle = player.color;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 529 | `    ctx.shadowColor = player.color;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 530 | `    ctx.shadowBlur = 18;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 531 | `    ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 532 | `    ctx.fill();` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 533 | `    ctx.shadowBlur = 0;` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 534 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 535 | `    ctx.fillStyle = "#f4f6fb";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 536 | `    ctx.font = "700 14px system-ui";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 537 | `    ctx.textAlign = "center";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 538 | `    ctx.fillText(player.name, player.x, player.y - radius - 10);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 539 | `    ctx.fillStyle = "rgba(244,246,251,0.72)";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 540 | `    ctx.font = "700 12px system-ui";` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 541 | `    ctx.fillText(\`${player.score} pts\`, player.x, player.y + radius + 18);` | Usa o contexto do canvas para desenhar ou configurar aparência. |
| 542 | `  }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 543 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 544 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 545 | `let previousTime = performance.now();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 546 | `function loop(now) {` | Declara a função \`loop\`, usada por uma parte da lógica do projeto. |
| 547 | `  const dt = Math.min(0.032, (now - previousTime) / 1000);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 548 | `  previousTime = now;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 549 | `  updateWorld(dt);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 550 | `  drawWorld();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 551 | `  requestAnimationFrame(loop);` | Agenda o próximo quadro de animação do jogo. |
| 552 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 553 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 554 | `function resetGame() {` | Declara a função \`resetGame\`, usada por uma parte da lógica do projeto. |
| 555 | `  const name = ui.playerName.value;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 556 | `  state.players.clear();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 557 | `  state.players.set(state.id, playerTemplate(state.id, name, true));` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 558 | `  seedWorld();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 559 | `  addLog("partida reiniciada");` | Registra uma mensagem no histórico visual da interface. |
| 560 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 561 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 562 | `function bindEvents() {` | Declara a função \`bindEvents\`, usada por uma parte da lógica do projeto. |
| 563 | `  ui.playerName.value = \`Jogador-${state.id.slice(0, 3)}\`;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 564 | `  ui.connectBtn.addEventListener("click", connectMqtt);` | Registra um evento da interface, teclado ou janela. |
| 565 | `  ui.localBtn.addEventListener("click", enableLocalMode);` | Registra um evento da interface, teclado ou janela. |
| 566 | `  ui.simulateBtn.addEventListener("click", () => {` | Registra um evento da interface, teclado ou janela. |
| 567 | `    state.simulator = !state.simulator;` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 568 | `    ui.simulateBtn.textContent = state.simulator ? "Parar rival" : "Simular rival";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 569 | `    addLog(state.simulator ? "rival local entrou" : "rival local saiu");` | Registra uma mensagem no histórico visual da interface. |
| 570 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 571 | `  ui.resetBtn.addEventListener("click", resetGame);` | Registra um evento da interface, teclado ou janela. |
| 572 | `  ui.deviceBtn.addEventListener("click", () => {` | Registra um evento da interface, teclado ou janela. |
| 573 | `    const topic = state.mode === "mqtt"` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 574 | `      ? \`${state.baseTopic}/jogadores/esp32pad/comando\`` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 575 | `      : "local";` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 576 | `    publish(topic, {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 577 | `      type: "cmd",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 578 | `      source: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 579 | `      target: "esp32pad",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 580 | `      action: "blink",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 581 | `      dx: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 582 | `      dy: 0,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 583 | `      t: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 584 | `    }, { qos: 1 });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 585 | `    addLog("comando enviado ao ESP32");` | Registra uma mensagem no histórico visual da interface. |
| 586 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 587 | `  ui.pingBtn.addEventListener("click", () => {` | Registra um evento da interface, teclado ou janela. |
| 588 | `    publish(state.topics.ping, { type: "ping", id: state.id, t: Date.now() }, { qos: 0 });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 589 | `    addLog("ping MQTT enviado");` | Registra uma mensagem no histórico visual da interface. |
| 590 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 591 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 592 | `  window.addEventListener("keydown", (event) => {` | Registra um evento da interface, teclado ou janela. |
| 593 | `    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"].includes(event.code)) {` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 594 | `      event.preventDefault();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 595 | `      state.keys.add(event.code);` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 596 | `      publish(state.topics.cmd, {` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 597 | `        type: "cmd",` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 598 | `        source: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 599 | `        target: state.id,` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 600 | `        dx: Number(state.keys.has("ArrowRight") \|\| state.keys.has("KeyD")) - Number(state.keys.has("ArrowLeft") \|\| state.keys.has("KeyA")),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 601 | `        dy: Number(state.keys.has("ArrowDown") \|\| state.keys.has("KeyS")) - Number(state.keys.has("ArrowUp") \|\| state.keys.has("KeyW")),` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 602 | `        t: Date.now()` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 603 | `      }, { qos: 1 });` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 604 | `    }` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 605 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 606 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 607 | `  window.addEventListener("keyup", (event) => state.keys.delete(event.code));` | Registra um evento da interface, teclado ou janela. |
| 608 | `  window.addEventListener("beforeunload", () => {` | Registra um evento da interface, teclado ou janela. |
| 609 | `    if (state.connected) publishPresence("offline");` | Inicia uma condição; o bloco só executa se a expressão for verdadeira. |
| 610 | `  });` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 611 | `}` | Fecha o bloco, objeto, lista ou chamada iniciado anteriormente. |
| 612 | `(em branco)` | Linha em branco usada para separar blocos de código. |
| 613 | `bindEvents();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 614 | `seedWorld();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 615 | `resetGame();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 616 | `syncTopicLabels();` | Executa uma instrução JavaScript ligada ao jogo, interface ou MQTT. |
| 617 | `requestAnimationFrame(loop);` | Agenda o próximo quadro de animação do jogo. |

## wokwi/sketch.ino

Código do ESP32 simulado no Wokwi.

| Linha | Código | Explicação |
|---:|---|---|
| 1 | `#include <WiFi.h>` | Importa uma biblioteca usada pelo ESP32. |
| 2 | `#include <PubSubClient.h>` | Importa uma biblioteca usada pelo ESP32. |
| 3 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 4 | `const char* ssid = "Wokwi-GUEST";` | Define o nome da rede Wi-Fi usada pelo Wokwi. |
| 5 | `const char* password = "";` | Define a senha da rede Wi-Fi; no Wokwi ela fica vazia. |
| 6 | `const char* mqttServer = "broker.hivemq.com";` | Define o endereço do broker MQTT. |
| 7 | `const int mqttPort = 1883;` | Define a porta MQTT TCP usada pelo ESP32. |
| 8 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 9 | `const char* controllerId = "esp32pad";` | Executa uma instrução C/C++ do firmware do ESP32. |
| 10 | `const char* baseTopic = "n461/circle-arena/circle-arena-demo";` | Executa uma instrução C/C++ do firmware do ESP32. |
| 11 | `const char* topicCmd = "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando";` | Define um tópico MQTT usado pelo ESP32. |
| 12 | `const char* topicPresence = "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/presenca";` | Define um tópico MQTT usado pelo ESP32. |
| 13 | `const char* topicPing = "n461/circle-arena/circle-arena-demo/telemetria/ping";` | Define um tópico MQTT usado pelo ESP32. |
| 14 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 15 | `const int pinUp = 32;` | Define o pino ligado a botão ou LED no circuito. |
| 16 | `const int pinDown = 33;` | Define o pino ligado a botão ou LED no circuito. |
| 17 | `const int pinLeft = 25;` | Define o pino ligado a botão ou LED no circuito. |
| 18 | `const int pinRight = 26;` | Define o pino ligado a botão ou LED no circuito. |
| 19 | `const int pinLed = 2;` | Define o pino ligado a botão ou LED no circuito. |
| 20 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 21 | `WiFiClient net;` | Cria o cliente de rede TCP usado pelo MQTT. |
| 22 | `PubSubClient mqtt(net);` | Cria o cliente MQTT do ESP32. |
| 23 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 24 | `void onMessage(char* topic, byte* payload, unsigned int length) {` | Declara a função \`onMessage\` do firmware. |
| 25 | `  String message;` | Executa uma instrução C/C++ do firmware do ESP32. |
| 26 | `  for (unsigned int i = 0; i < length; i++) {` | Executa uma instrução C/C++ do firmware do ESP32. |
| 27 | `    message += (char)payload[i];` | Executa uma instrução C/C++ do firmware do ESP32. |
| 28 | `  }` | Fecha o bloco atual. |
| 29 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 30 | `  digitalWrite(pinLed, !digitalRead(pinLed));` | Lê o estado de um botão. |
| 31 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 32 | `  if (String(topic) == topicPing && message.indexOf("\\"type\\":\\"ping\\"") >= 0) {` | Executa uma instrução C/C++ do firmware do ESP32. |
| 33 | `    char response[128];` | Executa uma instrução C/C++ do firmware do ESP32. |
| 34 | `    snprintf(response, sizeof(response),` | Monta uma mensagem JSON dentro de um buffer de texto. |
| 35 | `      "{\\"type\\":\\"pong\\",\\"id\\":\\"%s\\",\\"device\\":\\"esp32\\",\\"t\\":%lu}",` | Executa uma instrução C/C++ do firmware do ESP32. |
| 36 | `      controllerId, millis());` | Executa uma instrução C/C++ do firmware do ESP32. |
| 37 | `    mqtt.publish(topicPing, response);` | Publica uma mensagem MQTT. |
| 38 | `  }` | Fecha o bloco atual. |
| 39 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 40 | `  if (String(topic) == topicCmd &&` | Executa uma instrução C/C++ do firmware do ESP32. |
| 41 | `      (message.indexOf("\\"target\\":\\"esp32pad\\"") >= 0 \|\| message.indexOf("\\"target\\":\\"all\\"") >= 0)) {` | Executa uma instrução C/C++ do firmware do ESP32. |
| 42 | `    digitalWrite(pinLed, HIGH);` | Liga, desliga ou alterna o LED. |
| 43 | `    delay(120);` | Aguarda um pequeno intervalo antes de continuar. |
| 44 | `    digitalWrite(pinLed, LOW);` | Liga, desliga ou alterna o LED. |
| 45 | `  }` | Fecha o bloco atual. |
| 46 | `}` | Fecha o bloco atual. |
| 47 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 48 | `void connectWifi() {` | Declara a função \`connectWifi\` do firmware. |
| 49 | `  WiFi.begin(ssid, password);` | Inicia a conexão Wi-Fi. |
| 50 | `  while (WiFi.status() != WL_CONNECTED) {` | Verifica se o Wi-Fi já conectou. |
| 51 | `    delay(250);` | Aguarda um pequeno intervalo antes de continuar. |
| 52 | `  }` | Fecha o bloco atual. |
| 53 | `}` | Fecha o bloco atual. |
| 54 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 55 | `void connectMqtt() {` | Declara a função \`connectMqtt\` do firmware. |
| 56 | `  while (!mqtt.connected()) {` | Conecta o ESP32 ao broker MQTT e configura LWT. |
| 57 | `    const char* willPayload = "{\\"type\\":\\"presence\\",\\"id\\":\\"esp32pad\\",\\"name\\":\\"Controle ESP32\\",\\"status\\":\\"offline\\"}";` | Executa uma instrução C/C++ do firmware do ESP32. |
| 58 | `    mqtt.connect("circle-arena-esp32-pad", NULL, NULL, topicPresence, 1, true, willPayload);` | Conecta o ESP32 ao broker MQTT e configura LWT. |
| 59 | `    delay(500);` | Aguarda um pequeno intervalo antes de continuar. |
| 60 | `  }` | Fecha o bloco atual. |
| 61 | `  mqtt.subscribe(topicPing);` | Assina um tópico MQTT. |
| 62 | `  mqtt.subscribe(topicCmd);` | Assina um tópico MQTT. |
| 63 | `  mqtt.publish(topicPresence,` | Publica uma mensagem MQTT. |
| 64 | `    "{\\"type\\":\\"presence\\",\\"id\\":\\"esp32pad\\",\\"name\\":\\"Controle ESP32\\",\\"status\\":\\"online\\"}",` | Executa uma instrução C/C++ do firmware do ESP32. |
| 65 | `    true);` | Executa uma instrução C/C++ do firmware do ESP32. |
| 66 | `}` | Fecha o bloco atual. |
| 67 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 68 | `void setup() {` | Declara a função \`setup\` do firmware. |
| 69 | `  pinMode(pinUp, INPUT_PULLUP);` | Configura um pino como entrada ou saída. |
| 70 | `  pinMode(pinDown, INPUT_PULLUP);` | Configura um pino como entrada ou saída. |
| 71 | `  pinMode(pinLeft, INPUT_PULLUP);` | Configura um pino como entrada ou saída. |
| 72 | `  pinMode(pinRight, INPUT_PULLUP);` | Configura um pino como entrada ou saída. |
| 73 | `  pinMode(pinLed, OUTPUT);` | Configura um pino como entrada ou saída. |
| 74 | `  connectWifi();` | Executa uma instrução C/C++ do firmware do ESP32. |
| 75 | `  mqtt.setServer(mqttServer, mqttPort);` | Configura o broker MQTT no cliente PubSubClient. |
| 76 | `  mqtt.setCallback(onMessage);` | Define a função chamada quando chega mensagem MQTT. |
| 77 | `  connectMqtt();` | Executa uma instrução C/C++ do firmware do ESP32. |
| 78 | `}` | Fecha o bloco atual. |
| 79 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 80 | `void loop() {` | Declara a função \`loop\` do firmware. |
| 81 | `  if (!mqtt.connected()) {` | Conecta o ESP32 ao broker MQTT e configura LWT. |
| 82 | `    connectMqtt();` | Executa uma instrução C/C++ do firmware do ESP32. |
| 83 | `  }` | Fecha o bloco atual. |
| 84 | `  mqtt.loop();` | Executa uma instrução C/C++ do firmware do ESP32. |
| 85 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 86 | `  int dx = 0;` | Executa uma instrução C/C++ do firmware do ESP32. |
| 87 | `  int dy = 0;` | Executa uma instrução C/C++ do firmware do ESP32. |
| 88 | `  if (digitalRead(pinLeft) == LOW) dx -= 1;` | Lê o estado de um botão. |
| 89 | `  if (digitalRead(pinRight) == LOW) dx += 1;` | Lê o estado de um botão. |
| 90 | `  if (digitalRead(pinUp) == LOW) dy -= 1;` | Lê o estado de um botão. |
| 91 | `  if (digitalRead(pinDown) == LOW) dy += 1;` | Lê o estado de um botão. |
| 92 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 93 | `  if (dx != 0 \|\| dy != 0) {` | Executa uma instrução C/C++ do firmware do ESP32. |
| 94 | `    char payload[128];` | Executa uma instrução C/C++ do firmware do ESP32. |
| 95 | `    snprintf(payload, sizeof(payload),` | Monta uma mensagem JSON dentro de um buffer de texto. |
| 96 | `      "{\\"type\\":\\"cmd\\",\\"source\\":\\"%s\\",\\"target\\":\\"all\\",\\"dx\\":%d,\\"dy\\":%d,\\"t\\":%lu}",` | Executa uma instrução C/C++ do firmware do ESP32. |
| 97 | `      controllerId, dx, dy, millis());` | Executa uma instrução C/C++ do firmware do ESP32. |
| 98 | `    mqtt.publish(topicCmd, payload);` | Publica uma mensagem MQTT. |
| 99 | `  }` | Fecha o bloco atual. |
| 100 | `(em branco)` | Linha em branco usada para separar blocos do firmware. |
| 101 | `  delay(140);` | Aguarda um pequeno intervalo antes de continuar. |
| 102 | `}` | Fecha o bloco atual. |

## wokwi/diagram.json

Circuito do ESP32 no Wokwi.

| Linha | Código | Explicação |
|---:|---|---|
| 1 | `{` | Inicia um objeto JSON. |
| 2 | `  "version": 1,` | Informa a versão do arquivo de diagrama do Wokwi. |
| 3 | `  "author": "Codex",` | Informa o autor registrado no diagrama. |
| 4 | `  "editor": "wokwi",` | Informa o editor usado para o circuito. |
| 5 | `  "parts": [` | Inicia a lista de componentes do circuito. |
| 6 | `    { "type": "board-esp32-devkit-c-v4", "id": "esp", "top": 0, "left": 0, "attrs": {} },` | Define o tipo de componente no Wokwi. |
| 7 | `    { "type": "wokwi-pushbutton", "id": "up", "top": -80, "left": 180, "attrs": { "color": "green", "label": "UP" } },` | Define o tipo de componente no Wokwi. |
| 8 | `    { "type": "wokwi-pushbutton", "id": "down", "top": 90, "left": 180, "attrs": { "color": "blue", "label": "DOWN" } },` | Define o tipo de componente no Wokwi. |
| 9 | `    { "type": "wokwi-pushbutton", "id": "left", "top": 10, "left": 95, "attrs": { "color": "yellow", "label": "LEFT" } },` | Define o tipo de componente no Wokwi. |
| 10 | `    { "type": "wokwi-pushbutton", "id": "right", "top": 10, "left": 265, "attrs": { "color": "red", "label": "RIGHT" } },` | Define o tipo de componente no Wokwi. |
| 11 | `    { "type": "wokwi-led", "id": "led", "top": -80, "left": 315, "attrs": { "color": "limegreen", "label": "MQTT" } }` | Define o tipo de componente no Wokwi. |
| 12 | `  ],` | Fecha uma lista de dados no JSON. |
| 13 | `  "connections": [` | Inicia a lista de ligações elétricas entre componentes. |
| 14 | `    [ "up:1.l", "esp:32", "green", [] ],` | Inicia uma lista de dados no JSON. |
| 15 | `    [ "up:2.l", "esp:GND.1", "black", [] ],` | Inicia uma lista de dados no JSON. |
| 16 | `    [ "down:1.l", "esp:33", "blue", [] ],` | Inicia uma lista de dados no JSON. |
| 17 | `    [ "down:2.l", "esp:GND.1", "black", [] ],` | Inicia uma lista de dados no JSON. |
| 18 | `    [ "left:1.l", "esp:25", "yellow", [] ],` | Inicia uma lista de dados no JSON. |
| 19 | `    [ "left:2.l", "esp:GND.1", "black", [] ],` | Inicia uma lista de dados no JSON. |
| 20 | `    [ "right:1.l", "esp:26", "red", [] ],` | Inicia uma lista de dados no JSON. |
| 21 | `    [ "right:2.l", "esp:GND.1", "black", [] ],` | Inicia uma lista de dados no JSON. |
| 22 | `    [ "led:A", "esp:2", "green", [] ],` | Inicia uma lista de dados no JSON. |
| 23 | `    [ "led:C", "esp:GND.2", "black", [] ]` | Inicia uma lista de dados no JSON. |
| 24 | `  ]` | Fecha uma lista de dados no JSON. |
| 25 | `}` | Fecha um objeto JSON. |

## netlify.toml

Configuração de deploy no Netlify.

| Linha | Código | Explicação |
|---:|---|---|
| 1 | `[build]` | Inicia uma seção de configuração do Netlify. |
| 2 | `  publish = "."` | Define uma configuração usada no deploy. |
| 3 | `  command = ""` | Define uma configuração usada no deploy. |

