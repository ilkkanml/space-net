import { unlockBlueprint } from "./progressionSystem.js";

export function onMissionCompleted(missionId) {
  if (missionId === "stabilizeNexus") {
    unlockBlueprint("storageUnit");
  }
}
