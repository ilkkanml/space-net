import { gameState, notifyStateChanged } from "../core/gameState.js";
import { evaMessages } from "../data/evaMessages.js";

const MAX_NOTIFICATIONS = 8;

export function initEVANotificationSystem() {
  emitEVAEvent("gameStart", "gameStart");
}

export function updateEVANotifications() {
  if (hasAnyResource()) {
    emitEVAEvent("firstResource", "firstResource");
  }

  if (gameState.missions.completedMissionIds.includes("stabilizeNexus")) {
    emitEVAEvent("nexusStabilized", "nexusStabilized");
    emitEVAEvent("deliveryComplete_rawMaterials", "deliveryComplete");
  }

  if (hasBuilding("basicMiner")) {
    emitEVAEvent("firstMiner", "firstMiner");
  }

  if (hasBuilding("basicProcessor")) {
    emitEVAEvent("firstProcessor", "firstProcessor");
  }

  if (hasBuilding("basicConveyor")) {
    emitEVAEvent("firstConveyor", "firstConveyor");
  }

  if (hasMachineStatus("inputShortage")) {
    emitEVAEvent("inputShortage", "inputShortage");
  }

  if (hasMachineStatus("outputFull")) {
    emitEVAEvent("outputBlocked", "outputBlocked");
  }

  if (gameState.missions.completedMissionIds.includes("deliverBasicMaterials")) {
    emitEVAEvent("deliveryComplete_basicMaterials", "deliveryComplete");
  }

  if (gameState.nexus.memoryFragments.includes("memoryFragment01")) {
    emitEVAEvent("memoryFragment01", "memoryFragment01");
  }
}

export function emitEVAEvent(eventId, messageId) {
  if (gameState.eva.emittedEventIds.includes(eventId)) return false;

  const message = evaMessages[messageId];
  if (!message) return false;

  gameState.eva.emittedEventIds.push(eventId);

  gameState.eva.notifications.unshift({
    id: `${eventId}_${Date.now()}`,
    eventId,
    messageId,
    text: message.text,
    timestamp: Date.now()
  });

  gameState.eva.notifications = gameState.eva.notifications.slice(0, MAX_NOTIFICATIONS);
  notifyStateChanged();
  return true;
}

export function getLatestEVANotification() {
  return gameState.eva.notifications[0] ?? null;
}

function hasAnyResource() {
  return Object.values(gameState.resources).some((amount) => amount > 0);
}

function hasBuilding(definitionId) {
  return gameState.buildings.some((building) => building.definitionId === definitionId);
}

function hasMachineStatus(status) {
  return gameState.buildings.some((building) => {
    return building.machine?.status === status;
  });
}
