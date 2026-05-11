import { resources } from "../data/resources.js";
import { recipes, recipeOrder } from "../data/recipes.js";
import {
  collectMachineOutput,
  getMachineDisplay,
  loadRecipeInputFromInventory,
  setRecipe
} from "../systems/productionSystem.js";
import { getStorageDisplay, collectStorageItems } from "../systems/storageSystem.js";
import { getConveyorDisplay } from "../systems/conveyorSystem.js";
import { removePlacedBuilding, canRemoveBuilding } from "../systems/buildSystem.js";
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
    nameEl.textContent = "None";
    typeEl.textContent = "Click a world object";
    descriptionEl.textContent = "";
    return;
  }

  const data = getSelectionData(selection);

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

  if (data.id && data.definitionId && canRemoveBuilding(data)) {
    renderRemoveAction(data);
  }
}

export function refreshSelectionPanel() {
  if (!currentSelection) return;

  const data = getSelectionData(currentSelection);

  if (data.id === "nexus_core_01") {
    renderNexusInfo();
    refreshNexusActionsIfNeeded();
  }
  if (data.machine) renderMachineInfo(data);
  if (data.storage) renderStorageInfo(data);
  if (data.conveyor) renderConveyorInfo(data);
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

function renderNexusInfo() {
  const display = getNexusDisplay();
  nexusEl.classList.remove("hidden");

  nexusEl.innerHTML = `
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
  const display = getMachineDisplay(data.machine);
  machineEl.classList.remove("hidden");

  machineEl.innerHTML = `
    <div class="machine-row"><span>Status</span><strong>${display.status}</strong></div>
    <div class="machine-row"><span>Recipe</span><strong>${display.recipe}</strong></div>
    <div class="machine-row"><span>Progress</span><strong>${display.progress}</strong></div>
    <div class="machine-row"><span>Input</span><strong>${display.input}</strong></div>
    <div class="machine-row"><span>Output</span><strong>${display.output}</strong></div>
  `;
}

function renderMachineActions(data) {
  if (data.machine.kind === "processor") {
    recipeOrder.forEach((recipeId) => {
      const recipe = recipes[recipeId];
      addAction(`Set Recipe: ${recipe.name}`, () => {
        setRecipe(data, recipeId);
        renderMachineInfo(data);
      }, "secondary");
    });

    addAction("Load Input From Inventory", () => {
      loadRecipeInputFromInventory(data);
      renderMachineInfo(data);
    });
  }

  addAction("Collect Machine Output", () => {
    collectMachineOutput(data);
    renderMachineInfo(data);
  });
}

function renderStorageInfo(data) {
  const display = getStorageDisplay(data.storage);
  storageEl.classList.remove("hidden");

  storageEl.innerHTML = `
    <div class="machine-row"><span>Capacity</span><strong>${display.capacity}</strong></div>
    <div class="machine-row"><span>Items</span><strong>${display.items}</strong></div>
  `;
}

function renderStorageActions(data) {
  addAction("Collect Storage Items", () => {
    collectStorageItems(data);
    renderStorageInfo(data);
  });
}

function renderConveyorInfo(data) {
  const display = getConveyorDisplay(data.conveyor);
  conveyorEl.classList.remove("hidden");

  conveyorEl.innerHTML = `
    <div class="machine-row"><span>Direction</span><strong>${display.direction}</strong></div>
    <div class="machine-row"><span>Carrying</span><strong>${display.carriedItem}</strong></div>
    <div class="machine-row"><span>Transfer</span><strong>${display.transfer}</strong></div>
  `;
}


function renderRemoveAction(data) {
  addAction("Remove Selected Building", () => {
    const ok = removePlacedBuilding(data.id);
    if (ok) {
      updateSelectionPanel(null);
    }
  }, "danger");
}

function addAction(label, handler, variant = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `action-button ${variant}`.trim();
  button.textContent = label;
  button.addEventListener("click", handler);
  actionsEl.append(button);
}
