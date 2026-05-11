export const buildingDefinitions = {
  basicMiner: {
    id: "basicMiner",
    name: "Basic Miner",
    type: "Extraction",
    size: "2x2",
    footprintSize: 2,
    cost: {
      ironOre: 10,
      copperOre: 5
    },
    allowedPlacement: "deposit",
    isMachine: true,
    machineKind: "miner",
    duration: 3,
    outputCapacity: 20,
    description: "Basic extraction unit. Produces raw ore into its output buffer."
  },
  basicProcessor: {
    id: "basicProcessor",
    name: "Basic Processor",
    type: "Processing",
    size: "2x2",
    footprintSize: 2,
    cost: {
      ironOre: 15,
      copperOre: 5
    },
    allowedPlacement: "empty",
    isMachine: true,
    machineKind: "processor",
    duration: 4,
    outputCapacity: 20,
    inputCapacity: 20,
    description: "Basic processing unit. Converts ore into processed materials using selected recipe."
  },
  basicConveyor: {
    id: "basicConveyor",
    name: "Basic Conveyor",
    type: "Logistics",
    size: "1x1",
    footprintSize: 1,
    cost: {
      ironOre: 1
    },
    allowedPlacement: "empty",
    isConveyor: true,
    transferInterval: 1,
    description: "Basic directional item transfer tile. Rotate direction with R before placing."
  },
  smallStorage: {
    id: "smallStorage",
    name: "Small Storage",
    type: "Storage",
    size: "2x2",
    footprintSize: 2,
    cost: {
      ironOre: 10
    },
    allowedPlacement: "empty",
    isStorage: true,
    storageCapacity: 100,
    description: "Small item storage. Holds up to 100 total items."
  }
};

export const buildingOrder = [
  "basicMiner",
  "basicProcessor",
  "basicConveyor",
  "smallStorage"
];
