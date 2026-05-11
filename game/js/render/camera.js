import * as THREE from "three";

const CAMERA_DISTANCE = 42;
const CAMERA_HEIGHT = 32;

export function createCamera(width, height) {
  const aspect = width / height;
  const viewSize = 34;

  const camera = new THREE.OrthographicCamera(
    (-viewSize * aspect) / 2,
    (viewSize * aspect) / 2,
    viewSize / 2,
    -viewSize / 2,
    0.1,
    300
  );

  camera.userData.angle = Math.PI / 4;
  camera.userData.target = new THREE.Vector3(0, 0, 0);
  updateCameraPosition(camera);

  return camera;
}

export function resizeCamera(camera, width, height) {
  const aspect = width / height;
  const viewSize = 34 / camera.zoom;

  camera.left = (-viewSize * aspect) / 2;
  camera.right = (viewSize * aspect) / 2;
  camera.top = viewSize / 2;
  camera.bottom = -viewSize / 2;
  camera.updateProjectionMatrix();
}

export function rotateCamera(camera, direction) {
  camera.userData.angle += direction * (Math.PI / 2);
  updateCameraPosition(camera);
}

export function panCamera(camera, deltaX, deltaY) {
  const angle = camera.userData.angle;

  const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
  const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));

  const panScale = 0.035 / camera.zoom;
  camera.userData.target.addScaledVector(right, -deltaX * panScale);
  camera.userData.target.addScaledVector(forward, -deltaY * panScale);

  updateCameraPosition(camera);
}

export function zoomCamera(camera, deltaY) {
  const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
  camera.zoom = THREE.MathUtils.clamp(camera.zoom * zoomFactor, 0.55, 2.5);
  camera.updateProjectionMatrix();
}

function updateCameraPosition(camera) {
  const angle = camera.userData.angle;
  const target = camera.userData.target;

  camera.position.set(
    target.x + Math.sin(angle) * CAMERA_DISTANCE,
    CAMERA_HEIGHT,
    target.z + Math.cos(angle) * CAMERA_DISTANCE
  );

  camera.lookAt(target);
}
