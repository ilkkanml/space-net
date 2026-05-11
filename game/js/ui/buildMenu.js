import { buildingDefinitions, buildingOrder } from "../data/buildings.js";
import { resources } from "../data/resources.js";
import { canAfford, subscribeToState } from "../core/gameState.js";

const buildMenuEl = document.querySelector("#build-menu");

let selectedBuildingId = null;
let selectHandler = null;
let cancelHandler = null;

export function initBuildMenu({ onSelectBuild, onCancelBuild }) {
  selectHandler = onSelectBuild;
  cancelHandler = onCancelBuild;
  renderBuildMenu();
  subscribeToState(renderBuildMenu);
}

export function setActiveBuildButton(buildingId) {
  selectedBuildingId = buildingId;
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
      renderBuildMenu();
      selectHandler?.(buildingId);
    });

    buildMenuEl.append(button);
  });

  const cancel = document.createElement("button");
  cancel.className = "build-button cancel-build";
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => {
    selectedBuildingId = null;
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
