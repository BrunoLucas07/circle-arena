# Testes documentados

Esta parte serve para registrar evidências do broker funcionando pela internet. Os testes podem ser feitos no terminal do VS Code, no PowerShell normal ou no Prompt de Comando. Eu prefiro o terminal do VS Code porque ele fica aberto junto com o projeto.

## Como abrir o terminal no VS Code

1. Abra a pasta do projeto no VS Code.
2. Vá em `Terminal > New Terminal`.
3. O terminal abre na parte de baixo.
4. Rode os comandos `mosquitto_sub` e `mosquitto_pub`.

Se o comando não for reconhecido, é porque o Mosquitto não está instalado ou não está no PATH do Windows. Nesse caso, instale o Mosquitto para Windows e marque a opção de adicionar ao PATH, ou rode os comandos dentro da pasta onde o Mosquitto foi instalado.

Para testar se está funcionando:

```bash
mosquitto_sub --help
mosquitto_pub --help
```

Esses dois comandos não conectam no projeto. Eles servem só para conferir se as ferramentas do Mosquitto estão instaladas. O `mosquitto_sub` é usado para assinar tópicos e receber mensagens. O `mosquitto_pub` é usado para publicar mensagens em um tópico.

## Entendendo as partes dos comandos

Nos comandos abaixo, usamos sempre o mesmo broker:

```txt
broker.hivemq.com
```

Esse é o broker MQTT público da HiveMQ. Ele fica na nuvem e permite testar a comunicação pela internet.

As principais partes dos comandos são:

- `-h broker.hivemq.com`: informa o endereço do broker.
- `-p 1883`: informa a porta MQTT TCP comum, sem TLS.
- `-t "topico"`: informa o tópico que será assinado ou publicado.
- `-m "mensagem"`: informa o conteúdo publicado no tópico.
- `-q 1`: define QoS 1, usado quando queremos mais garantia de entrega.
- `-v`: mostra o tópico junto com a mensagem recebida.
- `-C 1`: recebe uma mensagem e encerra o comando.

## Dúvida comum: qual comando mexe a bolinha?

O `mosquitto_sub` não mexe a bolinha. Ele é um subscriber, então serve para escutar tópicos e mostrar no terminal as mensagens que passam pelo broker.

O comando que pode mexer a bolinha é o `mosquitto_pub`, quando ele publica no tópico de `comando` com um payload contendo `dx` e `dy`.

Exemplo:

```bash
mosquitto_pub -h broker.hivemq.com -p 1883 -q 1 -t "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando" -m "{\"type\":\"cmd\",\"source\":\"terminal\",\"target\":\"all\",\"dx\":1,\"dy\":0,\"t\":1780420000000}"
```

Nesse exemplo, `dx:1` e `dy:0` representam movimento para a direita. Já o comando abaixo apenas mostra mensagens no terminal:

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/#" -v
```

## 1. Teste escutando todos os tópicos da sala

Este comando assina tudo abaixo da sala usando `#`. Aqui o `#` é usado como teste geral, para enxergar tudo que passa pelo broker.

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/#" -v
```

O que ele faz:

- abre uma conexão MQTT com o HiveMQ público;
- fica escutando todos os tópicos que começam com `n461/circle-arena/circle-arena-demo/`;
- mostra no terminal as mensagens de estado, comando, presença e ping;
- serve para provar que as mensagens estão passando pelo broker na nuvem.

Depois disso, abra a aplicação no navegador e clique em `Conectar`. O terminal deve mostrar mensagens parecidas com:

```txt
n461/circle-arena/circle-arena-demo/jogadores/abc123/presenca {"type":"presence","id":"abc123","status":"online",...}
n461/circle-arena/circle-arena-demo/jogadores/abc123/estado {"type":"state","id":"abc123","x":123,"y":456,...}
```

## 2. Teste publicando comando pelo Mosquitto

Com a aplicação aberta e conectada, rode:

```bash
mosquitto_pub -h broker.hivemq.com -p 1883 -q 1 -t "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando" -m "{\"type\":\"cmd\",\"source\":\"terminal\",\"target\":\"all\",\"dx\":0,\"dy\":-1,\"t\":1780420000000}"
```

O que ele faz:

- usa `mosquitto_pub`, então ele publica uma mensagem;
- publica no tópico de comando do controle `esp32pad`;
- envia um JSON do tipo `cmd`, que representa um comando de movimento;
- usa `target:"all"`, então a mensagem pode ser recebida por todos os clientes que assinam comandos;
- usa `dx:0` e `dy:-1`, que representam movimento para cima;
- usa QoS 1, porque comando perdido atrapalha mais do que uma atualização de posição perdida.

Resultado esperado: a aplicação recebe a mensagem no painel de telemetria. Se o Wokwi estiver rodando, o ESP32 também recebe comando pelo tópico configurado.

Outro exemplo de movimento:

```bash
mosquitto_pub -h broker.hivemq.com -p 1883 -q 1 -t "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando" -m "{\"type\":\"cmd\",\"source\":\"terminal\",\"target\":\"all\",\"dx\":1,\"dy\":0,\"t\":1780420000000}"
```

Nesse caso, `dx:1` e `dy:0` indicam movimento para a direita.

## 3. Teste do wildcard `+`

Este comando recebe apenas mensagens de estado dos jogadores:

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/jogadores/+/estado" -v
```

