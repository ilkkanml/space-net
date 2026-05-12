import { gameState, addResource, removeResource, notifyStateChanged } from "../core/gameState.js";
import { recipes, getRecipeInputs } from "../data/recipes.js";
import { resources } from "../data/resources.js";

const MACHINE_STATUS = {
  WORKING: "working",
  IDLE: "idle",
  INPUT_SHORTAGE: "inputShortage",
  OUTPUT_FULL: "outputFull",
  NO_RECIPE: "noRecipe"
};

const MAX_PRODUCTION_STEPS_PER_TICK = 4;
const MAX_BATCH_LOADS_PER_CLICK = 100;

let statusCallback = null;

export function initProductionSystem({ onStatus }) {
  statusCallback = onStatus;
}

export function updateProduction(deltaTime) {
  const safeDelta = Number.isFinite(deltaTime) && deltaTime > 0 ? deltaTime : 0;

  gameState.buildings.forEach((building) => {
    if (!building?.machine) return;

    normalizeMachineState(building.machine);

    if (building.machine.kind === "miner") {
      updateMiner(building, safeDelta);
    }

    if (building.machine.kind === "processor") {
      updateProcessor(building, safeDelta);
    }
  });
}

export function createMachineState(definition, extra = {}) {
  return {
    kind: definition.machineKind,
    status: MACHINE_STATUS.IDLE,
    recipeId: null,
    inputBuffer: {},
    outputBuffer: {},
    progress: 0,
    duration: definition.duration ?? 3,
    inputCapacity: definition.inputCapacity ?? 20,
    outputCapacity: definition.outputCapacity ?? 20,
    outputResourceId: extra.outputResourceId ?? null
  };
}

export function setRecipe(building, recipeId) {
  if (!building?.machine || building.machine.kind !== "processor") return;
  if (!recipes[recipeId]) return;

  normalizeMachineState(building.machine);

  building.machine.recipeId = recipeId;
  building.machine.progress = 0;
  building.machine.duration = recipes[recipeId]?.duration ?? building.machine.duration;
  notifyStateChanged();
}

export function loadRecipeInputFromInventory(building) {
  if (!building?.machine || building.machine.kind !== "processor") return false;

  normalizeMachineState(building.machine);

  const recipe = recipes[building.machine.recipeId];
  if (!recipe) {
    statusCallback?.("No recipe selected");
    return false;
  }

  let loadedBatches = 0;

  while (
    loadedBatches < MAX_BATCH_LOADS_PER_CLICK &&
    canLoadOneRecipeBatch(building.machine, recipe) &&
    hasInventoryForRecipe(recipe)
  ) {
    getRecipeInputs(recipe).forEach(({ resourceId, amount }) => {
      if (amount <= 0) return;
      removeResource(resourceId, amount);
      building.machine.inputBuffer[resourceId] = (building.machine.inputBuffer[resourceId] ?? 0) + amount;
    });

    loadedBatches += 1;
  }

  if (loadedBatches === 0) {
    if (!canLoadOneRecipeBatch(building.machine, recipe)) {
      statusCallback?.("Input buffer full");
    } else {
      statusCallback?.("Not enough inventory resources");
    }
    return false;
  }

  statusCallback?.(`Loaded ${loadedBatches} recipe batch${loadedBatches > 1 ? "es" : ""}`);
  notifyStateChanged();
  return true;
}

export function collectMachineOutput(building) {
  if (!building?.machine) return false;

  normalizeMachineState(building.machine);

  const outputEntries = Object.entries(building.machine.outputBuffer).filter(([, amount]) => amount > 0);
  if (outputEntries.length === 0) {
    statusCallback?.("Output buffer empty");
    return false;
  }

  outputEntries.forEach(([resourceId, amount]) => {
    addResource(resourceId, amount);
    building.machine.outputBuffer[resourceId] = 0;
  });

  notifyStateChanged();
  return true;
}

export function getMachineDisplay(machine) {
  if (!machine) return "";

  normalizeMachineState(machine);

  const input = formatBuffer(machine.inputBuffer);
  const output = formatBuffer(machine.outputBuffer);
  const progressPercent = Math.round((machine.progress / machine.duration) * 100);

  return {
    status: machine.status,
    recipe: machine.recipeId ? recipes[machine.recipeId]?.name ?? machine.recipeId : "None",
    progress: `${Math.max(0, Math.min(100, progressPercent))}%`,
    input: input || "Empty",
    output: output || "Empty"
  };
}

