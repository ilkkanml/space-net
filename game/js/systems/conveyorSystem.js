import { gameState, notifyStateChanged } from "../core/gameState.js";
import { recipes, getRecipeInputs } from "../data/recipes.js";
import { resources } from "../data/resources.js";
import { addToStorage, canStorageAccept, removeFromStorage } from "./storageSystem.js";

const CELL_SIZE = 2;

const directionVectors = {
  east: { x: 1, z: 0 },
  west: { x: -1, z: 0 },
  north: { x: 0, z: -1 },
  south: { x: 0, z: 1 }
};

export function updateConveyors(deltaTime) {
  let changed = false;

  gameState.buildings.forEach((building) => {
    if (!building.conveyor) return;

    building.conveyor.transferTimer += deltaTime;

    if (building.conveyor.transferTimer < building.conveyor.transferInterval) return;

    building.conveyor.transferTimer = 0;

    if (tryMoveConveyor(building)) {
      changed = true;
    }
  });

  if (changed) notifyStateChanged();
}

export function getConveyorDisplay(conveyor) {
  if (!conveyor) return null;

  return {
    direction: conveyor.direction,
    carriedItem: conveyor.carriedItem
      ? `${resources[conveyor.carriedItem.resourceId]?.shortName ?? conveyor.carriedItem.resourceId} x${conveyor.carriedItem.amount}`
      : "Empty",
    transfer: `${conveyor.transferInterval}s / item`
  };
}

function tryMoveConveyor(conveyorBuilding) {
  const conveyor = conveyorBuilding.conveyor;
  const vector = directionVectors[conveyor.direction] ?? directionVectors.east;

  const sourcePoint = {
    x: conveyorBuilding.position.x - vector.x * CELL_SIZE,
    z: conveyorBuilding.position.z - vector.z * CELL_SIZE
  };

  const targetPoint = {
    x: conveyorBuilding.position.x + vector.x * CELL_SIZE,
    z: conveyorBuilding.position.z + vector.z * CELL_SIZE
  };

  const source = findBuildingAtPoint(sourcePoint, conveyorBuilding.id);
  const target = findBuildingAtPoint(targetPoint, conveyorBuilding.id);

  if (conveyor.carriedItem) {
    if (target && pushItemToTarget(target, conveyor.carriedItem.resourceId, conveyor.carriedItem.amount)) {
      conveyor.carriedItem = null;
      return true;
    }

    return false;
  }

  if (!source) return false;

  const item = peekTransferableItem(source, target);
  if (!item) return false;

  if (!pullItemFromSource(source, item.resourceId, item.amount)) return false;

  conveyor.carriedItem = item;
  return true;
}

function findBuildingAtPoint(point, excludeId) {
  const cellKey = worldToCellKey(point);

  return gameState.buildings.find((building) => {
    if (building.id === excludeId) return false;
    const cells = getBuildingCells(building);
    return cells.includes(cellKey);
  }) ?? null;
}

function peekTransferableItem(source, target) {
  const sourceItems = getSourceItems(source);
  if (sourceItems.length === 0) return null;

  if (!target) return null;

  return sourceItems.find((item) => canTargetAccept(target, item.resourceId, item.amount)) ?? null;
}

function getSourceItems(source) {
  if (source.conveyor?.carriedItem) {
    return [source.conveyor.carriedItem];
  }

  if (source.machine) {
    return Object.entries(source.machine.outputBuffer)
      .filter(([, amount]) => amount > 0)
      .map(([resourceId]) => ({ resourceId, amount: 1 }));
  }

  if (source.storage) {
    return Object.entries(source.storage.items)
      .filter(([, amount]) => amount > 0)
      .map(([resourceId]) => ({ resourceId, amount: 1 }));
  }

  return [];
}

function pullItemFromSource(source, resourceId, amount) {
  if (source.conveyor?.carriedItem?.resourceId === resourceId) {
    source.conveyor.carriedItem = null;
    return true;
  }

  if (source.machine && (source.machine.outputBuffer[resourceId] ?? 0) >= amount) {
    source.machine.outputBuffer[resourceId] -= amount;
    return true;
  }

  if (source.storage) {
    return removeFromStorage(source.storage, resourceId, amount);
  }

  return false;
}

function canTargetAccept(target, resourceId, amount) {
  if (target.conveyor) {
    return !target.conveyor.carriedItem;
  }

  if (target.storage) {
    return canStorageAccept(target.storage, amount);
  }

  if (target.machine?.kind === "processor") {
    const recipe = recipes[target.machine.recipeId];
    if (!recipe) return false;

    const allowedInput = getRecipeInputs(recipe).some((input) => input.resourceId === resourceId);
    if (!allowedInput) return false;

    const currentInputTotal = Object.values(target.machine.inputBuffer).reduce((sum, value) => sum + value, 0);
    return currentInputTotal + amount <= target.machine.inputCapacity;
  }

  return false;
}

function pushItemToTarget(target, resourceId, amount) {
  if (!canTargetAccept(target, resourceId, amount)) return false;

  if (target.conveyor) {
    target.conveyor.carriedItem = { resourceId, amount };
    return true;
  }

  if (target.storage) {
    return addToStorage(target.storage, resourceId, amount);
  }

  if (target.machine?.kind === "processor") {
    target.machine.inputBuffer[resourceId] = (target.machine.inputBuffer[resourceId] ?? 0) + amount;
    return true;
  }

  return false;
}

function worldToCellKey(position) {
  const x = Math.round(position.x / CELL_SIZE);
  const z = Math.round(position.z / CELL_SIZE);
  return `${x},${z}`;
}

function getBuildingCells(building) {
  const center = {
    x: Math.round(building.position.x / CELL_SIZE),
    z: Math.round(building.position.z / CELL_SIZE)
  };

  const footprintSize = building.footprintSize ?? 2;

  if (footprintSize === 1) {
    return [`${center.x},${center.z}`];
  }

  if (footprintSize === 2) {
    return [
      `${center.x},${center.z}`,
      `${center.x + 1},${center.z}`,
      `${center.x},${center.z + 1}`,
      `${center.x + 1},${center.z + 1}`
    ];
  }

  if (footprintSize === 3) {
    const cells = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        cells.push(`${center.x + dx},${center.z + dz}`);
      }
    }

    return cells;
  }

  return [`${center.x},${center.z}`];
}
