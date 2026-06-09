const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  statusDot: document.querySelector("#statusDot"),
  connectionStatus: document.querySelector("#connectionStatus"),
  playerName: document.querySelector("#playerName"),
  brokerUrl: document.querySelector("#brokerUrl"),
  brokerUser: document.querySelector("#brokerUser"),
  brokerPass: document.querySelector("#brokerPass"),
  roomTopic: document.querySelector("#roomTopic"),
  connectBtn: document.querySelector("#connectBtn"),
  localBtn: document.querySelector("#localBtn"),
  simulateBtn: document.querySelector("#simulateBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  deviceBtn: document.querySelector("#deviceBtn"),
  pingBtn: document.querySelector("#pingBtn"),
  score: document.querySelector("#score"),
  playersOnline: document.querySelector("#playersOnline"),
  latency: document.querySelector("#latency"),
  topicLabel: document.querySelector("#topicLabel"),
  cmdTopic: document.querySelector("#cmdTopic"),
  stateTopic: document.querySelector("#stateTopic"),
  lastPayload: document.querySelector("#lastPayload"),
  log: document.querySelector("#log")
};

const colors = ["#46d48f", "#49c7e8", "#ffd166", "#ff8f5a", "#c792ea", "#ff5d73"];
const MIN_PLAYER_RADIUS = 16;
const MAX_PLAYER_RADIUS = 58;
const EAT_SIZE_RATIO = 1.16;
const state = {
  id: crypto.randomUUID().slice(0, 8),
  client: null,
  connected: false,
  mode: "local",
  keys: new Set(),
  players: new Map(),
  energy: [],
  hazards: [],
  simulator: false,
  lastPublish: 0,
  lastPing: 0,
  lastPong: 0,
  room: "",
  baseTopic: "",
  topics: {
    cmd: "local",
    state: "local",
    ping: "local",
    presence: "local"
  }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function playerRadius(player) {
  return clamp(MIN_PLAYER_RADIUS + Math.sqrt(Math.max(0, player.score)) * 1.18, MIN_PLAYER_RADIUS, MAX_PLAYER_RADIUS);
}

function respawnPlayer(player, score = 0) {
  const radius = playerRadius(player);
  player.x = randomBetween(radius + 18, canvas.width - radius - 18);
  player.y = randomBetween(radius + 18, canvas.height - radius - 100);
  player.vx = 0;
  player.vy = 0;
  player.score = score;
  player.updatedAt = Date.now();
}

function addLog(message) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  ui.log.prepend(item);
  while (ui.log.children.length > 9) ui.log.lastElementChild.remove();
}

function setLastPayload(value) {
  ui.lastPayload.value = value;
  ui.lastPayload.scrollTop = ui.lastPayload.scrollHeight;
}

function sanitizeTopic(value) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "-") || "circle-arena-demo";
}