function updateMiner(building, deltaTime) {
  const machine = building.machine;
  const resourceId = machine.outputResourceId;

  if (!resourceId) {
    machine.status = MACHINE_STATUS.IDLE;
    machine.progress = 0;
    return;
  }

  if (getBufferTotal(machine.outputBuffer) >= machine.outputCapacity) {
    machine.status = MACHINE_STATUS.OUTPUT_FULL;
    return;
  }

  machine.status = MACHINE_STATUS.WORKING;
  machine.progress += deltaTime;

  let steps = 0;
  while (machine.progress >= machine.duration && steps < MAX_PRODUCTION_STEPS_PER_TICK) {
    machine.progress -= machine.duration;
    steps += 1;

    if (getBufferTotal(machine.outputBuffer) >= machine.outputCapacity) {
      machine.status = MACHINE_STATUS.OUTPUT_FULL;
      machine.progress = 0;
      break;
    }

    machine.outputBuffer[resourceId] = (machine.outputBuffer[resourceId] ?? 0) + 1;
  }

  if (steps >= MAX_PRODUCTION_STEPS_PER_TICK) {
    machine.progress = 0;
  }
}

function updateProcessor(building, deltaTime) {
  const machine = building.machine;
  const recipe = recipes[machine.recipeId];

  if (!recipe) {
    machine.status = MACHINE_STATUS.NO_RECIPE;
    machine.progress = 0;
    return;
  }

  if (!hasRecipeInput(machine, recipe)) {
    machine.status = MACHINE_STATUS.INPUT_SHORTAGE;
    machine.progress = 0;
    return;
  }

  if (!hasOutputSpace(machine, recipe)) {
    machine.status = MACHINE_STATUS.OUTPUT_FULL;
    return;
  }

  machine.status = MACHINE_STATUS.WORKING;
  machine.progress += deltaTime;

  let steps = 0;
  while (machine.progress >= recipe.duration && steps < MAX_PRODUCTION_STEPS_PER_TICK) {
    if (!hasRecipeInput(machine, recipe) || !hasOutputSpace(machine, recipe)) {
      machine.progress = 0;
      break;
    }

    machine.progress -= recipe.duration;
    steps += 1;

    getRecipeInputs(recipe).forEach(({ resourceId, amount }) => {
      machine.inputBuffer[resourceId] = Math.max(0, (machine.inputBuffer[resourceId] ?? 0) - amount);
    });

    Object.entries(recipe.output).forEach(([resourceId, amount]) => {
      if (amount <= 0) return;
      machine.outputBuffer[resourceId] = (machine.outputBuffer[resourceId] ?? 0) + amount;
    });
  }

  if (steps >= MAX_PRODUCTION_STEPS_PER_TICK) {
    machine.progress = 0;
  }
}

function hasRecipeInput(machine, recipe) {
  return getRecipeInputs(recipe).every(({ resourceId, amount }) => {
    return (machine.inputBuffer[resourceId] ?? 0) >= amount;
  });
}

function hasOutputSpace(machine, recipe) {
  const currentTotal = getBufferTotal(machine.outputBuffer);
  const outputTotal = Object.values(recipe.output ?? {}).reduce((sum, amount) => sum + Math.max(0, amount), 0);
  return currentTotal + outputTotal <= machine.outputCapacity;
}

function canLoadOneRecipeBatch(machine, recipe) {
  const currentInputTotal = getBufferTotal(machine.inputBuffer);
  const recipeInputTotal = getRecipeInputs(recipe).reduce((sum, input) => sum + Math.max(0, input.amount), 0);
  return currentInputTotal + recipeInputTotal <= machine.inputCapacity;
}

function hasInventoryForRecipe(recipe) {
  return getRecipeInputs(recipe).every(({ resourceId, amount }) => {
    return gameState.resources[resourceId] >= amount;
  });
}

function getBufferTotal(buffer) {
  normalizeBuffer(buffer);
  return Object.values(buffer).reduce((sum, amount) => sum + amount, 0);
}

function formatBuffer(buffer) {
  normalizeBuffer(buffer);
  return Object.entries(buffer)
    .filter(([, amount]) => amount > 0)
    .map(([resourceId, amount]) => `${amount} ${resources[resourceId]?.shortName ?? resourceId}`)
    .join(", ");
}

function normalizeMachineState(machine) {
  machine.status ??= MACHINE_STATUS.IDLE;
  machine.inputBuffer ??= {};
  machine.outputBuffer ??= {};
  normalizeBuffer(machine.inputBuffer);
  normalizeBuffer(machine.outputBuffer);
  machine.progress = Number.isFinite(machine.progress) && machine.progress >= 0 ? machine.progress : 0;
  machine.duration = Number.isFinite(machine.duration) && machine.duration > 0 ? machine.duration : 1;
  machine.inputCapacity = Number.isFinite(machine.inputCapacity) && machine.inputCapacity > 0 ? machine.inputCapacity : 20;
  machine.outputCapacity = Number.isFinite(machine.outputCapacity) && machine.outputCapacity > 0 ? machine.outputCapacity : 20;
}

function normalizeBuffer(buffer) {
  Object.keys(buffer ?? {}).forEach((resourceId) => {
    const amount = buffer[resourceId];
    if (!Number.isFinite(amount) || amount <= 0) {
      delete buffer[resourceId];
    }
  });
}
