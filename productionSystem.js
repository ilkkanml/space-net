import * as THREE from "three";

export function addLighting(scene) {
  const ambient = new THREE.AmbientLight(0x9db6c8, 0.85);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(18, 30, 12);
  key.castShadow = true;
  scene.add(key);

  const cyan = new THREE.PointLight(0x45dfff, 2.0, 80);
  cyan.position.set(0, 8, 0);
  scene.add(cyan);

  const orange = new THREE.PointLight(0xff8b32, 1.0, 40);
  orange.position.set(-12, 5, -8);
  scene.add(orange);

  return { ambient, key, cyan, orange };
}
