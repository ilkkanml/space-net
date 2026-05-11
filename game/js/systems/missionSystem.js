import { gameState, removeResource, notifyStateChanged } from "../core/gameState.js";
import { missionDefinitions } from "../data/missions.js";
import { resources } from "../data/resources.js";

let statusCallback = null;

export function initMissionSystem({ onStatus }) {
  statusCallback = onStatus;
}

export function updateMissions() {
  const mission = getActiveMission();
  if (!mission) return;

  if (mission.type === "ownResources" && requirementsMet(mission.requirements, getOwnedResourceAmount)) {
    completeMission(mission.id);
    return;
  }

  if (mission.type === "buildings" && requirementsMet(mission.requirements, getBuildingCount)) {
    completeMission(mission.id);
    return;
  }

  if (mission.type === "deliverResources" && deliveryComplete(mission)) {
    completeMission(mission.id);
    return;
  }

  if (mission.type === "memory") {
    recoverMemoryFragment01();
    completeMission(mission.id);
  }
}

export function contactNexus() {
  const mission = getActiveMission();
  if (mission?.type === "nexusContact") {
    completeMission(mission.id);
  }
}

export function deliverCurrentMissionToNexus() {
  const mission = getActiveMission();

  if (!mission || mission.type !== "deliverResources") {
    statusCallback?.("No active NEXUS delivery mission");
    return false;
  }

  const progress = getDeliveryProgress(mission.id);
  let deliveredAny = false;

  Object.entries(mission.requirements).forEach(([resourceId, requiredAmount]) => {
    const alreadyDelivered = progress[resourceId] ?? 0;
    const remaining = Math.max(0, requiredAmount - alreadyDelivered);
    if (remaining <= 0) return;

    const available = gameState.resources[resourceId] ?? 0;
    const amountToDeliver = Math.min(available, remaining);
    if (amountToDeliver <= 0) return;

    if (removeResource(resourceId, amountToDeliver)) {
      progress[resourceId] = alreadyDelivered + amountToDeliver;
      deliveredAny = true;
    }
  });

  if (!deliveredAny) {
    statusCallback?.("No required resources in inventory");
    return false;
  }

  statusCallback?.("Materials delivered to NEXUS Core");
  notifyStateChanged();
  updateMissions();
  return true;
}

export function canDeliverToNexusNow() {
  const mission = getActiveMission();
  return Boolean(mission && mission.type === "deliverResources");
}

export function getActiveMission() {
  return missionDefinitions[gameState.missions.activeMissionId] ?? null;
}

export function getMissionDisplay() {
  const mission = getActiveMission();

  if (!mission) {
    return {
      title: "v0.1 Mission Chain Complete",
      description: "NEXUS Core recovered Memory Fragment 01.",
      progressLines: [`NEXUS Level: ${gameState.nexus.level}`],
      complete: true
    };
  }

  return {
    title: mission.title,
    description: mission.description,
    progressLines: getMissionProgressLines(mission),
    complete: false
  };
}

export function getNexusDisplay() {
  const mission = getActiveMission();
  const activeMissionTitle = mission ? mission.title : "Mission Chain Complete";

  return {
    level: gameState.nexus.level,
    memory: gameState.nexus.memoryFragments.includes("memoryFragment01") ? "Memory Fragment 01 recovered" : "No memory fragment recovered",
    activeMission: activeMissionTitle
  };
}

function completeMission(missionId) {
  if (gameState.missions.completedMissionIds.includes(missionId)) return;

  const mission = missionDefinitions[missionId];
  gameState.missions.completedMissionIds.push(missionId);
  gameState.missions.activeMissionId = mission.next;

  statusCallback?.(`Mission complete: ${mission.title}`);
  notifyStateChanged();
}

function recoverMemoryFragment01() {
  if (!gameState.nexus.memoryFragments.includes("memoryFragment01")) {
    gameState.nexus.memoryFragments.push("memoryFragment01");
  }

  gameState.nexus.level = Math.max(gameState.nexus.level, 2);
  statusCallback?.("Memory Fragment 01 recovered");
}

function getMissionProgressLines(mission) {
  if (mission.type === "nexusContact") {
    return ["Progress: Select NEXUS Core"];
  }

  if (mission.type === "ownResources") {
    return Object.entries(mission.requirements).map(([resourceId, amount]) => {
      return `${resources[resourceId].name}: ${getOwnedResourceAmount(resourceId)}/${amount}`;
    });
  }

  if (mission.type === "buildings") {
    return Object.entries(mission.requirements).map(([buildingId, amount]) => {
      return `${formatBuildingName(buildingId)}: ${getBuildingCount(buildingId)}/${amount}`;
    });
  }

  if (mission.type === "deliverResources") {
    const progress = getDeliveryProgress(mission.id);

    return Object.entries(mission.requirements).map(([resourceId, amount]) => {
      return `${resources[resourceId].name}: ${progress[resourceId] ?? 0}/${amount} delivered`;
    });
  }

  if (mission.type === "memory") {
    return ["Progress: Recovering Memory Fragment 01"];
  }

  return [];
}

function getOwnedResourceAmount(resourceId) {
  let total = gameState.resources[resourceId] ?? 0;

  gameState.buildings.forEach((building) => {
    if (building.machine) {
      total += building.machine.inputBuffer[resourceId] ?? 0;
      total += building.machine.outputBuffer[resourceId] ?? 0;
    }

    if (building.storage) {
      total += building.storage.items[resourceId] ?? 0;
    }

    if (building.conveyor?.carriedItem?.resourceId === resourceId) {
      total += building.conveyor.carriedItem.amount;
    }
  });

  return total;
}

function getBuildingCount(buildingId) {
  return gameState.buildings.filter((building) => building.definitionId === buildingId).length;
}

function requirementsMet(requirements, getter) {
  return Object.entries(requirements).every(([id, amount]) => getter(id) >= amount);
}

function getDeliveryProgress(missionId) {
  if (!gameState.missions.deliveryProgress[missionId]) {
    gameState.missions.deliveryProgress[missionId] = {};
  }

  return gameState.missions.deliveryProgress[missionId];
}

function deliveryComplete(mission) {
  const progress = getDeliveryProgress(mission.id);

  return Object.entries(mission.requirements).every(([resourceId, amount]) => {
    return (progress[resourceId] ?? 0) >= amount;
  });
}

function formatBuildingName(buildingId) {
  if (buildingId === "basicMiner") return "Basic Miner";
  if (buildingId === "basicProcessor") return "Basic Processor";
  if (buildingId === "basicConveyor") return "Basic Conveyor";
  if (buildingId === "smallStorage") return "Small Storage";
  return buildingId;
}
