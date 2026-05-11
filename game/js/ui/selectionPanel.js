import { resources } from "../data/resources.js";

const nameEl = document.querySelector("#selection-name");
const typeEl = document.querySelector("#selection-type");
const descriptionEl = document.querySelector("#selection-description");
const actionButtonEl = document.querySelector("#selection-action");

let actionHandler = null;

export function updateSelectionPanel(selection, onAction) {
  actionHandler = null;
  actionButtonEl.classList.add("hidden");
  actionButtonEl.textContent = "";

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
    actionButtonEl.textContent = `Collect +${data.collectionAmount} ${resource.name}`;
    actionButtonEl.classList.remove("hidden");
    actionHandler = onAction;
  }
}

actionButtonEl.addEventListener("click", () => {
  if (typeof actionHandler === "function") {
    actionHandler();
  }
});
