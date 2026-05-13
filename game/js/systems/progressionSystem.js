import { gameState, notifyStateChanged } from "../core/gameState.js";
import { blueprints } from "../data/blueprints.js";

export function normalizeProgressionState() {
  gameState.progression ??= {};
  gameState.progression.unlockedBlueprintIds ??= [];
  gameState.progression.nexusLevel ??= 1;

  Object.values(blueprints).forEach((blueprint) => {
    if (
      blueprint.unlockedByDefault &&
      !gameState.progression.unlockedBlueprintIds.includes(blueprint.id)
    ) {
      gameState.progression.unlockedBlueprintIds.push(blueprint.id);
    }
  });
}

export function isBlueprintUnlocked(id) {
  normalizeProgressionState();
  return gameState.progression.unlockedBlueprintIds.includes(id);
}

export function unlockBlueprint(id) {
  normalizeProgressionState();

  if (isBlueprintUnlocked(id)) return false;

  gameState.progression.unlockedBlueprintIds.push(id);
  notifyStateChanged();
  return true;
}
