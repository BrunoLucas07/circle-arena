# Circle Arena

Explicações sobre as escolhas do projeto, funcionamento do código e testes de comunicação MQTT.

## Integrantes

- Antônio Carlos
- Bruno Lucas dos Santos
- Breno Benítez Falqueiro
- Eduardo do Prado Pereira
- Túlio Henrique Santos Gonçalves

## 1. Justificativa da escolha do tema

O tema escolhido foi um jogo multiplayer distribuído porque ele facilita a visualização da comunicação MQTT. Em um sistema de sensores, muitas vezes a mensagem aparece apenas como número. No Circle Arena, a mensagem altera algo visível na tela: posição do jogador, presença online, comando enviado pelo ESP32, pontuação ou resposta de ping.

A ideia do jogo foi inspirada em jogos no estilo Agar.io. Cada jogador controla uma bolinha, coleta energia para crescer e pode engolir bolinhas menores. Isso ajudou a transformar os conceitos de comunicação distribuída em uma demonstração mais clara para a apresentação.

Também escolhemos esse tema porque ele permite mostrar vários pontos obrigatórios do trabalho: interface web, broker em nuvem, dispositivo embarcado simulado, tópicos hierárquicos, wildcards, QoS, retained messages, Last Will and Testament e testes com ferramentas externas.

## 2. Descrição da arquitetura desenvolvida

A arquitetura foi montada em quatro partes principais.

A primeira parte é a interface web. Ela roda no navegador, desenha a arena no canvas e conecta ao broker usando MQTT over WebSocket.

A segunda parte é o broker MQTT HiveMQ. Ele fica na nuvem e recebe todas as mensagens publicadas. Depois entrega essas mensagens para os clientes inscritos nos tópicos.

A terceira parte é o ESP32 no Wokwi. Ele funciona como um controle físico simulado. Os botões publicam comandos de movimento e o LED indica recebimento de mensagens.

A quarta parte são as ferramentas de teste, como Mosquitto e MQTT Explorer. Elas permitem verificar se os tópicos estão recebendo mensagens de verdade.

Fluxo geral:

```txt
Navegador 1 -> HiveMQ -> Navegador 2
Navegador 1 -> HiveMQ -> ESP32 no Wokwi
Mosquitto local -> HiveMQ -> Aplicação web
ESP32 no Wokwi -> HiveMQ -> Aplicação web
```

Essa estrutura demonstra um sistema distribuído porque cada parte roda em um lugar diferente e a troca de mensagens acontece por meio do broker.

## 3. Evidências do uso de MQTT, broker, interface e embarcado

### MQTT

O arquivo `app.js` usa a biblioteca MQTT.js no navegador. As principais funções relacionadas são:

- `connectMqtt()`: conecta ao broker e assina os tópicos.
- `publish()`: publica mensagens em formato JSON.
- `handleMessage()`: recebe mensagens do broker e decide o que fazer com cada tipo.
- `publishLocalState()`: publica posição, tamanho, cor e pontuação do jogador.
- `publishPresence()`: publica se o jogador está online ou offline.

### Broker em nuvem

O broker usado por padrão é:

```txt
wss://broker.hivemq.com:8884/mqtt
```

Na interface web, usamos WebSocket porque o navegador não conecta diretamente em MQTT TCP. Já o ESP32 e o Mosquitto usam:

```txt
broker.hivemq.com:1883
```

### Interface gráfica

A interface fica nos arquivos `index.html`, `styles.css` e `app.js`. Ela mostra a arena, o placar, a quantidade de jogadores online, a latência, os tópicos usados e a última mensagem MQTT recebida.

A caixa `Última mensagem` foi colocada como um console para facilitar a apresentação. Quando uma mensagem chega, o JSON aparece ali, mostrando que a interface realmente está recebendo dados do broker.

### ESP32 no Wokwi

O arquivo `wokwi/sketch.ino` conecta o ESP32 simulado ao Wi-Fi do Wokwi e ao broker MQTT. Os botões geram mensagens de comando, e o LED acende ou pisca quando mensagens chegam.

Mesmo sendo simulado, o ESP32 usa comunicação MQTT real com o broker na nuvem.

