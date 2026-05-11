import { resourceOrder } from "../data/resources.js";

export const gameState = {
  version: "0.1.0",
  resources: Object.fromEntries(resourceOrder.map((resourceId) => [resourceId, 0]))
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

export function subscribeToState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyStateChanged() {
  listeners.forEach((listener) => listener(gameState));
}
