import * as THREE from "three";

export function addLighting(scene) {
  const ambient = new THREE.AmbientLight(0x9db6c8, 0.85);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.45);
  key.position.set(18, 28, 12);
  key.castShadow = true;
  scene.add(key);

  const cyan = new THREE.PointLight(0x45dfff, 1.6, 70);
  cyan.position.set(0, 8, 0);
  scene.add(cyan);

  return { ambient, key, cyan };
}
