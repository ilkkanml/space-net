import * as THREE from "three";

export function createGrid(scene, size = 32, cellSize = 2) {
  const group = new THREE.Group();
  group.name = "World Grid";

  const half = (size * cellSize) / 2;
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x274456,
    transparent: true,
    opacity: 0.45
  });

  for (let i = 0; i <= size; i++) {
    const offset = -half + i * cellSize;

    const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-half, 0.05, offset),
      new THREE.Vector3(half, 0.05, offset)
    ]);
    const horizontal = new THREE.Line(horizontalGeometry, lineMaterial);
    group.add(horizontal);

    const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(offset, 0.05, -half),
      new THREE.Vector3(offset, 0.05, half)
    ]);
    const vertical = new THREE.Line(verticalGeometry, lineMaterial);
    group.add(vertical);
  }

  scene.add(group);
  return group;
}
