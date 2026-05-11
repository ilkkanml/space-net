import { resources } from "../data/resources.js";
import { recipes, recipeOrder } from "../data/recipes.js";
import {
  collectMachineOutput,
  getMachineDisplay,
  loadRecipeInputFromInventory,
  setRecipe
} from "../systems/productionSystem.js";

const nameEl = document.querySelector("#selection-name");
const typeEl = document.querySelector("#selection-type");
const descriptionEl = document.querySelector("#selection-description");
const machineEl = document.querySelector("#selection-machine");
const actionsEl = document.querySelector("#selection-actions");

let currentSelection = null;
let currentCollectAction = null;

export function updateSelectionPanel(selection, onCollectResource) {
  currentSelection = selection;
  currentCollectAction = onCollectResource;

  actionsEl.innerHTML = "";
  machineEl.innerHTML = "";
  machineEl.classList.add("hidden");

  if (!selection) {
    nameEl.textContent = "None";
    typeEl.textContent = "Click a world object";
    descriptionEl.textContent = "";
    return;
  }

  const data = selection.userData?.worldObject || selection.userData?.building || selection;

  nameEl.textContent = data.name;
  typeEl.textContent = `${data.type} • ${data.size ?? "Object"}`;
  descriptionEl.textContent = data.description ?? "";

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
}

export function refreshSelectionPanel() {
  if (currentSelection) {
    updateSelectionPanel(currentSelection, currentCollectAction);
  }
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
        refreshSelectionPanel();
      }, "secondary");
    });

    addAction("Load Input From Inventory", () => {
      loadRecipeInputFromInventory(data);
      refreshSelectionPanel();
    });
  }

  addAction("Collect Machine Output", () => {
    collectMachineOutput(data);
    refreshSelectionPanel();
  });
}

function addAction(label, handler, variant = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `action-button ${variant}`.trim();
  button.textContent = label;
  button.addEventListener("click", handler);
  actionsEl.append(button);
}
