#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;

const char* controllerId = "esp32pad";
const char* baseTopic = "n461/circle-arena/circle-arena-demo";
const char* topicCmd = "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/comando";
const char* topicPresence = "n461/circle-arena/circle-arena-demo/jogadores/esp32pad/presenca";
const char* topicPing = "n461/circle-arena/circle-arena-demo/telemetria/ping";

const int pinUp = 32;
const int pinDown = 33;
const int pinLeft = 25;
const int pinRight = 26;
const int pinLed = 2;

WiFiClient net;
PubSubClient mqtt(net);

void onMessage(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  digitalWrite(pinLed, !digitalRead(pinLed));

  if (String(topic) == topicPing && message.indexOf("\"type\":\"ping\"") >= 0) {
    char response[128];
    snprintf(response, sizeof(response),
      "{\"type\":\"pong\",\"id\":\"%s\",\"device\":\"esp32\",\"t\":%lu}",
      controllerId, millis());
    mqtt.publish(topicPing, response);
  }

  if (String(topic) == topicCmd &&
      (message.indexOf("\"target\":\"esp32pad\"") >= 0 || message.indexOf("\"target\":\"all\"") >= 0)) {
    digitalWrite(pinLed, HIGH);
    delay(120);
    digitalWrite(pinLed, LOW);
  }
}

void connectWifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
  }
}

void connectMqtt() {
  while (!mqtt.connected()) {
    const char* willPayload = "{\"type\":\"presence\",\"id\":\"esp32pad\",\"name\":\"Controle ESP32\",\"status\":\"offline\"}";
    mqtt.connect("circle-arena-esp32-pad", NULL, NULL, topicPresence, 1, true, willPayload);
    delay(500);
  }
  mqtt.subscribe(topicPing);
  mqtt.subscribe(topicCmd);
  mqtt.publish(topicPresence,
    "{\"type\":\"presence\",\"id\":\"esp32pad\",\"name\":\"Controle ESP32\",\"status\":\"online\"}",
    true);
}

void setup() {
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

void loop() {
  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

  int dx = 0;
  int dy = 0;
  if (digitalRead(pinLeft) == LOW) dx -= 1;
  if (digitalRead(pinRight) == LOW) dx += 1;
  if (digitalRead(pinUp) == LOW) dy -= 1;
  if (digitalRead(pinDown) == LOW) dy += 1;

  if (dx != 0 || dy != 0) {
    char payload[128];
    snprintf(payload, sizeof(payload),
      "{\"type\":\"cmd\",\"source\":\"%s\",\"target\":\"all\",\"dx\":%d,\"dy\":%d,\"t\":%lu}",
      controllerId, dx, dy, millis());
    mqtt.publish(topicCmd, payload);
  }

  delay(140);
}
