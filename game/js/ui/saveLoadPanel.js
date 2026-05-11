import { hasSavedGame, loadGame, saveGame } from "../systems/saveLoadSystem.js";

const saveButton = document.querySelector("#save-game-button");
const loadButton = document.querySelector("#load-game-button");
const statusEl = document.querySelector("#save-load-status");

let statusCallback = null;

export function initSaveLoadPanel({ onStatus }) {
  statusCallback = onStatus;
  refreshSaveLoadPanel();

  saveButton.addEventListener("click", () => {
    const payload = saveGame();
    setPanelStatus(`Saved • ${formatTime(payload.savedAt)}`);
    statusCallback?.("Game saved locally");
    refreshSaveLoadPanel();
  });

  loadButton.addEventListener("click", () => {
    const result = loadGame();

    if (!result.ok) {
      setPanelStatus(result.reason);
      statusCallback?.(result.reason);
      return;
    }

    setPanelStatus("Loaded. Refreshing scene...");
    statusCallback?.("Game loaded locally");
    window.location.reload();
  });
}

export function refreshSaveLoadPanel() {
  loadButton.disabled = !hasSavedGame();
}

function setPanelStatus(message) {
  statusEl.textContent = message;
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
