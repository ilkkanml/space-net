import { gameState } from "../core/gameState.js";
import { resources } from "../data/resources.js";
import { recipes, recipeOrder, getRecipeInputs } from "../data/recipes.js";
import {
  collectMachineOutput,
  getMachineDisplay,
  loadRecipeInputFromInventory,
  setRecipe
} from "../systems/productionSystem.js";
import { getStorageDisplay, collectStorageItems } from "../systems/storageSystem.js";
import { getConveyorDisplay } from "../systems/conveyorSystem.js";
import {
  canDeliverToNexusNow,
  contactNexus,
  deliverCurrentMissionToNexus,
  getNexusDisplay
} from "../systems/missionSystem.js";

const nameEl = document.querySelector("#selection-name");
const typeEl = document.querySelector("#selection-type");
const descriptionEl = document.querySelector("#selection-description");
const nexusEl = document.querySelector("#selection-nexus");
const machineEl = document.querySelector("#selection-machine");
const storageEl = document.querySelector("#selection-storage");
const conveyorEl = document.querySelector("#selection-conveyor");
const actionsEl = document.querySelector("#selection-actions");

let currentSelection = null;
let currentCollectAction = null;
let lastNexusCanDeliver = null;

export function updateSelectionPanel(selection, onCollectResource) {
  currentSelection = selection;
  currentCollectAction = onCollectResource;

  actionsEl.innerHTML = "";
  clearInfoPanels();
  lastNexusCanDeliver = null;

  if (!selection) {
    renderEmptySelection();
    return;
  }

  const data = getSelectionData(selection);
  if (!isSelectionStillValid(data)) {
    currentSelection = null;
    renderEmptySelection();
    return;
  }

  nameEl.textContent = data.name;
  typeEl.textContent = `${data.type} • ${data.size ?? "Object"}`;
  descriptionEl.textContent = data.description ?? "";

  if (data.id === "nexus_core_01") {
    contactNexus();
    renderNexusInfo();
    renderNexusActions();
  }

  if (data.collectible && data.resourceId) {
    const resource = resources[data.resourceId];
    addAction(`Collect +${data.collectionAmount} ${resource.name}`, () => {
      if (typeof currentCollectAction === "function") currentCollectAction();
    });
  }

  if (data.machine) {
    renderMachineInfo(data);
    renderMachineActions(data);
  }

  if (data.storage) {
    renderStorageInfo(data);
    renderStorageActions(data);
  }

  if (data.conveyor) {
    renderConveyorInfo(data);
  }
}

export function refreshSelectionPanel() {
  if (!currentSelection) return;

  const data = getSelectionData(currentSelection);
  if (!isSelectionStillValid(data)) {
    currentSelection = null;
    actionsEl.innerHTML = "";
    clearInfoPanels();
    renderEmptySelection();
    return;
  }

  if (data.id === "nexus_core_01") {
    renderNexusInfo();
    refreshNexusActionsIfNeeded();
  }

  if (data.machine) renderMachineInfo(data);
  if (data.storage) renderStorageInfo(data);
  if (data.conveyor) renderConveyorInfo(data);
}

function renderEmptySelection() {
  nameEl.textContent = "No machine selected";
  typeEl.textContent = "Click a machine or world object";
  descriptionEl.textContent = "";
}

function clearInfoPanels() {
  nexusEl.innerHTML = "";
  machineEl.innerHTML = "";
  storageEl.innerHTML = "";
  conveyorEl.innerHTML = "";
  nexusEl.classList.add("hidden");
  machineEl.classList.add("hidden");
  storageEl.classList.add("hidden");
  conveyorEl.classList.add("hidden");
}

function getSelectionData(selection) {
  return selection.userData?.worldObject || selection.userData?.building || selection;
}

function isSelectionStillValid(data) {
  if (!data) return false;
  if (data.id === "nexus_core_01") return true;
  if (data.collectible) return true;
  if (!data.id || (!data.machine && !data.storage && !data.conveyor)) return true;
  return gameState.buildings.some((building) => building.id === data.id);
}

function renderNexusInfo() {
  const display = getNexusDisplay();
  nexusEl.classList.remove("hidden");

  nexusEl.innerHTML = `
    <div class="panel-section-title">NEXUS CORE</div>
    <div class="machine-row"><span>NEXUS Level</span><strong>${display.level}</strong></div>
    <div class="machine-row"><span>Memory</span><strong>${display.memory}</strong></div>
    <div class="machine-row"><span>Mission</span><strong>${display.activeMission}</strong></div>
  `;
}

function renderNexusActions() {
  lastNexusCanDeliver = canDeliverToNexusNow();

  if (lastNexusCanDeliver) {
    addAction("Deliver Current Mission Resources", () => {
      deliverCurrentMissionToNexus();
      renderNexusInfo();
      actionsEl.innerHTML = "";
      renderNexusActions();
    });
  }
}

function refreshNexusActionsIfNeeded() {
  const canDeliverNow = canDeliverToNexusNow();
  if (canDeliverNow === lastNexusCanDeliver) return;

  actionsEl.innerHTML = "";
  renderNexusActions();
}

