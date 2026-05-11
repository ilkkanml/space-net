import { getMissionDisplay } from "../systems/missionSystem.js";

const missionPanelEl = document.querySelector("#mission-panel");

export function initMissionPanel() {
  renderMissionPanel();
}

export function refreshMissionPanel() {
  renderMissionPanel();
}

function renderMissionPanel() {
  const display = getMissionDisplay();

  missionPanelEl.innerHTML = "";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = "Current Objective";

  const title = document.createElement("div");
  title.className = "mission-title";
  title.textContent = display.title;

  const description = document.createElement("div");
  description.className = "mission-description";
  description.textContent = display.description;

  const progress = document.createElement("div");
  progress.className = "mission-progress";

  display.progressLines.forEach((line) => {
    const row = document.createElement("div");
    row.textContent = line;
    progress.append(row);
  });

  missionPanelEl.append(label, title, description, progress);

  if (display.complete) {
    const complete = document.createElement("div");
    complete.className = "mission-complete";
    complete.textContent = "Internal v0.1 mission pass complete.";
    missionPanelEl.append(complete);
  }
}
