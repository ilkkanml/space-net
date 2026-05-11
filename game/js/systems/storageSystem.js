import { addResource, notifyStateChanged } from "../core/gameState.js";
import { resources } from "../data/resources.js";

export function getStorageTotal(storage) {
  if (!storage) return 0;
  return Object.values(storage.items).reduce((sum, amount) => sum + amount, 0);
}

export function canStorageAccept(storage, amount = 1) {
  return getStorageTotal(storage) + amount <= storage.capacity;
}

export function addToStorage(storage, resourceId, amount = 1) {
  if (!canStorageAccept(storage, amount)) return false;
  storage.items[resourceId] = (storage.items[resourceId] ?? 0) + amount;
  return true;
}

export function removeFromStorage(storage, resourceId, amount = 1) {
  if ((storage.items[resourceId] ?? 0) < amount) return false;
  storage.items[resourceId] -= amount;
  return true;
}

export function collectStorageItems(building) {
  if (!building?.storage) return false;

  const entries = Object.entries(building.storage.items).filter(([, amount]) => amount > 0);
  if (entries.length === 0) return false;

  entries.forEach(([resourceId, amount]) => {
    addResource(resourceId, amount);
    building.storage.items[resourceId] = 0;
  });

  notifyStateChanged();
  return true;
}

export function getStorageDisplay(storage) {
  if (!storage) return null;

  const total = getStorageTotal(storage);
  const items = Object.entries(storage.items)
    .filter(([, amount]) => amount > 0)
    .map(([resourceId, amount]) => `${amount} ${resources[resourceId]?.shortName ?? resourceId}`)
    .join(", ");

  return {
    capacity: `${total}/${storage.capacity}`,
    items: items || "Empty"
  };
}
