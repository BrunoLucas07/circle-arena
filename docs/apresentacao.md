# Roteiro de apresentação

Este roteiro foi montado para uma apresentação de aproximadamente 8 minutos, dividida entre cinco integrantes. A divisão abaixo deixa cada pessoa responsável por uma parte do projeto e também ajuda a responder perguntas do professor sobre o código.

## Integrantes e ordem sugerida

1. Antônio Carlos: abertura, objetivo do projeto e justificativa do tema.
2. Bruno Lucas dos Santos: arquitetura geral, broker HiveMQ e deploy.
3. Breno Benítez Falqueiro: interface web, HTML/CSS e funcionamento visual do jogo.
4. Eduardo do Prado Pereira: código JavaScript, lógica do jogo e comunicação MQTT no navegador.
5. Túlio Henrique Santos Gonçalves: ESP32/Wokwi, testes com Mosquitto e fechamento.

## 1. Antônio Carlos - Abertura e justificativa

### Fala sugerida

O nosso projeto se chama Circle Arena. Ele é um jogo multiplayer simples feito para demonstrar comunicação MQTT entre processos diferentes.

A gente escolheu um jogo porque fica mais fácil visualizar a comunicação acontecendo. Em vez de mostrar só valores em texto, cada mensagem MQTT muda algo visível na arena: posição do jogador, presença online, comando de movimento, pontuação ou resposta do ESP32.

No jogo, cada jogador controla uma bolinha. Ela coleta energia, cresce e pode engolir bolinhas menores, parecido com a ideia do Agar.io. O foco não é criar um jogo comercial completo, mas usar a dinâmica do jogo para demonstrar comunicação distribuída.

### Pontos que Antônio deve dominar

- O projeto é um sistema distribuído porque envolve navegador, broker, outro navegador, ESP32 e terminal Mosquitto.
- A comunicação não acontece por REST nem por banco de dados. Ela acontece por publish/subscribe MQTT.
- O broker fica no meio e distribui as mensagens para quem assinou os tópicos.

## 2. Bruno Lucas dos Santos - Arquitetura, HiveMQ e deploy

### Fala sugerida

A arquitetura tem quatro partes principais: a interface web, o broker HiveMQ, o ESP32 simulado no Wokwi e as ferramentas de teste, como Mosquitto e MQTT Explorer.

O navegador usa MQTT over WebSocket, porque navegador não abre conexão MQTT TCP direta. Já o ESP32 e o Mosquitto usam MQTT TCP pela porta 1883.

Escolhemos o HiveMQ porque ele permite testar pela internet sem configurar servidor próprio. Ele aceita WebSocket para a interface web e MQTT TCP para o ESP32 e para os testes no terminal.

O deploy foi feito no Netlify porque o projeto é estático. Ele usa HTML, CSS e JavaScript puro, então não precisa backend, banco de dados nem comando de build.

### Arquitetura em palavras

```txt
Navegador -> HiveMQ -> outro navegador
Navegador -> HiveMQ -> ESP32 no Wokwi
Mosquitto local -> HiveMQ -> aplicação web
ESP32 no Wokwi -> HiveMQ -> aplicação web
```

### Pontos que Bruno deve dominar

- HiveMQ foi usado como broker em nuvem.
- Netlify foi usado porque a interface é estática.
- WebSocket é necessário para MQTT no navegador.
- TCP 1883 é usado pelo ESP32 e pelo Mosquitto.

## 3. Breno Benítez Falqueiro - Interface web e visual do jogo

### Fala sugerida

A interface web fica principalmente nos arquivos `index.html`, `styles.css` e `app.js`.

O `index.html` monta a estrutura da página: campos de nome do jogador, broker, usuário, senha, sala, botões de conexão, botões de teste e o canvas onde a arena é desenhada.

O `styles.css` organiza a aparência da interface: painel lateral, botões, indicadores, caixa de última mensagem e área do jogo.

