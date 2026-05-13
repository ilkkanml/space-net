export const missions = [
  {
    id: "contactNexus",
    title: "Contact NEXUS Core",
    description: "Click the NEXUS Core to establish the first command link.",
    type: "contact",
    progressLabel: "NEXUS contact",
    requirements: {}
  },
  {
    id: "gatherRawMaterials",
    title: "Gather Raw Materials",
    description: "Collect basic raw resources for the colony.",
    type: "collect",
    progressLabel: "collected",
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
    progressLabel: "delivered",
    requirements: {
      ironOre: 20,
      copperOre: 10
    }
  }
];

export const firstMissionId = missions[0].id;
