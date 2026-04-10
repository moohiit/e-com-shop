import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFetchAllProductsQuery } from "../../features/products/productApiSlice";
import { useFetchCategoriesQuery } from "../../features/category/categoryApiSlice";
import {
  Loader2,
  Filter,
  X,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Grid3x3,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../../components/products/ProductCard";
import Pagination from "../../components/common/Pagination";
import { buildCategoryTree, collectDescendantIds } from "../../utils/categoryTree";

// ---- CategoryTreeItem — renders one node + its children ----
const CategoryTreeItem = ({
  node,
  depth = 0,
  selectedCategory,
  onSelect,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedCategory === node._id;

  // Auto-expand if this node or any descendant is selected
  const isDescendantSelected = useMemo(() => {
    if (!selectedCategory) return false;
    const ids = collectDescendantIds(node);
    return ids.includes(selectedCategory);
  }, [selectedCategory, node]);

  const [expanded, setExpanded] = useState(isDescendantSelected);

  // Keep in sync when selection changes externally
  useEffect(() => {
    if (isDescendantSelected) setExpanded(true);
  }, [isDescendantSelected]);

  return (
    <div>
      <div
        className="flex items-center group"
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="p-0.5 mr-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-transform"
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
          <span className="w-5" /> // Spacer to align leaf nodes
        )}

        {/* Category button */}
        <button
          type="button"
          onClick={() => onSelect(node._id)}
          className={`flex-1 text-left text-sm px-2 py-1.5 rounded capitalize transition-colors truncate ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
              : isDescendantSelected && !isSelected
              ? "text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {hasChildren && !expanded && (
            <FolderOpen
              size={13}
              className="inline mr-1.5 -mt-0.5 text-gray-400 dark:text-gray-500"
            />
          )}
          {node.name}
          {hasChildren && (
            <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
              ({node.children.length})
            </span>
          )}
        </button>
      </div>

      {/* Children — animated expand */}
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child._id}
              node={child}
              depth={depth + 1}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SORT_OPTIONS = [
  { value: "latest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const PRICE_PRESETS = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Over ₹10,000", min: 10000, max: undefined },
];

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "latest",
  page: 1,
};

const parseFromURL = (search) => {
  const p = new URLSearchParams(search);
  return {
    search: p.get("search") || "",
    category: p.get("category") || "",
    brand: p.get("brand") || "",
    minPrice: p.get("minPrice") || "",
    maxPrice: p.get("maxPrice") || "",
    sort: p.get("sort") || "latest",
    page: Number(p.get("page")) || 1,
  };
};

const filtersToParams = (f) => {
  const p = new URLSearchParams();
  if (f.search) p.set("search", f.search);
  if (f.category) p.set("category", f.category);
  if (f.brand) p.set("brand", f.brand);
  if (f.minPrice !== "" && f.minPrice !== null && f.minPrice !== undefined)
    p.set("minPrice", String(f.minPrice));
  if (f.maxPrice !== "" && f.maxPrice !== null && f.maxPrice !== undefined)
    p.set("maxPrice", String(f.maxPrice));
  if (f.sort && f.sort !== "latest") p.set("sort", f.sort);
  if (f.page > 1) p.set("page", String(f.page));
  return p;
};

const FilterGroup = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4 last:border-b-0 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-3"
      >
        <span className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-56 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  </div>
);

export default function ProductListing() {
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(() => parseFromURL(location.search));
  const [searchInput, setSearchInput] = useState(filters.search);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("comfortable"); // 'comfortable' | 'compact'

  // Sync state when the URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const next = parseFromURL(location.search);
    setFilters(next);
    setSearchInput(next.search);
  }, [location.search]);

  // Debounced search → URL
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== filters.search) {
        const next = { ...filters, search: searchInput, page: 1 };
        navigate(`?${filtersToParams(next).toString()}`, { replace: true });
      }
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const updateFilters = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = { ...filters, ...patch, page: resetPage ? 1 : filters.page };
      navigate(`?${filtersToParams(next).toString()}`, { replace: false });
    },
    [filters, navigate]
  );

  const { data: productsData, isLoading, isFetching } = useFetchAllProductsQuery({
    search: filters.search || undefined,
    category: filters.category || undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    sort: filters.sort || undefined,
    page: filters.page,
    limit: 12,
  });

  const { data: categoriesData } = useFetchCategoriesQuery();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || { total: 0, pages: 1, page: 1 };
  const categories = categoriesData?.categories || [];
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search)
      chips.push({ key: "search", label: `Search: "${filters.search}"` });
    if (filters.category) {
      const cat = categories.find(
        (c) => c._id === filters.category || c.slug === filters.category
      );
      // Build breadcrumb path (e.g. "Electronics › Phones › Smartphones")
      let label = cat?.name || filters.category;
      if (cat?.parents?.length > 0) {
        const parentNames = cat.parents
          .map((p) => {
            const parent = typeof p === "object" ? p : categories.find((c) => c._id === p);
            return parent?.name;
          })
          .filter(Boolean);
        if (parentNames.length > 0) {
          label = `${parentNames.join(" › ")} › ${cat.name}`;
        }
      }
      chips.push({ key: "category", label: `Category: ${label}` });
    }
    if (filters.brand) chips.push({ key: "brand", label: `Brand: ${filters.brand}` });
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || "0";
      const max = filters.maxPrice || "∞";
      chips.push({ key: "price", label: `₹${min} – ₹${max}` });
    }
    return chips;
  }, [filters, categories]);

  const removeChip = (key) => {
    if (key === "search") {
      setSearchInput("");
      updateFilters({ search: "" });
    } else if (key === "price") {
      updateFilters({ minPrice: "", maxPrice: "" });
    } else {
      updateFilters({ [key]: "" });
    }
  };

  const resetAll = () => {
    setSearchInput("");
    navigate("?", { replace: false });
    setDrawerOpen(false);
  };

  // ----- Filters panel (shared by sidebar + mobile drawer) -----
  const filtersPanel = (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h2>
        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Categories">
        <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
          {/* "All categories" reset button */}
          <button
            type="button"
            onClick={() => updateFilters({ category: "" })}
            className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
              !filters.category
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All categories
          </button>

          {/* Cascading tree */}
          {categoryTree.map((root) => (
            <CategoryTreeItem
              key={root._id}
              node={root}
              depth={0}
              selectedCategory={filters.category}
              onSelect={(id) => updateFilters({ category: id })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price Range">
        <div className="space-y-1.5 mb-3">
          {PRICE_PRESETS.map((preset) => {
            const active =
              String(filters.minPrice) === String(preset.min) &&
              String(filters.maxPrice) === String(preset.max ?? "");
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  updateFilters({
                    minPrice: preset.min || "",
                    maxPrice: preset.max ?? "",
                  })
                }
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                  active
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            placeholder="Min ₹"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            placeholder="Max ₹"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <input
          type="text"
          value={filters.brand}
          onChange={(e) => updateFilters({ brand: e.target.value })}
          placeholder="e.g. Sony, Nike…"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        />
      </FilterGroup>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header / search bar */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Shop Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total > 0
              ? `${pagination.total} products available`
              : "Browse our latest collection"}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by name…"
              className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* View toggle (desktop) */}
          <div className="hidden md:flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode("comfortable")}
              aria-label="Comfortable view"
              className={`p-1.5 rounded ${
                viewMode === "comfortable"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              aria-label="Compact view"
              className={`p-1.5 rounded ${
                viewMode === "compact"
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Grid3x3 size={16} />
            </button>
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            <Filter size={16} />
            Filters
            {activeChips.length > 0 && (
              <span className="ml-1 bg-white text-blue-600 text-[11px] font-bold rounded-full px-1.5">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Active:
            </span>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeChip(chip.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                {chip.label}
                <X size={12} />
              </button>
            ))}
            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sticky top-4">
              {filtersPanel}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className={`grid gap-5 ${
                  viewMode === "compact"
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-16 px-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Search size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No products found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  We couldn't find any products matching your filters.
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-5 transition-opacity ${
                    isFetching ? "opacity-60" : "opacity-100"
                  } ${
                    viewMode === "compact"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={pagination.page || filters.page}
                      totalPages={pagination.pages}
                      onPageChange={(p) =>
                        updateFilters({ page: p }, { resetPage: false })
                      }
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{filtersPanel}</div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Show {pagination.total} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
