import * as THREE from "three";
import { buildingDefinitions } from "../data/buildings.js";
import { gameState, spendCost, addBuilding } from "../core/gameState.js";
import { createMachineState } from "./productionSystem.js";

const CELL_SIZE = 2;
const WORLD_LIMIT = 32;

const directions = ["east", "south", "west", "north"];
const directionRotations = {
  east: 0,
  south: -Math.PI / 2,
  west: Math.PI,
  north: Math.PI / 2
};

const occupiedCells = new Set();
const minedDeposits = new Set();

let sceneRef = null;
let selectedBuildingId = null;
let previewMesh = null;
let placedBuildingsGroup = null;
let statusCallback = null;
let selectBuildingCallback = null;
let currentConveyorDirection = "east";

export function initBuildSystem({ scene, onStatus, onBuildingSelected }) {
  sceneRef = scene;
  statusCallback = onStatus;
  selectBuildingCallback = onBuildingSelected;

  placedBuildingsGroup = new THREE.Group();
  placedBuildingsGroup.name = "Placed Buildings";
  scene.add(placedBuildingsGroup);

  rebuildOccupancyFromState();
}

export function restorePlacedBuildingsFromState() {
  if (!placedBuildingsGroup) return;

  placedBuildingsGroup.clear();
  rebuildOccupancyFromState();

  gameState.buildings.forEach((building) => {
    const definition = buildingDefinitions[building.definitionId];
    if (!definition) return;

    const mesh = createBuildingMesh(definition, false);
    mesh.position.set(building.position.x, 0.35, building.position.z);

    if (building.conveyor) {
      applyConveyorRotation(mesh, definition, building.conveyor.direction);
    }

    mesh.userData.building = building;
    placedBuildingsGroup.add(mesh);
  });
}

export function startPlacement(buildingId) {
  selectedBuildingId = buildingId;
  clearPreview();

  const definition = buildingDefinitions[buildingId];
  previewMesh = createBuildingMesh(definition, true);
  previewMesh.name = `${definition.name} Preview`;
  applyConveyorRotation(previewMesh, definition, currentConveyorDirection);
  sceneRef.add(previewMesh);

  statusCallback?.(`Placing ${definition.name}`);
}

export function cancelPlacement() {
  selectedBuildingId = null;
  clearPreview();
  statusCallback?.("Build cancelled");
}

export function isPlacementActive() {
  return Boolean(selectedBuildingId);
}

export function rotatePlacementDirection() {
  if (!selectedBuildingId) return;

  const definition = buildingDefinitions[selectedBuildingId];
  if (!definition?.isConveyor) return;

  const index = directions.indexOf(currentConveyorDirection);
  currentConveyorDirection = directions[(index + 1) % directions.length];

  if (previewMesh) {
    applyConveyorRotation(previewMesh, definition, currentConveyorDirection);
  }

  statusCallback?.(`Conveyor direction: ${currentConveyorDirection}`);
}

export function updatePlacementPreview(position, depositObject) {
  if (!selectedBuildingId || !previewMesh || !position) return;

  const snapped = snapToGrid(position);
  previewMesh.position.set(snapped.x, 0.25, snapped.z);

  const validation = validatePlacement(selectedBuildingId, snapped, depositObject);
  setPreviewValid(previewMesh, validation.ok);
}

