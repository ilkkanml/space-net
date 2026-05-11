import * as THREE from "three";
import { createScene, createAsteroidGround } from "./render/scene.js";
import { createCamera, resizeCamera, rotateCamera, panCamera, zoomCamera } from "./render/camera.js";
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
  canRemoveBuilding
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
    state.isRemoveMode = false;
    clearWorldSelection();
    updateSelectionPanel(null);
    startPlacement(buildingId);
  },
  onCancelBuild: () => {
    state.isRemoveMode = false;
    cancelPlacement();
    setActiveBuildButton(null);
    setRemoveModeActive(false);
  },
  onRemoveMode: () => {
    cancelPlacement();
    setActiveBuildButton(null);
    state.isRemoveMode = true;
    clearWorldSelection();
    updateSelectionPanel(null);
    setStatus("Remove mode: click a placed building");
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
  isBuildDragging: false,
  lastBuildCellKey: null,
  isRemoveMode: false
};

canvas.addEventListener("pointerdown", (event) => {
  updatePointer(event);
  canvas.setPointerCapture(event.pointerId);

  if (state.isRemoveMode) {
    state.hasDragged = false;
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

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "q") rotateCamera(camera, -1);
  if (key === "e") rotateCamera(camera, 1);
  if (key === "r") rotatePlacementDirection();

  if (key === "delete" || key === "backspace") {
    deleteSelectedBuilding();
  }

  if (key === "escape") {
    state.isRemoveMode = false;
    cancelPlacement();
    setActiveBuildButton(null);
    setRemoveModeActive(false);
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


function removeBuildingUnderPointer() {
  const object = getSelectableUnderPointer();
  const building = object?.userData?.building;

  if (!building || !canRemoveBuilding(building)) {
    setStatus("Remove mode: no removable building selected");
    return;
  }

  const removed = removePlacedBuilding(building.id);
  if (removed) {
    state.selectedObject = null;
    updateSelectionPanel(null);
  }
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
