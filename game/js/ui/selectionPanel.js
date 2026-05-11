const nameEl = document.querySelector("#selection-name");
const typeEl = document.querySelector("#selection-type");
const descriptionEl = document.querySelector("#selection-description");

export function updateSelectionPanel(worldObject) {
  if (!worldObject) {
    nameEl.textContent = "None";
    typeEl.textContent = "Click a world object";
    descriptionEl.textContent = "";
    return;
  }

  nameEl.textContent = worldObject.name;
  typeEl.textContent = `${worldObject.type} • ${worldObject.size}`;
  descriptionEl.textContent = worldObject.description;
}
