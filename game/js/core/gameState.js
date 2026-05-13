export const SAVE_VERSION = "0.3.0";

export const gameState = {
  progression: {
    unlockedBlueprintIds: [],
    nexusLevel: 1
  }
};

export function notifyStateChanged() {}

export function replaceGameState(nextState) {
  Object.assign(gameState, nextState);
}
