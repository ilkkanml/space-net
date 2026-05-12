import * as THREE from "three";
import { createScene, createAsteroidGround } from "./render/scene.js";
import { createCamera, resizeCamera, rotateCamera, setCameraRotationInput, orbitCameraWithMouse, updateCamera, panCamera, zoomCamera } from "./render/camera.js";
import { addLighting } from "./render/lighting.js";
import { createGrid } from "./world/grid.js";
import { createWorldObjects, setObjectHover, setObjectSelected } from "./world/worldObjects.js";
import { updateSelectionPanel, refreshSelectionPanel } from "./ui/selectionPanel.js";
import { initResourceBar } from "./ui/resourceBar.js";
import { initBuildMenu, setActiveBuildButton, setRemoveModeActive } from "./ui/buildMenu.js";
import { initMissionPanel, refreshMissionPanel } from "./ui/missionPanel.js";
import { initEVAPanel, refreshEVAPanel } from "./ui/evaPanel.js";
import { initSaveLoadPanel, refreshSaveLoadPanel } from "./ui/saveLoadPanel.js";
import { addResource } from "./core/gameState.js";
import { initProductionSystem, updateProduction } from "./systems/productionSystem.js";
import { updateConveyors } from "./systems/conveyorSystem.js";
import { initMissionSystem, updateMissions } from "./systems/missionSystem.js";
import { initEVANotificationSystem, updateEVANotifications } from "./systems/evaNotificationSystem.js";
import { tryAutoLoadGame, installDeveloperDebugClearSave } from "./systems/saveLoadSystem.js";
import {
  initBuildSystem,
  restorePlacedBuildingsFromState,
  startPlacement,
  cancelPlacement,
  isPlacementActive,
  isConveyorPlacementActive,
  updatePlacementPreview,
  tryPlaceBuilding,
  getPlacedBuildingFromObject,
  rotatePlacementDirection,
  removePlacedBuilding,
  removePlacedBuildings,
  canRemoveBuilding,
  setRemoveHighlights,
  clearRemoveHighlights
} from "./systems/buildSystem.js";

tryAutoLoadGame();
installDeveloperDebugClearSave();

const canvas = document.querySelector("#game-canvas");
const statusText = document.querySelector("#status-text");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = createScene();
const camera = createCamera(window.innerWidth, window.innerHeight);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

addLighting(scene);
createAsteroidGround(scene);
createGrid(scene);
initResourceBar();
initProductionSystem({ onStatus: setStatus });
initMissionSystem({ onStatus: setStatus });
initMissionPanel();
initEVAPanel();
initSaveLoadPanel({ onStatus: setStatus });
initEVANotificationSystem();

const { selectableObjects } = createWorldObjects(scene);

initBuildSystem({
  scene,
  onStatus: setStatus,
  onBuildingSelected: (buildingMesh) => {
    updateSelectionPanel(buildingMesh);
  }
});
restorePlacedBuildingsFromState();

initBuildMenu({
  onSelectBuild: (buildingId) => {
    exitRemoveMode(false);
    clearWorldSelection();
    updateSelectionPanel(null);
    startPlacement(buildingId);
  },
  onCancelBuild: () => {
    exitRemoveMode(false);
    cancelPlacement();
    setActiveBuildButton(null);
    setRemoveModeActive(false);
  },
  onRemoveMode: () => {
    enterRemoveMode();
  },
  onDeleteSelected: () => {
    deleteRemoveSelection();
  }
});

const clock = new THREE.Clock();
let selectionRefreshTimer = 0;

const state = {
  isDragging: false,
  hasDragged: false,
  lastX: 0,
  lastY: 0,
  hoveredObject: null,
  selectedObject: null,
  cameraRotationDirection: 0,
  isCameraOrbitDragging: false,
  isBuildDragging: false,
  lastBuildCellKey: null,
  isRemoveMode: false,
  isRemoveDragging: false,
  lastRemoveCellKey: null,
  removeSelectionIds: new Set()
};

canvas.addEventListener("pointerdown", (event) => {
  updatePointer(event);
  canvas.setPointerCapture(event.pointerId);

  if (event.button === 1) {
    event.preventDefault();
    state.isCameraOrbitDragging = true;
    state.hasDragged = false;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    return;
  }

  if (event.button !== 0) return;

  if (state.isRemoveMode) {
    state.isRemoveDragging = true;
    state.hasDragged = false;
    state.lastRemoveCellKey = getBuildCellKey(getGroundPosition());
    selectRemoveTargetUnderPointer({ toggle: true });
    return;
  }

  if (isPlacementActive() && isConveyorPlacementActive()) {
    state.isBuildDragging = true;
    state.hasDragged = false;
    state.lastBuildCellKey = null;
    tryPlaceBuildingAtPointer();
    return;
  }

  state.isDragging = true;
  state.hasDragged = false;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
});

