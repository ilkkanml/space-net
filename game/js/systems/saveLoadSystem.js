import { gameState, replaceGameState, SAVE_VERSION } from "../core/gameState.js";

export const SAVE_KEY = "spaceNetSave_v0_2";

const SUPPORTED_SAVE_VERSIONS = [
  "0.1.0",
  "0.2.0"
];

export function saveGame() {
  const payload = {
    saveVersion: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    gameState: JSON.parse(JSON.stringify(gameState))
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  return payload;
}

export function hasSavedGame() {
  return Boolean(localStorage.getItem(SAVE_KEY));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return { ok: false, reason: "No saved game found" };

  try {
    const payload = JSON.parse(raw);

    if (!SUPPORTED_SAVE_VERSIONS.includes(payload.saveVersion)) {
      return {
        ok: false,
        reason: `Unsupported save version: ${payload.saveVersion ?? "unknown"}`
      };
    }

    replaceGameState(payload.gameState);

    return {
      ok: true,
      payload,
      migrated: payload.saveVersion !== SAVE_VERSION
    };
  } catch (error) {
    return { ok: false, reason: "Save file is corrupted" };
  }
}

export function tryAutoLoadGame() {
  if (!hasSavedGame()) return { ok: false, reason: "No saved game found" };
  return loadGame();
}

export function installDeveloperDebugClearSave() {
  window.spaceNetDebugClearSave = () => {
    localStorage.removeItem(SAVE_KEY);
    console.info("S.P.A.C.E. NET debug save cleared. Reload the page to start from a clean local state.");
  };
}
