export const missions = [
  {
    id: "gatherRawMaterials",
    title: "Gather Raw Materials",
    description: "Collect basic raw resources for the colony.",
    type: "collect",
    requirements: {
      ironOre: 20,
      copperOre: 10
    }
  },
  {
    id: "stabilizeNexus",
    title: "Stabilize NEXUS Core",
    description: "Deliver gathered resources to the NEXUS Core.",
    type: "deliver",
    requirements: {
      ironOre: 20,
      copperOre: 10
    }
  }
];

export const firstMissionId = missions[0].id;