function playerTemplate(id, name, isLocal = false) {
  const color = colors[Math.abs([...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % colors.length];
  return {
    id,
    name,
    isLocal,
    color,
    x: randomBetween(80, canvas.width - 80),
    y: randomBetween(80, canvas.height - 120),
    vx: 0,
    vy: 0,
    score: 0,
    alive: true,
    updatedAt: Date.now()
  };
}

function localPlayer() {
  if (!state.players.has(state.id)) {
    state.players.set(state.id, playerTemplate(state.id, ui.playerName.value, true));
  }
  return state.players.get(state.id);
}

function seedWorld() {
  state.energy = Array.from({ length: 18 }, (_, index) => ({
    id: `e${index}`,
    x: randomBetween(34, canvas.width - 34),
    y: randomBetween(34, canvas.height - 104),
    r: randomBetween(7, 12),
    phase: Math.random() * Math.PI * 2
  }));

  state.hazards = Array.from({ length: 5 }, (_, index) => ({
    id: `h${index}`,
    x: randomBetween(90, canvas.width - 90),
    y: randomBetween(90, canvas.height - 150),
    r: randomBetween(22, 36),
    drift: randomBetween(-0.65, 0.65)
  }));
}

function setStatus(label, variant = "local") {
  ui.connectionStatus.textContent = label;
  ui.statusDot.className = `dot ${variant === "online" ? "online" : variant === "error" ? "error" : ""}`;
}

function syncTopicLabels() {
  ui.topicLabel.textContent = state.mode === "mqtt" ? state.room : "offline";
  ui.cmdTopic.textContent = state.topics.cmd === "local" ? "local" : `${state.topics.cmd} (QoS 1)`;
  ui.stateTopic.textContent = state.topics.state === "local" ? "local" : `${state.topics.state} (QoS 0, wildcard)`;
}

function publish(topic, payload, options = {}) {
  const text = JSON.stringify(payload);
  setLastPayload(text);
  if (state.connected && state.client) {
    state.client.publish(topic, text, { qos: options.qos ?? 0, retain: options.retain ?? false });
  }
}

function publishLocalState() {
  const p = localPlayer();
  publish(`${state.baseTopic}/jogadores/${state.id}/estado`, {
    type: "state",
    id: state.id,
    name: p.name,
    x: Math.round(p.x),
    y: Math.round(p.y),
    score: p.score,
    radius: Math.round(playerRadius(p)),
    color: p.color,
    t: Date.now()
  }, { qos: 0, retain: true });
}

function publishPresence(status) {
  publish(`${state.baseTopic}/jogadores/${state.id}/presenca`, {
    type: "presence",
    id: state.id,
    name: ui.playerName.value || "Jogador",
    status,
    t: Date.now()
  }, { qos: 1, retain: true });
}

function handleMessage(topic, raw) {
  let payload;
  try {
    payload = JSON.parse(raw.toString());
  } catch {
    addLog(`mensagem invalida em ${topic}`);
    return;
  }

  setLastPayload(JSON.stringify(payload, null, 2));

  if (payload.type === "presence" && payload.id !== state.id) {
    addLog(`${payload.name || payload.id}: ${payload.status}`);
    if (payload.status === "offline") {
      state.players.delete(payload.id);
    }
  }

  if (payload.type === "state" && payload.id !== state.id) {
    const player = state.players.get(payload.id) || playerTemplate(payload.id, payload.name || "Remoto");
    Object.assign(player, {
      name: payload.name || player.name,
      x: payload.x,
      y: payload.y,
      score: payload.score || 0,
      color: payload.color || player.color,
      updatedAt: Date.now()
    });
    state.players.set(payload.id, player);
  }

  if (payload.type === "eaten" && payload.source !== state.id && payload.target === state.id) {
    const p = localPlayer();
    respawnPlayer(p, 0);
    publishLocalState();
    addLog(`${payload.by || "Outro jogador"} engoliu sua bolinha`);
  }

  const isExternalCommand = payload.type === "cmd" && payload.source !== state.id;
  const isCommandForThisClient = payload.target === state.id || payload.target === "all" || !payload.target;
  if (isExternalCommand && isCommandForThisClient) {
    const p = localPlayer();
    p.vx += (payload.dx || 0) * 2.2;
    p.vy += (payload.dy || 0) * 2.2;
    addLog(`comando recebido: dx=${payload.dx || 0}, dy=${payload.dy || 0}`);
  }

  if (payload.type === "ping") {
    publish(`${state.baseTopic}/telemetria/ping`, { type: "pong", id: state.id, t: payload.t }, { qos: 0 });
  }

  if (payload.type === "pong" && payload.id === state.id) {
    state.lastPong = Date.now() - payload.t;
    ui.latency.textContent = `${state.lastPong} ms`;
  }
}

function connectMqtt() {
  if (!window.mqtt) {
    setStatus("Biblioteca MQTT nao carregou", "error");
    addLog("abra com internet ou use o modo local");
    return;
  }

  if (state.client) state.client.end(true);
  state.room = sanitizeTopic(ui.roomTopic.value);
  state.baseTopic = `n461/circle-arena/${state.room}`;
  state.topics = {
    cmd: `${state.baseTopic}/jogadores/${state.id}/comando`,
    cmdWildcard: `${state.baseTopic}/jogadores/+/comando`,
    state: `${state.baseTopic}/jogadores/+/estado`,
    ping: `${state.baseTopic}/telemetria/ping`,
    presence: `${state.baseTopic}/jogadores/+/presenca`
  };
  syncTopicLabels();
  setStatus("Conectando...", "local");

  const options = {
    clientId: `circle_arena_${state.id}_${Date.now()}`,
    clean: true,
    reconnectPeriod: 2500,
    connectTimeout: 8000,
    will: {
      topic: `${state.baseTopic}/jogadores/${state.id}/presenca`,
      payload: JSON.stringify({
        type: "presence",
        id: state.id,
        name: ui.playerName.value || "Jogador",
        status: "offline",
        t: Date.now()
      }),
      qos: 1,
      retain: true
    }
  };
  if (ui.brokerUser.value.trim()) {
    options.username = ui.brokerUser.value.trim();
    options.password = ui.brokerPass.value;
  }

  state.client = mqtt.connect(ui.brokerUrl.value.trim(), options);

  state.client.on("connect", () => {
    state.mode = "mqtt";
    state.connected = true;
    setStatus("Conectado ao MQTT", "online");
    state.client.subscribe(state.topics.state, { qos: 0 });
    state.client.subscribe(state.topics.cmdWildcard, { qos: 1 });
    state.client.subscribe(state.topics.presence, { qos: 1 });
    state.client.subscribe(state.topics.ping, { qos: 0 });
    publishPresence("online");
    publishLocalState();
    addLog(`conectado na sala ${state.room}`);
  });

  state.client.on("message", handleMessage);
  state.client.on("reconnect", () => setStatus("Reconectando...", "local"));
  state.client.on("close", () => {
    state.connected = false;
    if (state.mode === "mqtt") setStatus("Desconectado", "error");
  });
  state.client.on("error", (error) => {
    setStatus("Erro no MQTT", "error");
    addLog(error.message);
  });
}

function enableLocalMode() {
  if (state.connected) publishPresence("offline");
  if (state.client) state.client.end(true);
  state.client = null;
  state.connected = false;
  state.mode = "local";
  state.baseTopic = "";
  state.topics = { cmd: "local", state: "local", ping: "local", presence: "local" };
  syncTopicLabels();
  setStatus("Modo local", "local");
  addLog("modo local ativado");
}

function movePlayer(player, dt) {
  const radius = playerRadius(player);
  const sizePenalty = clamp(1.1 - (radius - MIN_PLAYER_RADIUS) / 80, 0.55, 1);
  const accel = 860 * sizePenalty;
  let dx = 0;
  let dy = 0;
  if (state.keys.has("ArrowLeft") || state.keys.has("KeyA")) dx -= 1;
  if (state.keys.has("ArrowRight") || state.keys.has("KeyD")) dx += 1;
  if (state.keys.has("ArrowUp") || state.keys.has("KeyW")) dy -= 1;
  if (state.keys.has("ArrowDown") || state.keys.has("KeyS")) dy += 1;

  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    player.vx += (dx / length) * accel * dt;
    player.vy += (dy / length) * accel * dt;
  }

  player.vx *= 0.88;
  player.vy *= 0.88;
  player.x = clamp(player.x + player.vx * dt, radius, canvas.width - radius);
  player.y = clamp(player.y + player.vy * dt, radius, canvas.height - radius - 64);
}

function updateSimulator(dt) {
  const id = "bot-rival";
  if (!state.simulator) {
    state.players.delete(id);
    return;
  }

  const bot = state.players.get(id) || playerTemplate(id, "Rival MQTT");
  const target = state.energy.reduce((best, item) => {
    const distance = Math.hypot(item.x - bot.x, item.y - bot.y);
    return !best || distance < best.distance ? { item, distance } : best;
  }, null);

  if (target) {
    const angle = Math.atan2(target.item.y - bot.y, target.item.x - bot.x);
    bot.vx += Math.cos(angle) * 340 * dt;
    bot.vy += Math.sin(angle) * 340 * dt;
  }

  bot.vx *= 0.91;
  bot.vy *= 0.91;
  const radius = playerRadius(bot);
  bot.x = clamp(bot.x + bot.vx * dt, radius, canvas.width - radius);
  bot.y = clamp(bot.y + bot.vy * dt, radius, canvas.height - radius - 64);
  bot.updatedAt = Date.now();
  state.players.set(id, bot);
}

function collectEnergy(player) {
  const radius = playerRadius(player);
  state.energy.forEach((item) => {
    if (Math.hypot(player.x - item.x, player.y - item.y) < item.r + radius) {
      player.score += 10;
      item.x = randomBetween(34, canvas.width - 34);
      item.y = randomBetween(34, canvas.height - 104);
      item.phase = Math.random() * Math.PI * 2;
      if (player.isLocal) publishLocalState();
    }
  });
}

function applyHazards(player) {
  const radius = playerRadius(player);
  for (const hazard of state.hazards) {
    if (Math.hypot(player.x - hazard.x, player.y - hazard.y) < hazard.r + radius * 0.75) {
      player.score = Math.max(0, player.score - 1);
      player.vx *= -0.72;
      player.vy *= -0.72;
    }
  }
}

function canEatPlayer(hunter, prey) {
  const hunterRadius = playerRadius(hunter);
  const preyRadius = playerRadius(prey);
  const distance = Math.hypot(hunter.x - prey.x, hunter.y - prey.y);
  return hunterRadius > preyRadius * EAT_SIZE_RATIO && distance < hunterRadius * 0.82;
}

function eatPlayer(hunter, prey) {
  const gain = Math.max(25, Math.round(prey.score * 0.65 + playerRadius(prey)));
  hunter.score += gain;
  hunter.vx *= 0.75;
  hunter.vy *= 0.75;

  if (prey.isLocal || prey.id === "bot-rival") {
    respawnPlayer(prey, 0);
  } else if (hunter.isLocal && state.connected) {
    publish(`${state.baseTopic}/jogadores/${prey.id}/comando`, {
      type: "eaten",
      source: state.id,
      target: prey.id,
      by: hunter.name,
      t: Date.now()
    }, { qos: 1 });
    respawnPlayer(prey, 0);
  }

  if (hunter.isLocal || prey.isLocal) {
    addLog(`${hunter.name} engoliu ${prey.name}`);
    publishLocalState();
  }
}

function resolvePlayerEating() {
  const players = Array.from(state.players.values());
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      const a = players[i];
      const b = players[j];
      const pairIsRelevantHere = a.isLocal || b.isLocal || a.id === "bot-rival" || b.id === "bot-rival";
      if (!pairIsRelevantHere) continue;

      if (canEatPlayer(a, b)) {
        eatPlayer(a, b);
      } else if (canEatPlayer(b, a)) {
        eatPlayer(b, a);
      }
    }
  }
}

