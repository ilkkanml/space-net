import { resources, resourceOrder } from "../data/resources.js";
import { gameState, subscribeToState } from "../core/gameState.js";

const resourceBarEl = document.querySelector("#resource-bar");

export function initResourceBar() {
  renderResourceBar();
  subscribeToState(renderResourceBar);
}

function renderResourceBar() {
  resourceBarEl.innerHTML = "";

  resourceOrder.forEach((resourceId) => {
    const resource = resources[resourceId];
    const amount = gameState.resources[resourceId] ?? 0;

    const item = document.createElement("div");
    item.className = "resource-item";

    const icon = document.createElement("div");
    icon.className = "resource-icon";
    icon.style.background = resource.color;

    const name = document.createElement("div");
    name.className = "resource-name";
    name.textContent = resource.shortName;

    const value = document.createElement("div");
    value.className = "resource-amount";
    value.textContent = amount;

    item.append(icon, name, value);
    resourceBarEl.append(item);
  });
}
