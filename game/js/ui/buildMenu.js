import { buildingDefinitions, buildingOrder } from "../data/buildings.js";
import { resources } from "../data/resources.js";
import { canAfford, subscribeToState } from "../core/gameState.js";

const buildMenuEl = document.querySelector("#build-menu");

let selectedBuildingId = null;
let removeModeActive = false;
let selectHandler = null;
let cancelHandler = null;
let removeModeHandler = null;
let deleteSelectedHandler = null;

export function initBuildMenu({ onSelectBuild, onCancelBuild, onRemoveMode, onDeleteSelected }) {
  selectHandler = onSelectBuild;
  cancelHandler = onCancelBuild;
  removeModeHandler = onRemoveMode;
  deleteSelectedHandler = onDeleteSelected;
  renderBuildMenu();
  subscribeToState(renderBuildMenu);
}

export function setActiveBuildButton(buildingId) {
  selectedBuildingId = buildingId;
  removeModeActive = false;
  renderBuildMenu();
}

export function setRemoveModeActive(isActive) {
  removeModeActive = isActive;
  if (isActive) selectedBuildingId = null;
  renderBuildMenu();
}

function renderBuildMenu() {
  buildMenuEl.innerHTML = "";

  buildingOrder.forEach((buildingId) => {
    const definition = buildingDefinitions[buildingId];

    const button = document.createElement("button");
    button.className = "build-button";
    if (selectedBuildingId === buildingId) button.classList.add("active");
    button.disabled = !canAfford(definition.cost);
    button.type = "button";

    const title = document.createElement("div");
    title.className = "build-title";
    title.textContent = definition.name;

    const cost = document.createElement("div");
    cost.className = "build-cost";
    cost.textContent = formatCost(definition.cost);

    button.append(title, cost);

    button.addEventListener("click", () => {
      if (button.disabled) return;
      selectedBuildingId = buildingId;
      removeModeActive = false;
      renderBuildMenu();
      selectHandler?.(buildingId);
    });

    buildMenuEl.append(button);
  });

  const remove = document.createElement("button");
  remove.className = "build-button remove-build";
  if (removeModeActive) remove.classList.add("active", "danger");
  remove.type = "button";
  remove.innerHTML = `<div class="build-title">Remove</div><div class="build-cost">Select mode</div>`;
  remove.addEventListener("click", () => {
    selectedBuildingId = null;
    removeModeActive = true;
    renderBuildMenu();
    removeModeHandler?.();
  });
  buildMenuEl.append(remove);

  if (removeModeActive) {
    const deleteSelected = document.createElement("button");
    deleteSelected.className = "build-button delete-selected danger";
    deleteSelected.type = "button";
    deleteSelected.innerHTML = `<div class="build-title">Delete Selected</div><div class="build-cost">Remove marked</div>`;
    deleteSelected.addEventListener("click", () => {
      deleteSelectedHandler?.();
    });
    buildMenuEl.append(deleteSelected);
  }

  const cancel = document.createElement("button");
  cancel.className = "build-button cancel-build";
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => {
    selectedBuildingId = null;
    removeModeActive = false;
    renderBuildMenu();
    cancelHandler?.();
  });

  buildMenuEl.append(cancel);
}

function formatCost(cost) {
  return Object.entries(cost)
    .map(([resourceId, amount]) => `${amount} ${resources[resourceId].shortName}`)
    .join(" + ");
}
