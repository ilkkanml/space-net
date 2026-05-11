import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070d);
  scene.fog = new THREE.Fog(0x05070d, 60, 180);
  return scene;
}

export function createAsteroidGround(scene) {
  const groundGeometry = new THREE.CircleGeometry(36, 96);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b2028,
    roughness: 0.92,
    metalness: 0.08
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ringGeometry = new THREE.RingGeometry(36, 36.4, 96);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x1f6f86,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  scene.add(ring);

  return { ground, ring };
}
