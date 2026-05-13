import { gameState, notifyStateChanged } from "../core/gameState.js";
import { evaMessages } from "../data/evaMessages.js";
import { evaRuntimeCategories, evaRuntimeLines } from "../data/evaRuntimeLines.js";

const MAX_NOTIFICATIONS = 8;
const MAX_RUNTIME_QUEUE = 4;
const MIN_SECONDS_BETWEEN_RUNTIME_LINES = 18;

let runtimeCursor = {};
let runtimeTickAccumulator = 0;

export function initEVANotificationSystem() {
  normalizeEVAState();
  emitEVAEvent("gameStart", "gameStart");
}

export function updateEVANotifications(deltaTime = 0) {
  normalizeEVAState();

  if (hasAnyResource()) emitEVAEvent("firstResource", "firstResource");

  if (gameState.missions.completedMissionIds.includes("stabilizeNexus")) {
    emitEVAEvent("nexusStabilized", "nexusStabilized");
    emitEVAEvent("deliveryComplete_rawMaterials", "deliveryComplete");
  }

  if (hasBuilding("basicMiner")) emitEVAEvent("firstMiner", "firstMiner");
  if (hasBuilding("basicProcessor")) emitEVAEvent("firstProcessor", "firstProcessor");
  if (hasBuilding("basicConveyor")) emitEVAEvent("firstConveyor", "firstConveyor");

  if (hasMachineStatus("inputShortage")) emitEVAEvent("inputShortage", "inputShortage");
  if (hasMachineStatus("outputFull")) emitEVAEvent("outputBlocked", "outputBlocked");

  if (gameState.missions.completedMissionIds.includes("deliverBasicMaterials")) {
    emitEVAEvent("deliveryComplete_basicMaterials", "deliveryComplete");
  }

  if (gameState.nexus.memoryFragments.includes("memoryFragment01")) {
    emitEVAEvent("memoryFragment01", "memoryFragment01");
  }

  updateEVARuntime(deltaTime);
}

export function emitEVAEvent(eventId, messageId) {
  normalizeEVAState();

  if (gameState.eva.emittedEventIds.includes(eventId)) return false;

  const message = evaMessages[messageId];
  if (!message) return false;

  gameState.eva.emittedEventIds.push(eventId);

  pushEVANotification({
    id: `${eventId}_${Date.now()}`,
    eventId,
    messageId,
    text: message.text,
    timestamp: Date.now()
  });

  return true;
}

export function getLatestEVANotification() {
  normalizeEVAState();
  return gameState.eva.notifications[0] ?? null;
}

function updateEVARuntime(deltaTime) {
  const safeDelta = Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : 0;

  runtimeTickAccumulator += safeDelta;

  if (runtimeTickAccumulator < 1) return;
  runtimeTickAccumulator = 0;

  tickRuntimeCooldowns();

  if (hasMachineStatus("inputShortage")) {
    queueRuntimeLine("missingInput");
  }

  if (!hasWorkingMachine() && hasAnyBuilding()) {
    queueRuntimeLine("idle");
  }

  flushRuntimeQueue();
}

function queueRuntimeLine(category) {
  const config = evaRuntimeCategories[category];
  const lines = evaRuntimeLines[category];

  if (!config || !Array.isArray(lines) || lines.length === 0) return false;
  if ((gameState.eva.runtimeCooldowns[category] ?? 0) > 0) return false;

  const now = Date.now();

  if (now - (gameState.eva.lastRuntimeLineAt ?? 0) < config.minElapsed * 1000) {
    return false;
  }

  if (gameState.eva.runtimeQueue.some((entry) => entry.category === category)) {
    return false;
  }

  gameState.eva.runtimeQueue.push({
    category,
    queuedAt: now
  });

  gameState.eva.runtimeQueue = gameState.eva.runtimeQueue.slice(-MAX_RUNTIME_QUEUE);
  gameState.eva.runtimeCooldowns[category] = config.cooldown;

  return true;
}

function flushRuntimeQueue() {
  if (gameState.eva.runtimeQueue.length === 0) return false;

  const now = Date.now();

  if (now - (gameState.eva.lastRuntimeLineAt ?? 0) < MIN_SECONDS_BETWEEN_RUNTIME_LINES * 1000) {
    return false;
  }

  const next = gameState.eva.runtimeQueue.shift();
  const line = getNextRuntimeLine(next.category);

  if (!line) return false;

  pushEVANotification({
    id: `${line.id}_${Date.now()}`,
    eventId: line.id,
    messageId: line.id,
    text: line.text,
    timestamp: now,
    runtime: true,
    category: next.category
  });

  gameState.eva.lastRuntimeLineAt = now;

  return true;
}

function getNextRuntimeLine(category) {
  const lines = evaRuntimeLines[category];
  if (!Array.isArray(lines) || lines.length === 0) return null;

  const cursor = runtimeCursor[category] ?? 0;
  const line = lines[cursor % lines.length];
  runtimeCursor[category] = cursor + 1;

  return line;
}

function pushEVANotification(notification) {
  gameState.eva.notifications.unshift(notification);
  gameState.eva.notifications = gameState.eva.notifications.slice(0, MAX_NOTIFICATIONS);

  notifyStateChanged();
}

function tickRuntimeCooldowns() {
  Object.keys(gameState.eva.runtimeCooldowns).forEach((category) => {
    const value = gameState.eva.runtimeCooldowns[category];

    if (!Number.isFinite(value) || value <= 0) {
      delete gameState.eva.runtimeCooldowns[category];
      return;
    }

    gameState.eva.runtimeCooldowns[category] = Math.max(0, value - 1);
  });
}

function normalizeEVAState() {
  gameState.eva ??= {};
  gameState.eva.notifications = Array.isArray(gameState.eva.notifications) ? gameState.eva.notifications : [];
  gameState.eva.emittedEventIds = Array.isArray(gameState.eva.emittedEventIds) ? gameState.eva.emittedEventIds : [];
  gameState.eva.runtimeCooldowns ??= {};
  gameState.eva.runtimeQueue = Array.isArray(gameState.eva.runtimeQueue) ? gameState.eva.runtimeQueue : [];
  gameState.eva.lastRuntimeLineAt ??= 0;
}

function hasAnyResource() {
  return Object.values(gameState.resources).some((amount) => amount > 0);
}

function hasAnyBuilding() {
  return gameState.buildings.length > 0;
}

function hasBuilding(definitionId) {
  return gameState.buildings.some((building) => building.definitionId === definitionId);
}

function hasMachineStatus(status) {
  return gameState.buildings.some((building) => building.machine?.status === status);
}

function hasWorkingMachine() {
  return gameState.buildings.some((building) => building.machine?.status === "working");
}
