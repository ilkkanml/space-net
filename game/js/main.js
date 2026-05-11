import * as THREE from "three";
import { createScene, createAsteroidGround } from "./render/scene.js";
import { createCamera, resizeCamera, rotateCamera, panCamera, zoomCamera } from "./render/camera.js";
import { addLighting } from "./render/lighting.js";

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
addLighting(scene);
createAsteroidGround(scene);

const clock = new THREE.Clock();

const state = {
  isDragging: false,
  lastX: 0,
  lastY: 0
};

canvas.addEventListener("pointerdown", (event) => {
  state.isDragging = true;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.isDragging) return;

  const deltaX = event.clientX - state.lastX;
  const deltaY = event.clientY - state.lastY;

  panCamera(camera, deltaX, deltaY);

  state.lastX = event.clientX;
  state.lastY = event.clientY;
});

canvas.addEventListener("pointerup", (event) => {
  state.isDragging = false;
  canvas.releasePointerCapture(event.pointerId);
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

function animate() {
  const elapsed = clock.getElapsedTime();

  // Subtle scene life for milestone visibility.
  scene.rotation.y = Math.sin(elapsed * 0.08) * 0.005;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

statusText.textContent = "Scene ready";
animate();
