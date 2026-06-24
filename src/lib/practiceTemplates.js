// Instrument types
export const instrumentTypes = ["Piano", "Guitar", "Ukulele", "Voice", "Custom"];

// Assignment categories
export const assignmentCategories = [
  { id: "warmup", label: "Warmup", color: "#ff6b6b" },
  { id: "technique", label: "Technique", color: "#ffd93d" },
  { id: "theory", label: "Theory", color: "#6bcf7f" },
  { id: "pieces", label: "Pieces", color: "#4a90e2" },
  { id: "performance", label: "Performance", color: "#b85cff" },
];

// Get color for category
export const getCategoryColor = (categoryId) => {
  const category = assignmentCategories.find((c) => c.id === categoryId);
  return category?.color || "#667eea";
};