## 4. Explicações sobre as decisões técnicas adotadas

### Por que HTML, CSS e JavaScript puro?

Escolhemos HTML, CSS e JavaScript puro porque o projeto não precisava de backend. O foco era demonstrar MQTT, não criar uma arquitetura web complexa. Com isso, o deploy ficou mais simples no Netlify e o código ficou mais direto para explicar.

### Por que Canvas 2D?

Usamos Canvas 2D porque ele permite desenhar a arena, jogadores, energia e obstáculos em tempo real. Para um jogo simples de bolinhas, Canvas é suficiente e evita depender de bibliotecas mais pesadas.

### Por que MQTT.js?

MQTT.js foi usado porque funciona bem no navegador com MQTT over WebSocket. Como o navegador não abre uma conexão MQTT TCP comum, o WebSocket é a forma correta para a interface web falar com o broker.

### Por que HiveMQ?

O HiveMQ público foi escolhido porque permite teste rápido pela internet. Ele aceita WebSocket para o navegador e MQTT TCP para ESP32, Mosquitto e MQTT Explorer.

Essa escolha também ajudou na apresentação, porque não precisamos manter um servidor próprio ligado. Para um ambiente real de produção, o ideal seria usar HiveMQ Cloud, EMQX Cloud ou outro broker com autenticação e TLS.

### Por que Wokwi?

O Wokwi foi escolhido porque permite simular um ESP32 sem depender de equipamento físico. Isso atende ao requisito de dispositivo embarcado simulado, desde que ele se comunique com um broker real, o que acontece no projeto.

### Por que Netlify?

O Netlify foi usado porque o projeto é estático. Não existe backend, banco de dados ou comando de build. O Netlify consegue publicar diretamente a raiz do repositório.

## 5. Organização dos tópicos MQTT

A raiz dos tópicos é:

```txt
n461/circle-arena/circle-arena-demo
```

Dentro dela, usamos:

```txt
jogadores/<id>/estado
jogadores/<id>/comando
jogadores/<id>/presenca
telemetria/ping
```

Essa organização foi escolhida para deixar claro o significado de cada mensagem.

O tópico `estado` carrega informações que mudam o tempo todo, como posição e pontuação.

O tópico `comando` carrega ações, como movimento enviado pelo teclado, pelo terminal ou pelo ESP32.

O tópico `presenca` informa quem está online ou offline.

O tópico `telemetria/ping` serve para medir resposta entre clientes.

## 6. Uso de wildcards

No código principal usamos `+`, por exemplo:

```txt
n461/circle-arena/circle-arena-demo/jogadores/+/estado
```

O `+` substitui exatamente um nível do tópico. Nesse caso, ele substitui o ID do jogador. Assim, a aplicação recebe o estado de qualquer jogador sem misturar com comando, presença ou ping.

Não usamos `#` na lógica principal porque ele receberia tudo abaixo da sala. Isso é útil para teste, mas deixaria o código menos organizado. Por isso, o `#` aparece nos testes com Mosquitto e MQTT Explorer, onde a intenção é enxergar tudo que passa pelo broker.

## 7. Uso de QoS

Usamos QoS 0 em `estado` e `ping`.

Estado é enviado com frequência. Se uma atualização de posição se perder, outra chega logo depois. Ping também é uma mensagem temporária. Por isso QoS 0 é suficiente e mais leve.

Usamos QoS 1 em `comando` e `presenca`.

Comando representa uma ação do jogador ou do ESP32. Se esse comando se perder, a interação pode falhar. Presença também é importante porque indica online ou offline. Por isso usamos QoS 1 nesses casos.

Não usamos QoS 2 porque ele gera mais controle e mais troca de mensagens. Para um jogo simples em tempo real, esse custo não era necessário.

## 8. Recursos avançados MQTT

### Retained messages

Usamos retained messages em `estado` e `presenca`. Isso faz o broker guardar a última mensagem daquele tópico.

Na prática, quando um novo navegador entra na sala, ele pode receber a última informação conhecida sem esperar uma nova publicação.

### Last Will and Testament

Usamos Last Will and Testament no navegador e no ESP32. Quando o cliente conecta, ele informa ao broker qual mensagem deve ser publicada se a conexão cair inesperadamente.