export function tryPlaceBuilding(position, depositObject) {
  if (!selectedBuildingId || !position) return false;

  const definition = buildingDefinitions[selectedBuildingId];
  const snapped = snapToGrid(position);
  const validation = validatePlacement(selectedBuildingId, snapped, depositObject);

  if (!validation.ok) {
    statusCallback?.(validation.reason);
    return false;
  }

  if (!spendCost(definition.cost)) {
    statusCallback?.("Not enough resources");
    return false;
  }

  const mesh = createBuildingMesh(definition, false);
  mesh.position.set(snapped.x, 0.35, snapped.z);
  applyConveyorRotation(mesh, definition, currentConveyorDirection);

  const buildingData = {
    id: `${definition.id}_${Date.now()}`,
    definitionId: definition.id,
    name: definition.name,
    type: definition.type,
    size: definition.size,
    footprintSize: definition.footprintSize ?? 2,
    position: { x: snapped.x, z: snapped.z },
    description: definition.description
  };

  if (definition.isMachine) {
    const outputResourceId = getDepositOutputResourceId(depositObject);
    buildingData.machine = createMachineState(definition, { outputResourceId });
  }

  if (definition.isStorage) {
    buildingData.storage = {
      capacity: definition.storageCapacity ?? 100,
      items: {}
    };
  }

  if (definition.isConveyor) {
    buildingData.conveyor = {
      direction: currentConveyorDirection,
      transferInterval: definition.transferInterval ?? 1,
      transferTimer: 0,
      carriedItem: null
    };
  }

  if (definition.allowedPlacement === "deposit" && depositObject?.userData?.worldObject) {
    buildingData.depositId = depositObject.userData.worldObject.id;
  }

  mesh.userData.building = buildingData;
  placedBuildingsGroup.add(mesh);
  addBuilding(buildingData);

  getCellsForBuilding(snapped, buildingData.footprintSize).forEach((cell) => occupiedCells.add(cell));

  if (buildingData.depositId) {
    minedDeposits.add(buildingData.depositId);
  }

  statusCallback?.(`${definition.name} placed`);
  selectBuildingCallback?.(mesh);

  cancelPlacement();
  return true;
}

export function getPlacedBuildingFromObject(object) {
  let current = object;
  while (current) {
    if (current.userData?.building) return current;
    current = current.parent;
  }
  return null;
}

function rebuildOccupancyFromState() {
  occupiedCells.clear();
  minedDeposits.clear();
  reserveInitialWorldObjectFootprints();

  gameState.buildings.forEach((building) => {
    getCellsForBuilding(building.position, building.footprintSize ?? 2).forEach((cell) => occupiedCells.add(cell));

    if (building.depositId) {
      minedDeposits.add(building.depositId);
    }
  });
}

function getDepositOutputResourceId(depositObject) {
  const worldObject = depositObject?.userData?.worldObject;
  if (!worldObject) return null;
  if (worldObject.id.includes("iron")) return "ironOre";
  if (worldObject.id.includes("copper")) return "copperOre";
  return null;
}

function reserveInitialWorldObjectFootprints() {
  reserveFootprint({ x: 0, z: 0 }, 3);
  reserveFootprint({ x: -12, z: -6 }, 2);
  reserveFootprint({ x: 12, z: 6 }, 2);
}

function reserveFootprint(position, footprintSize) {
  getCellsForBuilding(position, footprintSize).forEach((cell) => occupiedCells.add(cell));
}

function validatePlacement(buildingId, position, depositObject) {
  const definition = buildingDefinitions[buildingId];

  if (Math.abs(position.x) > WORLD_LIMIT || Math.abs(position.z) > WORLD_LIMIT) {
    return { ok: false, reason: "Outside build area" };
  }

  if (definition.allowedPlacement === "deposit") {
    const worldObject = depositObject?.userData?.worldObject;

    if (!worldObject || worldObject.type !== "Resource Deposit") {
      return { ok: false, reason: "Basic Miner must be placed on a deposit" };
    }

    if (minedDeposits.has(worldObject.id)) {
      return { ok: false, reason: "This deposit already has a miner" };
    }

    const depositPosition = new THREE.Vector3(depositObject.position.x, 0, depositObject.position.z);
    const distance = depositPosition.distanceTo(new THREE.Vector3(position.x, 0, position.z));

    if (distance > 2.25) {
      return { ok: false, reason: "Place miner directly on the deposit" };
    }

    return { ok: true };
  }

  const cells = getCellsForBuilding(position, definition.footprintSize ?? 2);
  const blocked = cells.some((cell) => occupiedCells.has(cell));

  if (blocked) {
    return { ok: false, reason: "Build area is occupied" };
  }

  return { ok: true };
}

