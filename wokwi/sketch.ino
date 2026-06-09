// Bibliotecas usadas pelo ESP32: WiFi conecta na rede do Wokwi e
// PubSubClient faz a comunicacao MQTT com o broker.
#include <WiFi.h>
#include <PubSubClient.h>

// Rede Wi-Fi padrao do Wokwi. Ela permite que o ESP32 simulado acesse a internet.
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Broker MQTT usado pelo projeto. O ESP32 usa MQTT TCP na porta 1883.
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;

// Identificacao do controle ESP32 e topicos MQTT usados por ele.
const char* controllerId = "esp32pad";
const char* baseTopic = "n461/circle-arena/circle-arena-demo";
const char* topicCmd = "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando";
const char* topicPresence = "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/presenca";
const char* topicPing = "n461/circle-arena/circle-arena-demo/telemetria/ping";

// Pinos ligados aos botoes de direcao e ao LED no circuito do Wokwi.
const int pinUp = 32;
const int pinDown = 33;
const int pinLeft = 25;
const int pinRight = 26;
const int pinLed = 2;

// Cliente de rede e cliente MQTT usados pelo PubSubClient.
WiFiClient net;
PubSubClient mqtt(net);

// Callback chamado sempre que o ESP32 recebe uma mensagem MQTT assinada.
void onMessage(char* topic, byte* payload, unsigned int length) {
  String message;

  // Converte o payload recebido em uma String para facilitar a verificacao.
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  // Alterna o LED para mostrar visualmente que chegou mensagem MQTT.
  digitalWrite(pinLed, !digitalRead(pinLed));

  // Se recebeu ping, responde pong no mesmo topico de telemetria.
  if (String(topic) == topicPing && message.indexOf("\"type\":\"ping\"") >= 0) {
    char response[128];
    snprintf(response, sizeof(response),
      "{\"type\":\"pong\",\"id\":\"%s\",\"device\":\"esp32\",\"t\":%lu}",
      controllerId, millis());
    mqtt.publish(topicPing, response);
  }

  // Se recebeu comando destinado ao ESP32, pisca o LED como confirmacao.
  if (String(topic) == topicCmd &&
      (message.indexOf("\"target\":\"esp32pad\"") >= 0 || message.indexOf("\"target\":\"all\"") >= 0)) {
    digitalWrite(pinLed, HIGH);
    delay(120);
    digitalWrite(pinLed, LOW);
  }
}

// Conecta o ESP32 ao Wi-Fi simulado do Wokwi.
void connectWifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
  }
}

// Conecta ao broker MQTT, configura LWT, assina topicos e publica presenca online.
void connectMqtt() {
  while (!mqtt.connected()) {
    // Last Will and Testament: se o ESP32 cair, o broker publica offline.
    const char* willPayload = "{\"type\":\"presence\",\"id\":\"esp32pad\",\"name\":\"Controle ESP32\",\"status\":\"offline\"}";
    mqtt.connect("circle-arena-esp32-pad", NULL, NULL, topicPresence, 1, true, willPayload);
    delay(500);
  }
  mqtt.subscribe(topicPing);
  mqtt.subscribe(topicCmd);

  // Presenca online fica retida no broker para novos clientes receberem o status.
  mqtt.publish(topicPresence,
    "{\"type\":\"presence\",\"id\":\"esp32pad\",\"name\":\"Controle ESP32\",\"status\":\"online\"}",
    true);
}

// setup roda uma vez quando o ESP32 inicia.
void setup() {
  // Botoes usam INPUT_PULLUP: solto fica HIGH, pressionado fica LOW.
  pinMode(pinUp, INPUT_PULLUP);
  pinMode(pinDown, INPUT_PULLUP);
  pinMode(pinLeft, INPUT_PULLUP);
  pinMode(pinRight, INPUT_PULLUP);
  pinMode(pinLed, OUTPUT);
  connectWifi();
  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(onMessage);
  connectMqtt();
}

// loop roda continuamente. Mantem MQTT ativo e transforma botoes em comandos.
void loop() {
  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

  // dx representa movimento horizontal e dy representa movimento vertical.
  int dx = 0;
  int dy = 0;
  if (digitalRead(pinLeft) == LOW) dx -= 1;
  if (digitalRead(pinRight) == LOW) dx += 1;
  if (digitalRead(pinUp) == LOW) dy -= 1;
  if (digitalRead(pinDown) == LOW) dy += 1;

  // Se algum botao foi pressionado, publica comando MQTT para a arena.
  if (dx != 0 || dy != 0) {
    char payload[128];
    snprintf(payload, sizeof(payload),
      "{\"type\":\"cmd\",\"source\":\"%s\",\"target\":\"all\",\"dx\":%d,\"dy\":%d,\"t\":%lu}",
      controllerId, dx, dy, millis());
    mqtt.publish(topicCmd, payload);
  }

  // Pequeno intervalo para evitar publicacoes excessivas enquanto segura o botao.
  delay(140);
}