function updateWorld(dt) {
  const p = localPlayer();
  p.name = ui.playerName.value || "Jogador";
  movePlayer(p, dt);
  updateSimulator(dt);

  for (const player of state.players.values()) {
    collectEnergy(player);
    applyHazards(player);
  }
  resolvePlayerEating();

  for (const hazard of state.hazards) {
    hazard.x += Math.sin(Date.now() / 900 + hazard.drift) * 0.22;
    hazard.y += Math.cos(Date.now() / 1100 + hazard.drift) * 0.18;
  }

  for (const [id, player] of state.players) {
    if (!player.isLocal && id !== "bot-rival" && Date.now() - player.updatedAt > 9000) {
      state.players.delete(id);
    }
  }

  if (Date.now() - state.lastPublish > 240) {
    state.lastPublish = Date.now();
    publishLocalState();
  }

  if (state.connected && Date.now() - state.lastPing > 5000) {
    state.lastPing = Date.now();
    publish(state.topics.ping, { type: "ping", id: state.id, t: Date.now() }, { qos: 0 });
  }

  ui.score.textContent = p.score;
  ui.playersOnline.textContent = state.players.size;
}

function drawGrid() {
  ctx.fillStyle = "#0c0f14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.055)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawWorld() {
  drawGrid();

  for (const hazard of state.hazards) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 93, 115, 0.18)";
    ctx.strokeStyle = "rgba(255, 93, 115, 0.72)";
    ctx.lineWidth = 2;
    ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  for (const item of state.energy) {
    const pulse = Math.sin(Date.now() / 260 + item.phase) * 2;
    ctx.beginPath();
    ctx.fillStyle = "#ffd166";
    ctx.shadowColor = "#ffd166";
    ctx.shadowBlur = 14;
    ctx.arc(item.x, item.y, item.r + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  for (const player of state.players.values()) {
    const radius = playerRadius(player);
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 18;
    ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#f4f6fb";
    ctx.font = "700 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(player.name, player.x, player.y - radius - 10);
    ctx.fillStyle = "rgba(244,246,251,0.72)";
    ctx.font = "700 12px system-ui";
    ctx.fillText(`${player.score} pts`, player.x, player.y + radius + 18);
  }
}

let previousTime = performance.now();
function loop(now) {
  const dt = Math.min(0.032, (now - previousTime) / 1000);
  previousTime = now;
  updateWorld(dt);
  drawWorld();
  requestAnimationFrame(loop);
}

function resetGame() {
  const name = ui.playerName.value;
  state.players.clear();
  state.players.set(state.id, playerTemplate(state.id, name, true));
  seedWorld();
  addLog("partida reiniciada");
}

function bindEvents() {
  ui.playerName.value = `Jogador-${state.id.slice(0, 3)}`;
  ui.connectBtn.addEventListener("click", connectMqtt);
  ui.localBtn.addEventListener("click", enableLocalMode);
  ui.simulateBtn.addEventListener("click", () => {
    state.simulator = !state.simulator;
    ui.simulateBtn.textContent = state.simulator ? "Parar rival" : "Simular rival";
    addLog(state.simulator ? "rival local entrou" : "rival local saiu");
  });
  ui.resetBtn.addEventListener("click", resetGame);
  ui.deviceBtn.addEventListener("click", () => {
    const topic = state.mode === "mqtt"
      ? `${state.baseTopic}/jogadores/esp32pad/comando`
      : "local";
    publish(topic, {
      type: "cmd",
      source: state.id,
      target: "esp32pad",
      action: "blink",
      dx: 0,
      dy: 0,
      t: Date.now()
    }, { qos: 1 });
    addLog("comando enviado ao ESP32");
  });
  ui.pingBtn.addEventListener("click", () => {
    publish(state.topics.ping, { type: "ping", id: state.id, t: Date.now() }, { qos: 0 });
    addLog("ping MQTT enviado");
  });

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"].includes(event.code)) {
      event.preventDefault();
      state.keys.add(event.code);
      publish(state.topics.cmd, {
        type: "cmd",
        source: state.id,
        target: state.id,
        dx: Number(state.keys.has("ArrowRight") || state.keys.has("KeyD")) - Number(state.keys.has("ArrowLeft") || state.keys.has("KeyA")),
        dy: Number(state.keys.has("ArrowDown") || state.keys.has("KeyS")) - Number(state.keys.has("ArrowUp") || state.keys.has("KeyW")),
        t: Date.now()
      }, { qos: 1 });
    }
  });

  window.addEventListener("keyup", (event) => state.keys.delete(event.code));
  window.addEventListener("beforeunload", () => {
    if (state.connected) publishPresence("offline");
  });
}

bindEvents();
seedWorld();
resetGame();
syncTopicLabels();
requestAnimationFrame(loop);
