import { resourceOrder } from "../data/resources.js";
import { firstMissionId } from "../data/missions.js";

export const SAVE_VERSION = "0.2.0";

export const gameState = createInitialGameState();

const listeners = new Set();

export function createInitialGameState() {
  return {
    version: SAVE_VERSION,
    resources: Object.fromEntries(resourceOrder.map((resourceId) => [resourceId, 0])),
    buildings: [],
    nexus: {
      level: 1,
      memoryFragments: []
    },
    progression: {
      nexusLevel: 1,
      blueprints: {
        basicAssembler: "LOCKED"
      }
    },
    missions: {
      activeMissionId: firstMissionId,
      completedMissionIds: [],
      deliveryProgress: {}
    },
    eva: {
      notifications: [],
      emittedEventIds: []
    }
  };
}

export function replaceGameState(loadedState) {
  const merged = deepMerge(createInitialGameState(), sanitizeLoadedState(loadedState));
  merged.version = SAVE_VERSION;

  Object.keys(gameState).forEach((key) => delete gameState[key]);
  Object.assign(gameState, merged);

  notifyStateChanged();
}

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

function sanitizeLoadedState(loadedState) {
  if (!loadedState || typeof loadedState !== "object") return {};
  return JSON.parse(JSON.stringify(loadedState));
}

function deepMerge(target, source) {
  Object.entries(source ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      target[key] = value;
      return;
    }

    if (value && typeof value === "object") {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], value);
      return;
    }

    target[key] = value;
  });

  return target;
}
