import { gameState } from "../core/gameState.js";
import { getMissionDisplay } from "../systems/missionSystem.js";

const missionPanelEl = document.querySelector("#mission-panel");

export function initMissionPanel() {
  renderMissionPanel();
}

export function refreshMissionPanel() {
  renderMissionPanel();
}

function renderMissionPanel() {
  if (!missionPanelEl) return;

  const display = getMissionDisplay();

  missionPanelEl.innerHTML = "";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = display.complete ? "Completed Objective" : "Current Objective";

  const title = document.createElement("div");
  title.className = "mission-title";
  title.textContent = display.title;

  const description = document.createElement("div");
  description.className = "mission-description";
  description.textContent = display.description;

  const progress = document.createElement("div");
  progress.className = "mission-progress";

  (display.progressLines ?? []).forEach((line) => {
    const row = document.createElement("div");
    row.textContent = line;
    progress.append(row);
  });

  missionPanelEl.append(label, title, description, progress);

  if (display.complete) {
    const complete = document.createElement("div");
    complete.className = "mission-complete";
    complete.textContent = `Mission complete: ${display.title}`;
    missionPanelEl.append(complete);
  }

  missionPanelEl.append(createProgressionReadout());
}

function createProgressionReadout() {
  const progression = gameState?.progression ?? {};
  const nexusLevel = progression.nexusLevel ?? gameState?.nexus?.level ?? 1;
  const basicAssemblerStatus = progression.blueprints?.basicAssembler ?? "LOCKED";

  const section = document.createElement("div");
  section.className = "progression-readout";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = "NEXUS Progression";

  const levelRow = document.createElement("div");
  levelRow.className = "progression-row";

  const levelName = document.createElement("span");
  levelName.textContent = "NEXUS Level";

  const levelValue = document.createElement("strong");
  levelValue.textContent = String(nexusLevel);

  levelRow.append(levelName, levelValue);

  const blueprintRow = document.createElement("div");
  blueprintRow.className = "progression-row";

  const blueprintName = document.createElement("span");
  blueprintName.textContent = "Basic Assembler";

  const blueprintStatus = document.createElement("strong");
  blueprintStatus.className = "progression-locked";
  blueprintStatus.textContent = basicAssemblerStatus;

  blueprintRow.append(blueprintName, blueprintStatus);
  section.append(label, levelRow, blueprintRow);

  return section;
}
