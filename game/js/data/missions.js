export const missionDefinitions = {
  wakeCore: {
    id: "wakeCore",
    title: "Wake the Core",
    description: "Select the NEXUS Core and establish first contact.",
    type: "nexusContact",
    next: "gatherRawMaterials"
  },
  gatherRawMaterials: {
    id: "gatherRawMaterials",
    title: "Gather Raw Materials",
    description: "Collect enough raw ore to stabilize the colony foundation.",
    type: "ownResources",
    requirements: {
      ironOre: 20,
      copperOre: 10
    },
    next: "stabilizeNexus"
  },
  stabilizeNexus: {
    id: "stabilizeNexus",
    title: "Stabilize NEXUS Core",
    description: "Deliver raw materials to the NEXUS Core. Partial delivery is allowed.",
    type: "deliverResources",
    requirements: {
      ironOre: 20,
      copperOre: 10
    },
    next: "buildBasicMiner"
  },
  buildBasicMiner: {
    id: "buildBasicMiner",
    title: "Build Basic Miner",
    description: "Place at least one Basic Miner on a resource deposit.",
    type: "buildings",
    requirements: {
      basicMiner: 1
    },
    next: "produceIronPlate"
  },
  produceIronPlate: {
    id: "produceIronPlate",
    title: "Produce Iron Plate",
    description: "Produce or store at least 10 Iron Plate across your network.",
    type: "ownResources",
    requirements: {
      ironPlate: 10
    },
    next: "connectConveyor"
  },
  connectConveyor: {
    id: "connectConveyor",
    title: "Connect Conveyor",
    description: "Place at least one Basic Conveyor to begin material flow.",
    type: "buildings",
    requirements: {
      basicConveyor: 1
    },
    next: "startCopperProduction"
  },
  startCopperProduction: {
    id: "startCopperProduction",
    title: "Start Copper Production",
    description: "Produce or store at least 5 Copper Wire across your network.",
    type: "ownResources",
    requirements: {
      copperWire: 5
    },
    next: "deliverBasicMaterials"
  },
  deliverBasicMaterials: {
    id: "deliverBasicMaterials",
    title: "Deliver Basic Materials",
    description: "Deliver processed materials to the NEXUS Core. Partial delivery is allowed.",
    type: "deliverResources",
    requirements: {
      ironPlate: 25,
      copperWire: 15
    },
    next: "recoverMemoryFragment"
  },
  recoverMemoryFragment: {
    id: "recoverMemoryFragment",
    title: "Recover Memory Fragment 01",
    description: "NEXUS Core has enough material to restore its first corrupted memory block.",
    type: "memory",
    next: null
  }
};

export const firstMissionId = "wakeCore";
