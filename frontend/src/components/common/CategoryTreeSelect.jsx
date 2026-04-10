import { useState, useEffect, useMemo } from "react";
import { ChevronRight, FolderOpen, Check } from "lucide-react";
import { buildCategoryTree, hasSelectedDescendant } from "../../utils/categoryTree";

/**
 * Multi-select cascading category tree with checkboxes.
 *
 * Props:
 *   categories   - flat array from API (with `parents` populated)
 *   value        - array of selected category IDs
 *   onChange      - (newIds: string[]) => void
 *   loading?     - show skeleton while loading
 *   placeholder? - text when nothing selected
 */

const TreeNode = ({ node, depth, selectedSet, onToggle }) => {
  const hasChildren = node.children?.length > 0;
  const isChecked = selectedSet.has(node._id);
  const childSelected = hasChildren && hasSelectedDescendant(node, selectedSet);

  const [expanded, setExpanded] = useState(childSelected);

  useEffect(() => {
    if (childSelected) setExpanded(true);
  }, [childSelected]);

  return (
    <div>
      <div
        className="flex items-center group"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="p-0.5 mr-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {/* Checkbox + label */}
        <label
          className={`flex items-center gap-2 flex-1 min-w-0 px-2 py-1.5 rounded cursor-pointer transition-colors text-sm capitalize ${
            isChecked
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <span
            className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              isChecked
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-400 dark:border-gray-600 group-hover:border-blue-500"
            }`}
          >
            {isChecked && <Check size={11} strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={() => onToggle(node._id)}
          />
          {hasChildren && !expanded && (
            <FolderOpen
              size={13}
              className="shrink-0 text-gray-400 dark:text-gray-500"
            />
          )}
          <span className="truncate">{node.name}</span>
          {hasChildren && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
              ({node.children.length})
            </span>
          )}
        </label>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              selectedSet={selectedSet}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTreeSelect = ({
  categories = [],
  value = [],
  onChange,
  loading = false,
  placeholder = "Select categories",
}) => {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const handleToggle = (id) => {
    const next = new Set(value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange([...next]);
  };

  // Selected names for the summary line
  const selectedNames = useMemo(
    () =>
      categories
        .filter((c) => selectedSet.has(c._id))
        .map((c) => c.name),
    [categories, selectedSet]
  );

  if (loading) {
    return (
      <div className="border rounded-lg p-3 space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Summary bar */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm">
        {selectedNames.length === 0 ? (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded capitalize"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
        {tree.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            No categories available
          </p>
        ) : (
          tree.map((root) => (
            <TreeNode
              key={root._id}
              node={root}
              depth={0}
              selectedSet={selectedSet}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryTreeSelect;
