import { resourceOrder } from "../data/resources.js";
import { firstMissionId } from "../data/missions.js";

export const gameState = {
  version: "0.1.0",
  resources: Object.fromEntries(resourceOrder.map((resourceId) => [resourceId, 0])),
  buildings: [],
  nexus: {
    level: 1,
    memoryFragments: []
  },
  missions: {
    activeMissionId: firstMissionId,
    completedMissionIds: [],
    deliveryProgress: {}
  }
};

const listeners = new Set();

export function getResource(resourceId) {
  return gameState.resources[resourceId] ?? 0;
}

export function addResource(resourceId, amount) {
  if (!Object.hasOwn(gameState.resources, resourceId)) {
    throw new Error(`Unknown resource: ${resourceId}`);
  }

  gameState.resources[resourceId] += amount;
  notifyStateChanged();
}

export function removeResource(resourceId, amount) {
  if (getResource(resourceId) < amount) return false;

  gameState.resources[resourceId] -= amount;
  notifyStateChanged();
  return true;
}

export function hasResource(resourceId, amount) {
  return getResource(resourceId) >= amount;
}

export function canAfford(cost) {
  return Object.entries(cost).every(([resourceId, amount]) => hasResource(resourceId, amount));
}

export function spendCost(cost) {
  if (!canAfford(cost)) return false;

  Object.entries(cost).forEach(([resourceId, amount]) => {
    gameState.resources[resourceId] -= amount;
  });

  notifyStateChanged();
  return true;
}

export function addBuilding(building) {
  gameState.buildings.push(building);
  notifyStateChanged();
}

export function getBuildingById(buildingId) {
  return gameState.buildings.find((building) => building.id === buildingId) ?? null;
}

export function subscribeToState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyStateChanged() {
  listeners.forEach((listener) => listener(gameState));
}
