export const recipes = {
  ironPlate: {
    id: "ironPlate",
    name: "Iron Plate",
    duration: 4,
    inputs: [
      { resourceId: "ironOre", amount: 2 }
    ],
    output: {
      ironPlate: 1
    }
  },
  copperWire: {
    id: "copperWire",
    name: "Copper Wire",
    duration: 4,
    inputs: [
      { resourceId: "copperOre", amount: 2 }
    ],
    output: {
      copperWire: 1
    }
  },
  ironRod: {
    id: "ironRod",
    name: "Iron Rod",
    duration: 3,
    inputs: [
      { resourceId: "ironPlate", amount: 1 }
    ],
    output: {
      ironRod: 2
    }
  },
  copperCable: {
    id: "copperCable",
    name: "Copper Cable",
    duration: 3,
    inputs: [
      { resourceId: "copperWire", amount: 2 }
    ],
    output: {
      copperCable: 1
    }
  },
  basicFrame: {
    id: "basicFrame",
    name: "Basic Frame",
    duration: 8,
    inputs: [
      { resourceId: "ironRod", amount: 2 },
      { resourceId: "ironPlate", amount: 1 },
      { resourceId: "copperCable", amount: 2 }
    ],
    output: {
      basicFrame: 1
    }
  }
};

export const recipeOrder = [
  "ironPlate",
  "copperWire",
  "ironRod",
  "copperCable",
  "basicFrame"
];

export function getRecipeInputs(recipe) {
  if (!recipe) return [];

  if (Array.isArray(recipe.inputs)) {
    return recipe.inputs.filter((input) => input?.resourceId && input.amount > 0);
  }

  if (recipe.input && typeof recipe.input === "object") {
    return Object.entries(recipe.input).map(([resourceId, amount]) => ({ resourceId, amount }));
  }

  return [];
}