canvas.addEventListener("pointermove", (event) => {
  updatePointer(event);

  if (state.isCameraOrbitDragging) {
    event.preventDefault();
    const deltaX = event.clientX - state.lastX;
    const deltaY = event.clientY - state.lastY;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 1) {
      state.hasDragged = true;
      orbitCameraWithMouse(camera, deltaX, deltaY);
    }

    state.lastX = event.clientX;
    state.lastY = event.clientY;
    return;
  }

  if (state.isRemoveMode && state.isRemoveDragging) {
    const position = getGroundPosition();
    const cellKey = getBuildCellKey(position);
    if (cellKey !== state.lastRemoveCellKey) {
      state.lastRemoveCellKey = cellKey;
      selectRemoveTargetUnderPointer({ toggle: true });
    }
    return;
  }

  if (state.isBuildDragging) {
    const position = getGroundPosition();
    const depositObject = getWorldObjectUnderPointer();
    updatePlacementPreview(position, depositObject);

    const cellKey = getBuildCellKey(position);
    if (cellKey !== state.lastBuildCellKey) {
      state.lastBuildCellKey = cellKey;
      tryPlaceBuildingAtPointer();
    }

    return;
  }

  if (state.isDragging) {
    const deltaX = event.clientX - state.lastX;
    const deltaY = event.clientY - state.lastY;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 2) {
      state.hasDragged = true;
      panCamera(camera, deltaX, deltaY);
    }

    state.lastX = event.clientX;
    state.lastY = event.clientY;
    return;
  }

  if (isPlacementActive()) {
    const position = getGroundPosition();
    const depositObject = getWorldObjectUnderPointer();
    updatePlacementPreview(position, depositObject);
    return;
  }

  updateHover();
});

canvas.addEventListener("pointerup", (event) => {
  if (state.isCameraOrbitDragging) {
    state.isCameraOrbitDragging = false;
    canvas.releasePointerCapture(event.pointerId);
    return;
  }

  if (state.isRemoveMode && state.isRemoveDragging) {
    state.isRemoveDragging = false;
    state.lastRemoveCellKey = null;
    canvas.releasePointerCapture(event.pointerId);
    return;
  }

  if (state.isBuildDragging) {
    state.isBuildDragging = false;
    state.lastBuildCellKey = null;
    canvas.releasePointerCapture(event.pointerId);
    return;
  }

  state.isDragging = false;
  canvas.releasePointerCapture(event.pointerId);

  if (state.hasDragged) return;

  updatePointer(event);

  if (isPlacementActive()) {
    const placed = tryPlaceBuildingAtPointer();
    if (placed) refreshSaveLoadPanel();
    return;
  }

  selectObjectUnderPointer();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomCamera(camera, event.deltaY);
}, { passive: false });

canvas.addEventListener("auxclick", (event) => {
  if (event.button === 1) event.preventDefault();
});

canvas.addEventListener("contextmenu", (event) => {
  if (state.isCameraOrbitDragging) event.preventDefault();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "q") {
    state.cameraRotationDirection = -1;
    if (!event.repeat) rotateCamera(camera, -1);
  }

  if (key === "e") {
    state.cameraRotationDirection = 1;
    if (!event.repeat) rotateCamera(camera, 1);
  }

  if (key === "r") rotatePlacementDirection();

  if (key === "delete" || key === "backspace") {
    if (state.isRemoveMode) {
      deleteRemoveSelection();
    } else {
      deleteSelectedBuilding();
    }
  }

  if (key === "escape") {
    exitRemoveMode(true);
    cancelPlacement();
    setActiveBuildButton(null);
    setRemoveModeActive(false);
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if ((key === "q" && state.cameraRotationDirection === -1) ||
      (key === "e" && state.cameraRotationDirection === 1)) {
    state.cameraRotationDirection = 0;
  }
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeCamera(camera, window.innerWidth, window.innerHeight);
});

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function getGroundPosition() {
  raycaster.setFromCamera(pointer, camera);
  const point = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, point);
  return point;
}

function tryPlaceBuildingAtPointer() {
  const placed = tryPlaceBuilding(getGroundPosition(), getWorldObjectUnderPointer());

  if (!isPlacementActive()) {
    setActiveBuildButton(null);
  }

  if (placed) {
    refreshSaveLoadPanel();
  }

  return placed;
}

function getBuildCellKey(position) {
  const x = Math.round(position.x / 2);
  const z = Math.round(position.z / 2);
  return `${x},${z}`;
}

function getWorldObjectUnderPointer() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectableObjects, true);
  if (hits.length === 0) return null;

  let object = hits[0].object;
  while (object && !object.userData.worldObject) {
    object = object.parent;
  }

  return object || null;
}

function getSelectableUnderPointer() {
  const worldObject = getWorldObjectUnderPointer();
  if (worldObject) return worldObject;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);

  for (const hit of hits) {
    const building = getPlacedBuildingFromObject(hit.object);
    if (building) return building;
  }

  return null;
}

