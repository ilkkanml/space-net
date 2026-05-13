import { gameState, notifyStateChanged, removeResource } from "../core/gameState.js";
import { missions } from "../data/missions.js";

let statusCallback = null;

export function initMissionSystem({ onStatus }) {
  statusCallback = onStatus;
}

export function updateMissions() {
  const mission = getCurrentMission();
  if (!mission) return;

  if (mission.type === "collect") {
    updateCollectMission(mission);
  }
}

export function contactNexus() {
  return getCurrentMission();
}

export function canDeliverToNexusNow() {
  const mission = getCurrentMission();

  if (!mission || mission.type !== "deliver") return false;

  return Object.entries(mission.requirements ?? {}).every(([resourceId, amount]) => {
    return (gameState.resources[resourceId] ?? 0) >= amount;
  });
}

export function deliverCurrentMissionToNexus() {
  const mission = getCurrentMission();

  if (!mission || mission.type !== "deliver") {
    statusCallback?.("No active delivery mission");
    return false;
  }

  if (!canDeliverToNexusNow()) {
    statusCallback?.("Insufficient resources for delivery");
    return false;
  }

  Object.entries(mission.requirements ?? {}).forEach(([resourceId, amount]) => {
    removeResource(resourceId, amount);

    gameState.missions.deliveryProgress[mission.id] ??= {};
    gameState.missions.deliveryProgress[mission.id][resourceId] = amount;
  });

  completeMission(mission.id);

  statusCallback?.("NEXUS delivery complete");
  notifyStateChanged();

  return true;
}

export function getMissionDisplay() {
  const mission = getCurrentMission();

  if (!mission) {
    return {
      title: "No Active Mission",
      objectives: [],
      description: ""
    };
  }

  if (mission.type === "collect") {
    return {
      title: mission.title,
      description: mission.description,
      objectives: Object.entries(mission.requirements ?? {}).map(([resourceId, amount]) => ({
        label: `Collect ${resourceId}`,
        current: Math.min(gameState.resources[resourceId] ?? 0, amount),
        required: amount
      }))
    };
  }

  return {
    title: mission.title,
    description: mission.description,
    objectives: Object.entries(mission.requirements ?? {}).map(([resourceId, amount]) => ({
      label: `Deliver ${resourceId}`,
      current: gameState.missions.deliveryProgress?.[mission.id]?.[resourceId] ?? 0,
      required: amount
    }))
  };
}

export function getNexusDisplay() {
  return {
    level: gameState.nexus.level,
    memory: gameState.nexus.memoryFragments.length,
    activeMission: getCurrentMission()?.title ?? "None"
  };
}

function updateCollectMission(mission) {
  const completed = Object.entries(mission.requirements ?? {}).every(([resourceId, amount]) => {
    return (gameState.resources[resourceId] ?? 0) >= amount;
  });

  if (completed) {
    completeMission(mission.id);
  }
}

function completeMission(missionId) {
  if (gameState.missions.completedMissionIds.includes(missionId)) return;

  gameState.missions.completedMissionIds.push(missionId);

  const currentIndex = missions.findIndex((mission) => mission.id === missionId);
  const nextMission = missions[currentIndex + 1];

  if (nextMission) {
    gameState.missions.activeMissionId = nextMission.id;
  } else {
    gameState.missions.activeMissionId = null;
  }

  notifyStateChanged();
}

function getCurrentMission() {
  return missions.find((mission) => mission.id === gameState.missions.activeMissionId) ?? null;
}