function snapToGrid(position) {
  return {
    x: Math.round(position.x / CELL_SIZE) * CELL_SIZE,
    z: Math.round(position.z / CELL_SIZE) * CELL_SIZE
  };
}

function worldToCell(position) {
  return {
    x: Math.round(position.x / CELL_SIZE),
    z: Math.round(position.z / CELL_SIZE)
  };
}

function getCellsForBuilding(position, footprintSize) {
  const center = worldToCell(position);
  const cells = [];

  if (footprintSize === 1) {
    return [`${center.x},${center.z}`];
  }

  if (footprintSize === 2) {
    cells.push(
      `${center.x},${center.z}`,
      `${center.x + 1},${center.z}`,
      `${center.x},${center.z + 1}`,
      `${center.x + 1},${center.z + 1}`
    );
    return cells;
  }

  if (footprintSize === 3) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        cells.push(`${center.x + dx},${center.z + dz}`);
      }
    }
    return cells;
  }

  return [`${center.x},${center.z}`];
}

function createBuildingMesh(definition, isPreview) {
  if (definition.isConveyor) {
    return createConveyorMesh(definition, isPreview);
  }

  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: getBuildingColor(definition.id),
    emissive: isPreview ? 0x153f48 : 0x071f28,
    roughness: 0.58,
    metalness: 0.45,
    transparent: isPreview,
    opacity: isPreview ? 0.55 : 1
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 3.2), material);
  body.castShadow = !isPreview;
  body.receiveShadow = true;
  body.position.y = 0.8;
  group.add(body);

  if (definition.id === "basicMiner") {
    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, 1.8, 12), material);
    drill.rotation.x = Math.PI / 2;
    drill.position.set(0, 0.9, 1.6);
    group.add(drill);
  }

  if (definition.id === "basicProcessor") {
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 2.2), material);
    top.position.y = 1.8;
    group.add(top);
  }

  if (definition.id === "smallStorage") {
    const lid = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 3.4), material);
    lid.position.y = 1.75;
    group.add(lid);
  }

  group.userData.definition = definition;
  return group;
}

function createConveyorMesh(definition, isPreview) {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color: 0x364a55,
    emissive: isPreview ? 0x153f48 : 0x061f26,
    roughness: 0.62,
    metalness: 0.4,
    transparent: isPreview,
    opacity: isPreview ? 0.55 : 1
  });

  const belt = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.25, 1.55), material);
  belt.position.y = 0.18;
  belt.castShadow = !isPreview;
  belt.receiveShadow = true;
  group.add(belt);

  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: 0x6ee7ff,
    transparent: isPreview,
    opacity: isPreview ? 0.75 : 1
  });

  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.75, 3), arrowMaterial);
  arrow.name = "Conveyor Direction Arrow";
  arrow.position.set(0.35, 0.42, 0);
  arrow.rotation.z = -Math.PI / 2;
  group.add(arrow);

  group.userData.definition = definition;
  return group;
}

function applyConveyorRotation(mesh, definition, direction) {
  if (!definition?.isConveyor) return;
  mesh.rotation.y = directionRotations[direction] ?? 0;
}

function getBuildingColor(buildingId) {
  if (buildingId === "basicMiner") return 0x4b6f7b;
  if (buildingId === "basicProcessor") return 0x49658f;
  if (buildingId === "smallStorage") return 0x5d6572;
  return 0x506070;
}

function setPreviewValid(mesh, isValid) {
  mesh.traverse((child) => {
    if (!child.material || !child.material.emissive) return;
    child.material.emissive.set(isValid ? 0x145d45 : 0x5d1c1c);
  });
}

function clearPreview() {
  if (previewMesh) {
    sceneRef.remove(previewMesh);
    previewMesh = null;
  }
}
