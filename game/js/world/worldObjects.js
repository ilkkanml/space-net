import * as THREE from "three";

export const worldObjectsData = [
  {
    id: "nexus_core_01",
    name: "NEXUS Core",
    type: "Core",
    size: "3x3",
    position: { x: 0, z: 0 },
    description: "Damaged colony command core. Future progression, missions and E.V.A. connection center."
  },
  {
    id: "iron_deposit_01",
    name: "Iron Deposit",
    type: "Resource Deposit",
    size: "2x2",
    position: { x: -12, z: -6 },
    description: "Raw iron source. Basic Miner will connect here in a later milestone."
  },
  {
    id: "copper_deposit_01",
    name: "Copper Deposit",
    type: "Resource Deposit",
    size: "2x2",
    position: { x: 12, z: 6 },
    description: "Raw copper source. Basic Miner will connect here in a later milestone."
  }
];

export function createWorldObjects(scene) {
  const selectableObjects = [];
  const group = new THREE.Group();
  group.name = "World Objects";

  worldObjectsData.forEach((data) => {
    const object = createObjectMesh(data);
    object.position.set(data.position.x, 0.15, data.position.z);
    object.userData.worldObject = data;
    object.userData.baseEmissive = object.material.emissive.clone();
    object.userData.baseColor = object.material.color.clone();

    group.add(object);
    selectableObjects.push(object);
  });

  scene.add(group);
  return { group, selectableObjects };
}

function createObjectMesh(data) {
  if (data.id.startsWith("nexus")) {
    const geometry = new THREE.CylinderGeometry(2.2, 2.8, 3.2, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1d3c4d,
      emissive: 0x073747,
      roughness: 0.55,
      metalness: 0.55
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = data.name;

    const beaconGeometry = new THREE.SphereGeometry(0.55, 24, 16);
    const beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0x57e7ff,
      transparent: true,
      opacity: 0.85
    });
    const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
    beacon.position.y = 2.1;
    mesh.add(beacon);

    return mesh;
  }

  const color = data.id.includes("iron") ? 0x8a8f95 : 0xb66a32;
  const emissive = data.id.includes("iron") ? 0x222629 : 0x3d1c08;

  const geometry = new THREE.DodecahedronGeometry(2.0, 0);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive,
    roughness: 0.92,
    metalness: 0.18
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.y = 0.55;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = data.name;
  return mesh;
}

export function setObjectHover(object, isHovered) {
  if (!object || !object.material) return;

  if (isHovered) {
    object.material.emissive.set(0x2a7488);
  } else if (!object.userData.isSelected) {
    object.material.emissive.copy(object.userData.baseEmissive);
  }
}

export function setObjectSelected(object, isSelected) {
  if (!object || !object.material) return;

  object.userData.isSelected = isSelected;

  if (isSelected) {
    object.material.emissive.set(0x5bdfff);
  } else {
    object.material.emissive.copy(object.userData.baseEmissive);
  }
}