function updateHover() {
  const object = getWorldObjectUnderPointer();

  if (object === state.hoveredObject) return;

  if (state.hoveredObject && state.hoveredObject !== state.selectedObject) {
    setObjectHover(state.hoveredObject, false);
  }

  state.hoveredObject = object;

  if (state.hoveredObject && state.hoveredObject !== state.selectedObject) {
    setObjectHover(state.hoveredObject, true);
  }
}

function selectObjectUnderPointer() {
  const object = getSelectableUnderPointer();

  clearWorldSelection();

  state.selectedObject = object;

  if (state.selectedObject?.userData?.worldObject) {
    setObjectSelected(state.selectedObject, true);
    const worldObject = state.selectedObject.userData.worldObject;

    updateSelectionPanel(worldObject, () => {
      if (!worldObject.collectible) return;
      addResource(worldObject.resourceId, worldObject.collectionAmount);
    });

    return;
  }

  if (state.selectedObject?.userData?.building) {
    updateSelectionPanel(state.selectedObject);
    return;
  }

  updateSelectionPanel(null);
}


function enterRemoveMode() {
  cancelPlacement();
  setActiveBuildButton(null);
  setRemoveModeActive(true);
  state.isRemoveMode = true;
  state.isRemoveDragging = false;
  state.removeSelectionIds.clear();
  clearRemoveHighlights();
  clearWorldSelection();
  updateSelectionPanel(null);
  setStatus("Remove mode: click buildings or drag over conveyors, then Delete Selected");
}

function exitRemoveMode(clearPanel = true) {
  state.isRemoveMode = false;
  state.isRemoveDragging = false;
  state.lastRemoveCellKey = null;
  state.removeSelectionIds.clear();
  clearRemoveHighlights();
  if (clearPanel) updateSelectionPanel(null);
}

function getPlacedBuildingUnderPointer() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);

  for (const hit of hits) {
    const building = getPlacedBuildingFromObject(hit.object);
    if (building) return building;
  }

  return null;
}

function selectRemoveTargetUnderPointer({ toggle = false } = {}) {
  const object = getPlacedBuildingUnderPointer();
  const building = object?.userData?.building;

  if (!building || !canRemoveBuilding(building)) {
    return false;
  }

  if (toggle && state.removeSelectionIds.has(building.id)) {
    state.removeSelectionIds.delete(building.id);

    if (state.selectedObject?.userData?.building?.id === building.id) {
      state.selectedObject = null;
      updateSelectionPanel(null);
    }

    setRemoveHighlights([...state.removeSelectionIds]);
    setStatus(`${state.removeSelectionIds.size} selected for removal. Click Delete Selected.`);
    return true;
  }

  state.removeSelectionIds.add(building.id);
  state.selectedObject = object;
  updateSelectionPanel(object);
  setRemoveHighlights([...state.removeSelectionIds]);
  setStatus(`${state.removeSelectionIds.size} selected for removal. Click Delete Selected.`);
  return true;
}

function deleteRemoveSelection() {
  if (state.removeSelectionIds.size === 0) {
    setStatus("Remove mode: no selected building to delete");
    return;
  }

  const removedCount = removePlacedBuildings([...state.removeSelectionIds]);
  state.removeSelectionIds.clear();
  clearRemoveHighlights();
  state.selectedObject = null;
  updateSelectionPanel(null);
  refreshSaveLoadPanel();
  setStatus(`${removedCount} selected building${removedCount > 1 ? "s" : ""} deleted`);
}

function deleteSelectedBuilding() {
  const building = state.selectedObject?.userData?.building;
  if (!building || !canRemoveBuilding(building)) return;

  const removed = removePlacedBuilding(building.id);
  if (removed) {
    state.selectedObject = null;
    updateSelectionPanel(null);
  }
}

function clearWorldSelection() {
  if (state.selectedObject?.userData?.worldObject) {
    setObjectSelected(state.selectedObject, false);
  }
  state.selectedObject = null;
}

function setStatus(message) {
  statusText.textContent = message;
}

function animate() {
  const deltaTime = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  setCameraRotationInput(camera, state.cameraRotationDirection, deltaTime);
  updateCamera(camera, deltaTime);

  updateProduction(deltaTime);
  updateConveyors(deltaTime);
  updateMissions();
  updateEVANotifications();

  selectionRefreshTimer += deltaTime;
  if (selectionRefreshTimer >= 0.25) {
    selectionRefreshTimer = 0;
    refreshSelectionPanel();
    refreshMissionPanel();
    refreshEVAPanel();
    refreshSaveLoadPanel();
  }

  selectableObjects.forEach((object) => {
    if (object.name === "NEXUS Core") {
      object.rotation.y = elapsed * 0.25;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setStatus("Scene ready");
animate();