O canvas é usado para desenhar a arena em tempo real. Nele aparecem as bolinhas dos jogadores, os pontos de energia, obstáculos e pontuação. A caixa `Última mensagem` mostra o último JSON enviado ou recebido pelo MQTT.

### O que mostrar na tela

1. Abrir a aplicação hospedada.
2. Mostrar os campos de broker e sala.
3. Clicar em `Conectar`.
4. Mostrar a arena e o placar.
5. Mostrar a caixa `Última mensagem`.

### Pontos que Breno deve dominar

- A interface funciona como publisher e subscriber ao mesmo tempo.
- O canvas desenha o jogo, mas o estado vem das mensagens MQTT.
- A caixa de última mensagem ajuda a provar que existe JSON trafegando.

## 4. Eduardo do Prado Pereira - Código JavaScript e MQTT no navegador

### Fala sugerida

O arquivo principal do projeto é o `app.js`. Ele controla a interface, o estado do jogo, a conexão MQTT, o recebimento de mensagens e a lógica das bolinhas.

No começo do arquivo, o objeto `ui` guarda referências aos elementos da tela. O objeto `state` guarda informações da execução: ID do jogador, cliente MQTT, jogadores conectados, energia, obstáculos, sala, tópicos e status.

A função `connectMqtt()` monta os tópicos da sala, conecta ao broker, configura o Last Will and Testament e assina os tópicos principais:

```txt
jogadores/+/estado
jogadores/+/comando
jogadores/+/presenca
telemetria/ping
```

A função `publish()` transforma um objeto JavaScript em JSON e publica no tópico MQTT. A função `handleMessage()` recebe mensagens do broker e trata cada tipo de payload.

### Tipos de mensagem tratados

- `presence`: mostra se um jogador está online ou offline.
- `state`: atualiza posição, cor, nome, tamanho e pontuação.
- `cmd`: aplica comando de movimento.
- `ping` e `pong`: medem latência.
- `eaten`: sincroniza quando uma bolinha engole outra.

### Lógica do jogo

A função `movePlayer()` move a bolinha pelo teclado. A função `collectEnergy()` aumenta a pontuação quando o jogador pega energia. A função `playerRadius()` aumenta o tamanho da bolinha conforme a pontuação.

A parte parecida com Agar.io fica em `canEatPlayer()`, `eatPlayer()` e `resolvePlayerEating()`. Primeiro o código verifica se uma bolinha é maior que a outra e se está perto o suficiente. Se estiver, a bolinha maior ganha pontos e a menor renasce em outra posição.

### Pontos que Eduardo deve dominar

- `connectMqtt()` conecta e assina tópicos.
- `publish()` envia JSON.
- `handleMessage()` recebe JSON e atualiza o jogo.
- `requestAnimationFrame()` mantém o jogo atualizando em loop.

## 5. Túlio Henrique Santos Gonçalves - ESP32, Mosquitto e fechamento

### Fala sugerida

O ESP32 foi simulado no Wokwi, mas ele participa da comunicação MQTT real. No arquivo `wokwi/sketch.ino`, usamos `WiFi.h` para conectar no Wi-Fi do Wokwi e `PubSubClient.h` para conectar no broker MQTT.

Os botões do ESP32 representam direções. Quando um botão é pressionado, o ESP32 publica um JSON no tópico:

```txt
n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando
```

Exemplo de payload:

```json
{"type":"cmd","source":"esp32pad","target":"all","dx":1,"dy":0,"t":12345}
```

O `dx` representa movimento horizontal e o `dy` representa movimento vertical. O ESP32 também assina o tópico de ping e responde com `pong`. O LED pisca quando recebe mensagens.

### Testes com Mosquitto

