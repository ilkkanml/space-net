import { blueprints } from "../data/blueprints.js";
import { isBlueprintUnlocked } from "../systems/progressionSystem.js";

export function getBuildMenuEntries(buildings) {
  return buildings.map((building) => {
    const blueprint = blueprints[building.id];

    return {
      ...building,
      locked: !isBlueprintUnlocked(building.id),
      lockReason: blueprint
        ? `Requires NEXUS Level ${blueprint.requiredNexusLevel}`
        : null
    };
  });
}