No projeto, essa mensagem marca o cliente como `offline` no tópico de presença.

## 9. Explicação resumida do código

### `index.html`

O `index.html` organiza a interface. Nele ficam os campos de nome do jogador, broker, usuário, senha, sala, botões de conexão e o canvas da arena.

Também existe a área de telemetria, que mostra pontuação, jogadores online, latência, tópicos usados e última mensagem recebida.

### `styles.css`

O `styles.css` define a aparência da interface. Ele organiza os painéis, botões, canvas e a caixa de última mensagem.

### `app.js`

O `app.js` é o arquivo principal do jogo.

O objeto `ui` guarda referências aos elementos da tela.

O objeto `state` guarda os dados da execução: jogador local, cliente MQTT, lista de jogadores, energia, obstáculos, tópicos, sala e status.

A função `connectMqtt()` conecta no broker, configura o LWT e assina os tópicos.

A função `publish()` envia mensagens MQTT em JSON.

A função `handleMessage()` interpreta tudo que chega do broker.

A função `movePlayer()` move a bolinha conforme teclado ou comandos.

A função `collectEnergy()` aumenta a pontuação quando a bolinha pega energia.

A função `canEatPlayer()` verifica se uma bolinha pode engolir outra.

A função `eatPlayer()` aplica a pontuação e renasce a bolinha engolida.

A função `drawWorld()` desenha a arena, energia, obstáculos e jogadores.

A função `loop()` atualiza o jogo continuamente usando `requestAnimationFrame`.

### `wokwi/sketch.ino`

O `sketch.ino` é o firmware do ESP32 simulado.

Ele conecta no Wi-Fi do Wokwi, conecta no broker HiveMQ, assina tópicos e publica comandos quando os botões são pressionados.

Também responde a mensagens de ping e usa o LED para indicar atividade.

## 10. Explicação dos comandos de teste

### Verificar se o Mosquitto está instalado

```bash
mosquitto_sub --help
mosquitto_pub --help
```

Esses comandos só verificam se as ferramentas existem no computador.

### Escutar tudo da sala

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/#" -v
```

Esse comando assina todos os tópicos abaixo da sala. Ele mostra estado, comando, presença e ping.

### Publicar comando pelo terminal

```bash
mosquitto_pub -h broker.hivemq.com -p 1883 -q 1 -t "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando" -m "{\"type\":\"cmd\",\"source\":\"terminal\",\"target\":\"all\",\"dx\":1,\"dy\":0,\"t\":1780420000000}"
```

Esse comando envia uma mensagem MQTT para o broker. O JSON representa um comando de movimento para a direita, porque `dx` é 1 e `dy` é 0.

### Escutar apenas estados

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/jogadores/+/estado" -v
```

Esse comando mostra o uso de `+`, recebendo estado de qualquer jogador, mas sem pegar comando ou presença.

### Testar retained message

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/jogadores/+/presenca" -v -C 1
```

Esse comando recebe uma mensagem de presença e encerra. Se ele receber uma mensagem imediatamente, isso ajuda a mostrar que o broker guardou a última presença como retained.

## 11. Avaliação dos resultados obtidos

O projeto permite abrir dois navegadores na mesma sala e visualizar jogadores diferentes. Também permite publicar comandos pelo terminal e pelo ESP32 simulado.

Os testes com Mosquitto ajudam a confirmar que a comunicação não está presa ao navegador ou ao computador local. A mensagem passa pelo broker HiveMQ na internet.

A interface também mostra a última mensagem em formato de console, o que facilita a conferência dos payloads MQTT durante a apresentação.

## 12. Conclusão

O Circle Arena demonstra uma aplicação distribuída usando MQTT. A solução conecta interface web, broker na nuvem, ESP32 simulado e ferramentas externas de teste.

As decisões técnicas foram tomadas para deixar o projeto simples de executar e fácil de demonstrar: JavaScript puro, Canvas 2D, MQTT.js, HiveMQ, Wokwi, Mosquitto e Netlify.

Como melhoria futura, seria possível usar um broker autenticado com TLS, salvar histórico de partidas em banco de dados e usar um ESP32 físico na apresentação.
