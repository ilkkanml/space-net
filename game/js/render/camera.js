import * as THREE from "three";

const CAMERA_DISTANCE = 57;
const DEFAULT_CAMERA_PITCH = Math.atan2(34, 46); // Keeps the original v0.1 isometric viewing angle.
const MIN_CAMERA_PITCH = THREE.MathUtils.degToRad(24); // Lower, landscape/city-builder inspection angle.
const MAX_CAMERA_PITCH = THREE.MathUtils.degToRad(78); // Near bird-view, but not locked straight down.
const CAMERA_ROTATION_STEP = Math.PI / 12; // 15 degrees per keyboard tap.
const CAMERA_ROTATION_SPEED = Math.PI * 0.65; // Smooth continuous orbit while holding Q/E.
const MOUSE_ROTATION_SPEED = 0.008;
const MOUSE_TILT_SPEED = 0.005;
const CAMERA_SMOOTHING = 12;

export function createCamera(width, height) {
  const aspect = width / height;
  const viewSize = 38;

  const camera = new THREE.OrthographicCamera(
    (-viewSize * aspect) / 2,
    (viewSize * aspect) / 2,
    viewSize / 2,
    -viewSize / 2,
    0.1,
    300
  );

  camera.userData.angle = Math.PI / 4;
  camera.userData.targetAngle = Math.PI / 4;
  camera.userData.pitch = DEFAULT_CAMERA_PITCH;
  camera.userData.targetPitch = DEFAULT_CAMERA_PITCH;
  camera.userData.target = new THREE.Vector3(0, 0, 0);
  updateCameraPosition(camera);

  return camera;
}

export function resizeCamera(camera, width, height) {
  const aspect = width / height;
  const baseViewSize = 38;
  const viewSize = baseViewSize / camera.zoom;

  camera.left = (-viewSize * aspect) / 2;
  camera.right = (viewSize * aspect) / 2;
  camera.top = viewSize / 2;
  camera.bottom = -viewSize / 2;
  camera.updateProjectionMatrix();
}

export function rotateCamera(camera, direction) {
  camera.userData.targetAngle += direction * CAMERA_ROTATION_STEP;
}

export function setCameraRotationInput(camera, direction, deltaTime) {
  if (!direction) return;
  camera.userData.targetAngle += direction * CAMERA_ROTATION_SPEED * deltaTime;
}

export function orbitCameraWithMouse(camera, deltaX, deltaY) {
  camera.userData.targetAngle += deltaX * MOUSE_ROTATION_SPEED;
  camera.userData.targetPitch = clampPitch(
    camera.userData.targetPitch - deltaY * MOUSE_TILT_SPEED
  );
}

export function updateCamera(camera, deltaTime) {
  const targetAngle = camera.userData.targetAngle ?? camera.userData.angle;
  const targetPitch = clampPitch(camera.userData.targetPitch ?? camera.userData.pitch);
  const smoothing = 1 - Math.exp(-CAMERA_SMOOTHING * deltaTime);

  camera.userData.angle = THREE.MathUtils.lerp(
    camera.userData.angle,
    targetAngle,
    smoothing
  );

  camera.userData.pitch = THREE.MathUtils.lerp(
    camera.userData.pitch,
    targetPitch,
    smoothing
  );

  updateCameraPosition(camera);
}

export function panCamera(camera, deltaX, deltaY) {
  const angle = camera.userData.angle;

  const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
  const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));

  const panScale = 0.04 / camera.zoom;
  camera.userData.target.addScaledVector(right, -deltaX * panScale);
  camera.userData.target.addScaledVector(forward, -deltaY * panScale);

  updateCameraPosition(camera);
}

export function zoomCamera(camera, deltaY) {
  // City-builder standard: mouse wheel changes zoom only. It does not auto-change camera pitch/tilt.
  const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
  camera.zoom = THREE.MathUtils.clamp(camera.zoom * zoomFactor, 0.55, 2.5);
  camera.updateProjectionMatrix();
}

function updateCameraPosition(camera) {
  const angle = camera.userData.angle;
  const pitch = clampPitch(camera.userData.pitch);
  const target = camera.userData.target;
  const horizontalDistance = Math.cos(pitch) * CAMERA_DISTANCE;
  const height = Math.sin(pitch) * CAMERA_DISTANCE;

  camera.position.set(
    target.x + Math.sin(angle) * horizontalDistance,
    target.y + height,
    target.z + Math.cos(angle) * horizontalDistance
  );

  camera.lookAt(target);
}

function clampPitch(value) {
  return THREE.MathUtils.clamp(value, MIN_CAMERA_PITCH, MAX_CAMERA_PITCH);
}
