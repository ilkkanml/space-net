import { gameState, notifyStateChanged, removeResource } from "../core/gameState.js";
import { missions, firstMissionId } from "../data/missions.js";
import { resources } from "../data/resources.js";

let statusCallback = null;

export function initMissionSystem({ onStatus }) {
  statusCallback = onStatus;
  normalizeMissionState();
}

export function updateMissions() {
  normalizeMissionState();

  const mission = getCurrentMission();
  if (!mission) return;

  if (mission.type !== "collect") return;

  if (isCollectMissionComplete(mission)) {
    completeActiveMission(mission.id);
  }
}

export function contactNexus() {
  normalizeMissionState();

  const mission = getCurrentMission();

  if (mission?.type === "contact") {
    completeActiveMission(mission.id);
    statusCallback?.("NEXUS contact established");
  }

  return getCurrentMission();
}

export function canDeliverToNexusNow() {
  normalizeMissionState();

  const mission = getCurrentMission();
  if (!mission || mission.type !== "deliver") return false;

  return hasRequiredResources(mission);
}

export function deliverCurrentMissionToNexus() {
  normalizeMissionState();

  const mission = getCurrentMission();

  if (!mission || mission.type !== "deliver") {
    statusCallback?.("No active delivery mission");
    return false;
  }

  if (!hasRequiredResources(mission)) {
    statusCallback?.("Insufficient resources for delivery");
    return false;
  }

  gameState.missions.deliveryProgress[mission.id] ??= {};

  Object.entries(mission.requirements ?? {}).forEach(([resourceId, amount]) => {
    removeResource(resourceId, amount);
    gameState.missions.deliveryProgress[mission.id][resourceId] =
      (gameState.missions.deliveryProgress[mission.id][resourceId] ?? 0) + amount;
  });

  if (isDeliveryMissionComplete(mission)) {
    completeActiveMission(mission.id);
  }

  statusCallback?.("NEXUS delivery complete");
  notifyStateChanged();

  return true;
}

export function getMissionDisplay() {
  normalizeMissionState();

  const mission = getCurrentMission();

  if (!mission) {
    return {
      title: "No Active Mission",
      description: "",
      progressLines: [],
      complete: true
    };
  }

  return {
    title: mission.title,
    description: mission.description ?? "",
    progressLines: getProgressLines(mission),
    complete: false
  };
}

export function getNexusDisplay() {
  normalizeMissionState();

  return {
    level: gameState.nexus.level,
    memory: gameState.nexus.memoryFragments.length,
    activeMission: getCurrentMission()?.title ?? "None"
  };
}

export function normalizeMissionState() {
  gameState.missions ??= {};
  gameState.missions.completedMissionIds = Array.isArray(gameState.missions.completedMissionIds)
    ? gameState.missions.completedMissionIds
    : [];
  gameState.missions.deliveryProgress =
    gameState.missions.deliveryProgress && typeof gameState.missions.deliveryProgress === "object"
      ? gameState.missions.deliveryProgress
      : {};

  if (!missions.some((mission) => mission.id === gameState.missions.activeMissionId)) {
    gameState.missions.activeMissionId = firstMissionId;
  }

  const activeIndex = missions.findIndex((mission) => mission.id === gameState.missions.activeMissionId);
  if (activeIndex < 0) return;

  gameState.missions.completedMissionIds = gameState.missions.completedMissionIds.filter((missionId) => {
    const index = missions.findIndex((mission) => mission.id === missionId);
    return index >= 0 && index < activeIndex;
  });

  Object.keys(gameState.missions.deliveryProgress).forEach((missionId) => {
    const mission = missions.find((entry) => entry.id === missionId);
    if (!mission || mission.type !== "deliver") {
      delete gameState.missions.deliveryProgress[missionId];
    }
  });
}

function getProgressLines(mission) {
  if (mission.type === "contact") {
    return ["NEXUS contact 0/1"];
  }

  return Object.entries(mission.requirements ?? {}).map(([resourceId, amount]) => {
    const name = resources[resourceId]?.name ?? resourceId;
    const current = getMissionProgressAmount(mission, resourceId, amount);
    const label = mission.progressLabel ?? (mission.type === "deliver" ? "delivered" : "collected");

    return `${name} ${current}/${amount} ${label}`;
  });
}

function getMissionProgressAmount(mission, resourceId, amount) {
  if (mission.type === "collect") {
    return Math.min(gameState.resources[resourceId] ?? 0, amount);
  }

  if (mission.type === "deliver") {
    return Math.min(gameState.missions.deliveryProgress?.[mission.id]?.[resourceId] ?? 0, amount);
  }

  return 0;
}

function isCollectMissionComplete(mission) {
  return Object.entries(mission.requirements ?? {}).every(([resourceId, amount]) => {
    return (gameState.resources[resourceId] ?? 0) >= amount;
  });
}

function isDeliveryMissionComplete(mission) {
  return Object.entries(mission.requirements ?? {}).every(([resourceId, amount]) => {
    return (gameState.missions.deliveryProgress?.[mission.id]?.[resourceId] ?? 0) >= amount;
  });
}

function hasRequiredResources(mission) {
  return Object.entries(mission.requirements ?? {}).every(([resourceId, amount]) => {
    return (gameState.resources[resourceId] ?? 0) >= amount;
  });
}

function completeActiveMission(missionId) {
  normalizeMissionState();

  if (gameState.missions.activeMissionId !== missionId) {
    return false;
  }

  const activeIndex = missions.findIndex((mission) => mission.id === missionId);
  if (activeIndex < 0) return false;

  if (!gameState.missions.completedMissionIds.includes(missionId)) {
    gameState.missions.completedMissionIds.push(missionId);
  }

  gameState.missions.activeMissionId = missions[activeIndex + 1]?.id ?? null;

  notifyStateChanged();
  return true;
}

function getCurrentMission() {
  return missions.find((mission) => mission.id === gameState.missions.activeMissionId) ?? null;
}
