import { resources } from "../data/resources.js";

const nameEl = document.querySelector("#selection-name");
const typeEl = document.querySelector("#selection-type");
const descriptionEl = document.querySelector("#selection-description");
const actionButtonEl = document.querySelector("#selection-action");

let actionHandler = null;

export function updateSelectionPanel(worldObject, onAction) {
  actionHandler = null;
  actionButtonEl.classList.add("hidden");
  actionButtonEl.textContent = "";

  if (!worldObject) {
    nameEl.textContent = "None";
    typeEl.textContent = "Click a world object";
    descriptionEl.textContent = "";
    return;
  }

  nameEl.textContent = worldObject.name;
  typeEl.textContent = `${worldObject.type} • ${worldObject.size}`;
  descriptionEl.textContent = worldObject.description;

  if (worldObject.collectible && worldObject.resourceId) {
    const resource = resources[worldObject.resourceId];
    actionButtonEl.textContent = `Collect +${worldObject.collectionAmount} ${resource.name}`;
    actionButtonEl.classList.remove("hidden");
    actionHandler = onAction;
  }
}

actionButtonEl.addEventListener("click", () => {
  if (typeof actionHandler === "function") {
    actionHandler();
  }
});