Para escutar tudo que passa na sala:

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/#" -v
```

Esse comando não mexe na bolinha. Ele apenas mostra as mensagens no terminal.

Para enviar um comando que pode movimentar a bolinha:

```bash
mosquitto_pub -h broker.hivemq.com -p 1883 -q 1 -t "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando" -m "{\"type\":\"cmd\",\"source\":\"terminal\",\"target\":\"all\",\"dx\":1,\"dy\":0,\"t\":1780420000000}"
```

Esse comando publica uma mensagem de comando. Nesse caso, `dx:1` e `dy:0` indicam movimento para a direita.

### Fechamento

O projeto atende a proposta porque usa comunicação MQTT real entre processos diferentes: navegador, outro navegador, ESP32 no Wokwi e cliente Mosquitto local. A interface publica e recebe mensagens em tempo real, os tópicos são organizados, usamos wildcard, QoS justificado, retained messages e Last Will and Testament.

## Demonstração ao vivo

1. Abrir a aplicação hospedada no Netlify.
2. Clicar em `Conectar`.
3. Abrir a mesma aplicação em outro navegador ou aba.
4. Mostrar que os jogadores aparecem na mesma sala.
5. Mover uma bolinha e mostrar a mensagem na caixa `Última mensagem`.
6. Abrir o Wokwi e iniciar a simulação.
7. Apertar os botões do ESP32 para enviar comandos.
8. Clicar em `Piscar ESP32` na interface.
9. Rodar `mosquitto_sub` para mostrar os tópicos no terminal.
10. Rodar `mosquitto_pub` para publicar um comando manualmente.

## Possíveis perguntas do professor

### 1. Por que vocês escolheram MQTT?

Porque o trabalho precisava demonstrar comunicação entre dispositivos/processos. O MQTT é adequado porque trabalha com publish/subscribe, tópicos e broker. No nosso caso, navegador, ESP32 e terminal não conversam diretamente entre si. Todos conversam pelo broker.

### 2. Por que HiveMQ?

Porque o HiveMQ permitiu testar pela internet sem configurar servidor próprio. Ele aceita WebSocket para navegador e MQTT TCP para ESP32 e Mosquitto.

### 3. Por que o navegador usa WebSocket?

Porque navegador não abre conexão TCP MQTT pura. Por isso usamos MQTT over WebSocket com MQTT.js.

### 4. Onde está a comunicação MQTT no código?

No `app.js`, principalmente em `connectMqtt()`, `publish()` e `handleMessage()`.

### 5. Por que usar `+` e não `#` no código principal?

Porque o `+` pega exatamente um nível do tópico, que no nosso caso é o ID do jogador. O `#` pegaria tudo abaixo da sala e misturaria estado, comando, presença e ping no mesmo fluxo.

### 6. Por que QoS 0 no estado?

Porque estado de posição muda com frequência. Se uma mensagem se perder, outra substitui rapidamente.

### 7. Por que QoS 1 no comando?

Porque comando é uma ação discreta. Se o comando se perder, a interação pode falhar.

### 8. O que é retained message?

É uma mensagem que o broker guarda como última mensagem daquele tópico. Usamos em estado e presença.

### 9. O que é LWT?

Last Will and Testament é uma mensagem que o broker publica automaticamente se o cliente cair sem desconectar corretamente. No projeto, ela marca o cliente como offline.

### 10. O ESP32 é físico?

Não. Ele é simulado no Wokwi, mas usa comunicação MQTT real com o broker na nuvem.

### 11. O comando Mosquitto move a bolinha?

Depende do comando. `mosquitto_sub` só escuta e mostra mensagens no terminal. `mosquitto_pub`, quando publicado no tópico de comando com `dx` e `dy`, pode mover a bolinha ou disparar uma ação no jogo.

### 12. Como funciona uma bolinha comer a outra?

O `app.js` verifica tamanho e distância. Se uma bolinha é maior e está perto o suficiente, ela ganha pontos e a menor renasce.

### 13. Vocês usaram IA?

Sim, usamos IA como apoio para organizar o projeto, revisar texto e acelerar partes da implementação. A equipe estudou o funcionamento e preparou um arquivo de explicação do código para conseguir explicar as partes principais.
