export const buildingDefinitions = {
  basicMiner: {
    id: "basicMiner",
    name: "Basic Miner",
    type: "Extraction",
    size: "2x2",
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
  smallStorage: {
    id: "smallStorage",
    name: "Small Storage",
    type: "Storage",
    size: "2x2",
    cost: {
      ironOre: 10
    },
    allowedPlacement: "empty",
    isMachine: false,
    description: "Small item storage. Capacity logic will be added in Milestone 06."
  }
};

export const buildingOrder = [
  "basicMiner",
  "basicProcessor",
  "smallStorage"
];
