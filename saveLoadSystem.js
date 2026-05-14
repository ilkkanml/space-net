import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070d);
  scene.fog = new THREE.Fog(0x05070d, 70, 190);
  return scene;
}

export function createAsteroidGround(scene) {
  const groundGeometry = new THREE.CircleGeometry(42, 128);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b2028,
    roughness: 0.92,
    metalness: 0.08
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "Asteroid Ground";
  scene.add(ground);

  const ringGeometry = new THREE.RingGeometry(42, 42.4, 128);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x1f6f86,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.name = "Asteroid Edge";
  scene.add(ring);

  return { ground, ring };
}
