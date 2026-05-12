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

function applyBuildingSelectionHighlight(object, active) {
  if (!object) return;

  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const material = child.material;

    if (!material.userData.originalEmissive && material.emissive) {
      material.userData.originalEmissive = material.emissive.clone();
      material.userData.originalEmissiveIntensity = material.emissiveIntensity ?? 0;
    }

    if (!material.emissive) return;

    if (active) {
      material.emissive.setHex(0x2dd4ff);
      material.emissiveIntensity = 0.45;
    } else {
      if (material.userData.originalEmissive) {
        material.emissive.copy(material.userData.originalEmissive);
      }

      material.emissiveIntensity = material.userData.originalEmissiveIntensity ?? 0;
    }
  });
}

function clearCurrentBuildingHighlight() {
  if (state.selectedObject?.userData?.building) {
    applyBuildingSelectionHighlight(state.selectedObject, false);
  }
}

function applyCurrentBuildingHighlight() {
  if (state.selectedObject?.userData?.building) {
    applyBuildingSelectionHighlight(state.selectedObject, true);
  }
}
