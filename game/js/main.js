import * as THREE from "three";
import { createScene, createAsteroidGround } from "./render/scene.js";
import { createCamera, resizeCamera, rotateCamera, panCamera, zoomCamera } from "./render/camera.js";
import { addLighting } from "./render/lighting.js";
import { createGrid } from "./world/grid.js";
import { createWorldObjects, setObjectHover, setObjectSelected } from "./world/worldObjects.js";
import { updateSelectionPanel } from "./ui/selectionPanel.js";
import { initResourceBar } from "./ui/resourceBar.js";
import { addResource } from "./core/gameState.js";

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

addLighting(scene);
createAsteroidGround(scene);
createGrid(scene);
initResourceBar();

const { selectableObjects } = createWorldObjects(scene);

const clock = new THREE.Clock();

const state = {
  isDragging: false,
  hasDragged: false,
  lastX: 0,
  lastY: 0,
  hoveredObject: null,
  selectedObject: null
};

canvas.addEventListener("pointerdown", (event) => {
  state.isDragging = true;
  state.hasDragged = false;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  updatePointer(event);

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

  updateHover();
});

canvas.addEventListener("pointerup", (event) => {
  state.isDragging = false;
  canvas.releasePointerCapture(event.pointerId);

  if (!state.hasDragged) {
    updatePointer(event);
    selectObjectUnderPointer();
  }
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomCamera(camera, event.deltaY);
}, { passive: false });

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "q") rotateCamera(camera, -1);
  if (key === "e") rotateCamera(camera, 1);
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

function getObjectUnderPointer() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectableObjects, true);
  if (hits.length === 0) return null;

  let object = hits[0].object;
  while (object && !object.userData.worldObject) {
    object = object.parent;
  }

  return object || null;
}

function updateHover() {
  const object = getObjectUnderPointer();

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
  const object = getObjectUnderPointer();

  if (state.selectedObject) {
    setObjectSelected(state.selectedObject, false);
  }

  state.selectedObject = object;

  if (state.selectedObject) {
    setObjectSelected(state.selectedObject, true);
    const worldObject = state.selectedObject.userData.worldObject;

    updateSelectionPanel(worldObject, () => {
      if (!worldObject.collectible) return;
      addResource(worldObject.resourceId, worldObject.collectionAmount);
    });
  } else {
    updateSelectionPanel(null);
  }
}

function animate() {
  const elapsed = clock.getElapsedTime();

  selectableObjects.forEach((object) => {
    if (object.name === "NEXUS Core") {
      object.rotation.y = elapsed * 0.25;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

statusText.textContent = "Scene ready";
animate();
