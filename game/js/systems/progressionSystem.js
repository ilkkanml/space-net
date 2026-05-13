import { gameState, notifyStateChanged } from "../core/gameState.js";
import { blueprints } from "../data/blueprints.js";

export function normalizeProgressionState() {
  gameState.progression ??= {};
  gameState.progression.unlockedBlueprintIds = Array.isArray(gameState.progression.unlockedBlueprintIds)
    ? gameState.progression.unlockedBlueprintIds
    : [];
  gameState.progression.nexusLevel = Number.isFinite(gameState.progression.nexusLevel)
    ? gameState.progression.nexusLevel
    : 1;

  Object.values(blueprints).forEach((blueprint) => {
    if (
      blueprint.unlockedByDefault &&
      !gameState.progression.unlockedBlueprintIds.includes(blueprint.id)
    ) {
      gameState.progression.unlockedBlueprintIds.push(blueprint.id);
    }
  });
}

export function isBlueprintUnlocked(blueprintId) {
  normalizeProgressionState();
  return gameState.progression.unlockedBlueprintIds.includes(blueprintId);
}

export function unlockBlueprint(blueprintId) {
  normalizeProgressionState();

  if (!blueprints[blueprintId]) return false;
  if (isBlueprintUnlocked(blueprintId)) return false;

  gameState.progression.unlockedBlueprintIds.push(blueprintId);
  notifyStateChanged();

  return true;
}

export function setNexusLevel(level) {
  normalizeProgressionState();

  const safeLevel = Number.isFinite(level) ? Math.max(1, level) : 1;
  if (gameState.progression.nexusLevel === safeLevel) return false;

  gameState.progression.nexusLevel = safeLevel;
  notifyStateChanged();
  return true;
}

export function getNexusLevel() {
  normalizeProgressionState();
  return gameState.progression.nexusLevel;
}

export function getBlueprintLockInfo(blueprintId) {
  normalizeProgressionState();

  const blueprint = blueprints[blueprintId];
  const unlocked = isBlueprintUnlocked(blueprintId);

  return {
    unlocked,
    requiredNexusLevel: blueprint?.requiredNexusLevel ?? 1,
    reason: unlocked ? null : `Requires NEXUS Level ${blueprint?.requiredNexusLevel ?? 1}`
  };
}