function renderMachineInfo(data) {
  const machine = data.machine;
  const display = getMachineDisplay(machine);
  const recipe = recipes[machine.recipeId];
  const progressValue = getProgressValue(machine);

  machineEl.classList.remove("hidden");

  machineEl.innerHTML = `
    <div class="machine-detail-header">
      <div>
        <div class="panel-section-title">MACHINE DETAIL</div>
        <div class="machine-detail-name">${data.name}</div>
      </div>
      <span class="machine-status-pill ${getStatusClass(display.status)}">${formatStatus(display.status)}</span>
    </div>

    <div class="machine-detail-block">
      <div class="machine-row"><span>Recipe</span><strong>${display.recipe}</strong></div>
      <div class="machine-row"><span>Power</span><strong>Not active in v0.2</strong></div>
    </div>

    <div class="machine-detail-block">
      <div class="machine-row"><span>Progress</span><strong>${display.progress}</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width: ${progressValue}%"></div></div>
    </div>

    <div class="machine-detail-grid">
      <div class="machine-slot-group">
        <div class="panel-section-title">INPUTS</div>
        ${renderInputSlots(machine, recipe, display.input)}
      </div>
      <div class="machine-slot-group">
        <div class="panel-section-title">OUTPUTS</div>
        ${renderOutputSlots(machine, recipe, display.output)}
      </div>
    </div>
  `;
}

function renderMachineActions(data) {
  if (data.machine.kind === "processor") {
    addRecipeSelector(data);

    addAction("Load Input From Inventory", () => {
      if (!isSelectionStillValid(data)) return;
      loadRecipeInputFromInventory(data);
      renderMachineInfo(data);
    });
  }

  addAction("Collect Machine Output", () => {
    if (!isSelectionStillValid(data)) return;
    collectMachineOutput(data);
    renderMachineInfo(data);
  });
}

function addRecipeSelector(data) {
  const wrapper = document.createElement("div");
  wrapper.className = "recipe-selector-wrap";

  const label = document.createElement("label");
  label.className = "recipe-selector-label";
  label.textContent = "Recipe";

  const select = document.createElement("select");
  select.className = "recipe-selector";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Select recipe";
  select.append(emptyOption);

  recipeOrder.forEach((recipeId) => {
    const recipe = recipes[recipeId];
    if (!recipe) return;

    const option = document.createElement("option");
    option.value = recipeId;
    option.textContent = recipe.name;
    select.append(option);
  });

  select.value = data.machine.recipeId ?? "";

  select.addEventListener("change", () => {
    if (!select.value || !isSelectionStillValid(data)) return;
    setRecipe(data, select.value);
    renderMachineInfo(data);
  });

  wrapper.append(label, select);
  actionsEl.append(wrapper);
}

function renderInputSlots(machine, recipe, fallbackText) {
  if (!recipe) {
    return `<div class="machine-slot empty">${fallbackText}</div>`;
  }

  const inputs = getRecipeInputs(recipe);
  if (inputs.length === 0) {
    return `<div class="machine-slot empty">No input required</div>`;
  }

  return inputs.map(({ resourceId, amount }) => {
    const current = machine.inputBuffer[resourceId] ?? 0;
    return renderSlot(resourceId, `${current}/${amount}`);
  }).join("");
}

function renderOutputSlots(machine, recipe, fallbackText) {
  const outputs = recipe?.output ? Object.entries(recipe.output) : [];

  if (outputs.length === 0) {
    return `<div class="machine-slot empty">${fallbackText}</div>`;
  }

  return outputs.map(([resourceId, amount]) => {
    const current = machine.outputBuffer[resourceId] ?? 0;
    return renderSlot(resourceId, `${current}/${amount}`);
  }).join("");
}

function renderSlot(resourceId, amountText) {
  const resource = resources[resourceId];
  return `
    <div class="machine-slot">
      <span class="resource-icon" style="background: ${resource?.color ?? "#93c5fd"}"></span>
      <span>${resource?.shortName ?? resourceId}</span>
      <strong>${amountText}</strong>
    </div>
  `;
}

function renderStorageInfo(data) {
  const display = getStorageDisplay(data.storage);
  storageEl.classList.remove("hidden");

  storageEl.innerHTML = `
    <div class="panel-section-title">STORAGE</div>
    <div class="machine-row"><span>Capacity</span><strong>${display.capacity}</strong></div>
    <div class="machine-row"><span>Items</span><strong>${display.items}</strong></div>
  `;
}

function renderStorageActions(data) {
  addAction("Collect Storage Items", () => {
    if (!isSelectionStillValid(data)) return;
    collectStorageItems(data);
    renderStorageInfo(data);
  });
}

function renderConveyorInfo(data) {
  const display = getConveyorDisplay(data.conveyor);
  conveyorEl.classList.remove("hidden");

  conveyorEl.innerHTML = `
    <div class="panel-section-title">CONVEYOR</div>
    <div class="machine-row"><span>Direction</span><strong>${display.direction}</strong></div>
    <div class="machine-row"><span>Carrying</span><strong>${display.carriedItem}</strong></div>
    <div class="machine-row"><span>Transfer</span><strong>${display.transfer}</strong></div>
  `;
}

function getProgressValue(machine) {
  if (!machine?.duration) return 0;
  return Math.max(0, Math.min(100, Math.round((machine.progress / machine.duration) * 100)));
}

function formatStatus(status) {
  const statusMap = {
    working: "WORKING",
    idle: "IDLE",
    inputShortage: "MISSING INPUT",
    outputFull: "OUTPUT BLOCKED",
    noRecipe: "NO RECIPE"
  };

  return statusMap[status] ?? String(status).toUpperCase();
}

function getStatusClass(status) {
  const statusClassMap = {
    working: "working",
    idle: "idle",
    inputShortage: "warning",
    outputFull: "blocked",
    noRecipe: "warning"
  };

  return statusClassMap[status] ?? "idle";
}

function addAction(label, handler, variant = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `action-button ${variant}`.trim();
  button.textContent = label;
  button.addEventListener("click", handler);
  actionsEl.append(button);
}
