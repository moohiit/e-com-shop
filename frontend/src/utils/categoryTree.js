/**
 * Shared helpers for building and working with nested category trees.
 * Used by ProductListing (filter sidebar) and AddProduct (multi-select).
 */

// Build a nested tree from the flat API list using the `parents` field.
export const buildCategoryTree = (flatCategories = []) => {
  const map = new Map();
  const roots = [];

  for (const cat of flatCategories) {
    map.set(cat._id, { ...cat, children: [] });
  }

  for (const cat of flatCategories) {
    const node = map.get(cat._id);
    const parentIds = (cat.parents || []).map((p) =>
      typeof p === "object" ? p._id : p
    );

    if (parentIds.length === 0) {
      roots.push(node);
    } else {
      let attached = false;
      for (const pid of parentIds) {
        const parentNode = map.get(pid);
        if (parentNode) {
          parentNode.children.push(node);
          attached = true;
        }
      }
      if (!attached) roots.push(node);
    }
  }

  return roots;
};

// Recursively collect all descendant IDs (including self).
export const collectDescendantIds = (node) => {
  let ids = [node._id];
  for (const child of node.children || []) {
    ids = ids.concat(collectDescendantIds(child));
  }
  return ids;
};

// Check if any descendant is in the given set of IDs.
export const hasSelectedDescendant = (node, selectedIds) => {
  if (selectedIds.has(node._id)) return true;
  for (const child of node.children || []) {
    if (hasSelectedDescendant(child, selectedIds)) return true;
  }
  return false;
};
