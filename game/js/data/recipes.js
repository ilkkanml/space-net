export const recipes = {
  ironPlate: {
    id: "ironPlate",
    name: "Iron Plate",
    duration: 4,
    input: {
      ironOre: 2
    },
    output: {
      ironPlate: 1
    }
  },
  copperWire: {
    id: "copperWire",
    name: "Copper Wire",
    duration: 4,
    input: {
      copperOre: 2
    },
    output: {
      copperWire: 1
    }
  }
};

export const recipeOrder = [
  "ironPlate",
  "copperWire"
];