O `+` substitui somente um nível do tópico. No nosso caso, ele substitui o ID do jogador.

Exemplos que esse comando recebe:

```txt
n461/circle-arena/circle-arena-demo/jogadores/bruno/estado
n461/circle-arena/circle-arena-demo/jogadores/esp32pad/estado
n461/circle-arena/circle-arena-demo/jogadores/abc123/estado
```

Exemplos que ele não recebe:

```txt
n461/circle-arena/circle-arena-demo/jogadores/bruno/comando
n461/circle-arena/circle-arena-demo/jogadores/bruno/presenca
n461/circle-arena/circle-arena-demo/telemetria/ping
```

Essa é a diferença principal entre `+` e `#`. O `+` é mais controlado, porque pega exatamente um nível. O `#` pega tudo dali para baixo. Por isso usamos `+` no código principal e deixamos `#` para testes gerais.

## 4. Teste de retained message

1. Abra a interface web.
2. Clique em `Conectar`.
3. Depois rode:

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/jogadores/+/presenca" -v -C 1
```

O que ele faz:

- assina os tópicos de presença de qualquer jogador;
- recebe apenas uma mensagem por causa do `-C 1`;
- mostra se existe uma presença retida pelo broker.

Resultado esperado: o terminal recebe imediatamente a última presença retida, sem precisar esperar uma nova publicação. Isso demonstra o uso de retained message no projeto.

## 5. Teste com cliente local e broker na nuvem

Este teste mostra que uma ponta local, usando Mosquitto no computador, conversa com o broker na nuvem usado pela aplicação.

Terminal 1:

```bash
mosquitto_sub -h broker.hivemq.com -p 1883 -t "n461/circle-arena/circle-arena-demo/#" -v
```

Terminal 2:

```bash
mosquitto_pub -h broker.hivemq.com -p 1883 -q 1 -t "n461/circle-arena/circle-arena-demo/jogadores/mosquitto/comando" -m "{\"type\":\"cmd\",\"source\":\"mosquitto-local\",\"target\":\"all\",\"dx\":1,\"dy\":0,\"t\":1780420000000}"
```

No Terminal 1 deve aparecer a mensagem publicada pelo Terminal 2. Isso serve como evidência de que o teste não ficou preso em `localhost`. A mensagem saiu de um terminal local, foi até o broker HiveMQ na internet e voltou para outro cliente inscrito no mesmo broker.

## 6. Teste com MQTT Explorer

Configuração:

- Host: `broker.hivemq.com`
- Port: `1883`
- Protocol: MQTT TCP
- Topic para observar: `n461/circle-arena/circle-arena-demo/#`

No MQTT Explorer, o objetivo é tirar um print mostrando os tópicos de `estado`, `comando`, `presenca` e `telemetria/ping`.

Esse print ajuda na apresentação porque mostra a árvore de tópicos MQTT de forma visual.
