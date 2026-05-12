import { gameState, replaceGameState, SAVE_VERSION } from "../core/gameState.js";

export const SAVE_KEY = "spaceNetSave_v0_2";
const LEGACY_SAVE_KEYS = ["spaceNetSave_v0_1"];

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
  return Boolean(getSavedGameRaw());
}

export function loadGame() {
  const saveRecord = getSavedGameRaw();
  if (!saveRecord.raw) return { ok: false, reason: "No saved game found" };

  try {
    const payload = JSON.parse(saveRecord.raw);

    if (!SUPPORTED_SAVE_VERSIONS.includes(payload.saveVersion)) {
      return {
        ok: false,
        reason: `Unsupported save version: ${payload.saveVersion ?? "unknown"}`
      };
    }

    replaceGameState(payload.gameState);

    if (saveRecord.key !== SAVE_KEY) {
      saveGame();
    }

    return {
      ok: true,
      payload,
      migrated: payload.saveVersion !== SAVE_VERSION || saveRecord.key !== SAVE_KEY
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
    LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
    console.info("S.P.A.C.E. NET debug save cleared. Reload the page to start from a clean local state.");
  };
}

function getSavedGameRaw() {
  const currentRaw = localStorage.getItem(SAVE_KEY);
  if (currentRaw) {
    return { key: SAVE_KEY, raw: currentRaw };
  }

  for (const key of LEGACY_SAVE_KEYS) {
    const legacyRaw = localStorage.getItem(key);
    if (legacyRaw) {
      return { key, raw: legacyRaw };
    }
  }

  return { key: null, raw: null };
}
