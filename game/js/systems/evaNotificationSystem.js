import { gameState, notifyStateChanged } from "../core/gameState.js";
import { evaMessages } from "../data/evaMessages.js";
import { evaRuntimeCategories, evaRuntimeLines } from "../data/evaRuntimeLines.js";

const MAX_NOTIFICATIONS = 8;
const MIN_RUNTIME_INTERVAL = 20;

let runtimeClock = 0;
let runtimeCursor = {};

export function initEVANotificationSystem() {
  normalizeEVAState();
  emitEVAEvent("gameStart", "gameStart");
}

export function updateEVANotifications(deltaTime = 0) {
  normalizeEVAState();

  if (hasAnyResource()) emitEVAEvent("firstResource", "firstResource");
  if (hasBuilding("basicMiner")) emitEVAEvent("firstMiner", "firstMiner");
  if (hasBuilding("basicProcessor")) emitEVAEvent("firstProcessor", "firstProcessor");
  if (hasBuilding("basicConveyor")) emitEVAEvent("firstConveyor", "firstConveyor");

  runtimeClock += deltaTime;

  if (runtimeClock >= 1) {
    runtimeClock = 0;
    tickCooldowns();
    processRuntimePresence();
  }
}

export function emitEVAEvent(eventId, messageId) {
  normalizeEVAState();

  if (gameState.eva.emittedEventIds.includes(eventId)) return false;

  const message = evaMessages[messageId];
  if (!message) return false;

  gameState.eva.emittedEventIds.push(eventId);

  pushNotification({
    id: `${eventId}_${Date.now()}`,
    text: message.text,
    timestamp: Date.now()
  });

  return true;
}

export function getLatestEVANotification() {
  normalizeEVAState();
  return gameState.eva.notifications[0] ?? null;
}

function processRuntimePresence() {
  const now = Date.now();

  if (now - (gameState.eva.lastRuntimeLineAt ?? 0) < MIN_RUNTIME_INTERVAL * 1000) {
    return;
  }

  if (hasMachineStatus("inputShortage")) {
    tryRuntimeCategory("missingInput");
    return;
  }

  if (!hasWorkingMachine() && hasAnyBuilding()) {
    tryRuntimeCategory("idle");
  }
}

function tryRuntimeCategory(category) {
  if ((gameState.eva.runtimeCooldowns?.[category] ?? 0) > 0) {
    return false;
  }

  const line = getRuntimeLine(category);
  if (!line) return false;

  gameState.eva.runtimeCooldowns[category] = evaRuntimeCategories[category]?.cooldown ?? 60;
  gameState.eva.lastRuntimeLineAt = Date.now();

  pushNotification({
    id: `${line.id}_${Date.now()}`,
    text: line.text,
    timestamp: Date.now(),
    runtime: true
  });

  return true;
}

function getRuntimeLine(category) {
  const lines = evaRuntimeLines?.[category];
  if (!Array.isArray(lines) || lines.length === 0) return null;

  const cursor = runtimeCursor[category] ?? 0;
  runtimeCursor[category] = cursor + 1;

  return lines[cursor % lines.length];
}

function pushNotification(notification) {
  gameState.eva.notifications.unshift(notification);
  gameState.eva.notifications = gameState.eva.notifications.slice(0, MAX_NOTIFICATIONS);

  notifyStateChanged();
}

function tickCooldowns() {
  Object.keys(gameState.eva.runtimeCooldowns ?? {}).forEach((category) => {
    gameState.eva.runtimeCooldowns[category] = Math.max(
      0,
      (gameState.eva.runtimeCooldowns[category] ?? 0) - 1
    );
  });
}

function normalizeEVAState() {
  gameState.eva ??= {};
  gameState.eva.notifications ??= [];
  gameState.eva.emittedEventIds ??= [];
  gameState.eva.runtimeCooldowns ??= {};
  gameState.eva.lastRuntimeLineAt ??= 0;
}

function hasAnyResource() {
  return Object.values(gameState.resources ?? {}).some((amount) => amount > 0);
}

function hasAnyBuilding() {
  return (gameState.buildings ?? []).length > 0;
}

function hasBuilding(definitionId) {
  return (gameState.buildings ?? []).some((building) => building.definitionId === definitionId);
}

function hasMachineStatus(status) {
  return (gameState.buildings ?? []).some((building) => building.machine?.status === status);
}

function hasWorkingMachine() {
  return (gameState.buildings ?? []).some((building) => building.machine?.status === "working");
}
