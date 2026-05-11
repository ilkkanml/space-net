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
    description: "Basic extraction unit. In this milestone it can only be placed on Iron or Copper deposits."
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
    description: "Basic processing unit. Production recipes will be added in a later milestone."
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
    description: "Small item storage. Capacity logic will be added in a later milestone."
  }
};

export const buildingOrder = [
  "basicMiner",
  "basicProcessor",
  "smallStorage"
];
