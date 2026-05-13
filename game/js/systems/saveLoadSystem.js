import { replaceGameState, notifyStateChanged } from "../core/gameState.js";
import { normalizeProgressionState } from "./progressionSystem.js";

export function loadGame(payload) {
  replaceGameState(payload.gameState);

  normalizeProgressionState();

  notifyStateChanged();

  return { ok: true };
}
