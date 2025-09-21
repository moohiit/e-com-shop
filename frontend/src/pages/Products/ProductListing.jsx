import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFetchAllProductsQuery } from "../../features/products/productApiSlice";
import { useFetchCategoriesQuery } from "../../features/category/categoryApiSlice";
import { Loader2, Filter, X, Grid, List, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../../components/products/ProductCard";
import Pagination from "../../components/common/Pagination";
import { useSelector } from "react-redux";
import { selectCartItems } from "../../features/cart/cartSlice";
import { selectWishlistItems } from "../../features/wishlist/wishlistSlice";

export default function ProductListing() {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to parse query parameters
  const parseQueryParams = () => {
    const queryParams = new URLSearchParams(location.search);
    return {
      search: queryParams.get("search") || "",
      category: queryParams.get("category") || "all",
      brand: queryParams.get("brand") || "",
      minPrice: Number(queryParams.get("minPrice")) || 0,
      maxPrice: Number(queryParams.get("maxPrice")) || 10000,
      page: Number(queryParams.get("page")) || 1,
      sort: queryParams.get("sort") || "latest",
      sort: queryParams.get("sort") || "latest",
    };
  };

  // Initialize state from URL query parameters
  const [filters, setFilters] = useState(parseQueryParams());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Update state when URL changes
  useEffect(() => {
    setFilters(parseQueryParams());
  }, [location.search]);

  // Fetch data with current filters
  const { data: productsData, isLoading, isFetching } = useFetchAllProductsQuery({
    search: filters.search,
    category: filters.category !== "all" ? filters.category : undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    sort: filters.sort,
    page: filters.page,
    limit: 12,
    sort: filters.sort,
  });

  const { data: categoriesData } = useFetchCategoriesQuery();

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category !== "all") params.set("category", newFilters.category);
    if (newFilters.brand) params.set("brand", newFilters.brand);
    if (newFilters.minPrice > 0) params.set("minPrice", newFilters.minPrice.toString());
    if (newFilters.maxPrice < 10000) params.set("maxPrice", newFilters.maxPrice.toString());
    if (newFilters.sort !== "latest") params.set("sort", newFilters.sort);
    if (newFilters.page > 1) params.set("page", newFilters.page.toString());
    if (newFilters.sort !== "latest") params.set("sort", newFilters.sort);

    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleSortChange = (sortValue) => {
    handleFilterChange({ ...filters, sort: sortValue, page: 1 });
  };

  const handleApplyFilters = () => {
    handleFilterChange({ ...filters, page: 1 }); // Reset to first page when filters change
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      category: "all",
      brand: "",
      minPrice: 0,
      maxPrice: 10000,
      sort: "latest",
      page: 1,
      sort: "latest",
    };
    handleFilterChange(resetFilters);
    setShowFilters(false);
  };

  // Calculate active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== "all") count++;
    if (filters.brand) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 10000) count++;
    if (filters.sort !== "latest") count++;
    return count;
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || { total: 0, pages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shop Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover our amazing collection
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
          >
            {viewMode === "grid" ? <List size={20} /> : <Grid size={20} />}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
          >
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden md:block w-full md:w-72 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md h-fit sticky top-4">
          <FilterSection 
            filters={filters}
            categoriesData={categoriesData}
            handleFilterChange={handleFilterChange}
            handleApplyFilters={handleApplyFilters}
            handleResetFilters={handleResetFilters}
            handleSortChange={handleSortChange}
          />
        </div>

        {/* Mobile Filter Overlay */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 md:hidden"
                onClick={() => setShowFilters(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "tween" }}
                className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 p-4 overflow-y-auto md:hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={24} />
                  </button>
                </div>
                
                <FilterSection 
                  filters={filters}
                  categoriesData={categoriesData}
                  handleFilterChange={handleFilterChange}
                  handleApplyFilters={() => {
                    handleApplyFilters();
                    setShowFilters(false);
                  }}
                  handleResetFilters={handleResetFilters}
                  handleSortChange={handleSortChange}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.search && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                Search: "{filters.search}"
                <button 
                  onClick={() => handleFilterChange({ ...filters, search: "" })}
                  className="ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {filters.category !== "all" && categoriesData?.categories && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                Category: {categoriesData.categories.find(c => c._id === filters.category)?.name}
                <button 
                  onClick={() => handleFilterChange({ ...filters, category: "all" })}
                  className="ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {filters.brand && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                Brand: {filters.brand}
                <button 
                  onClick={() => handleFilterChange({ ...filters, brand: "" })}
                  className="ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                Price: ${filters.minPrice} - ${filters.maxPrice}
                <button 
                  onClick={() => handleFilterChange({ ...filters, minPrice: 0, maxPrice: 10000 })}
                  className="ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            {filters.sort !== "latest" && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                Sorted: {filters.sort === "price_asc" ? "Price: Low to High" : 
                         filters.sort === "price_desc" ? "Price: High to Low" : 
                         filters.sort === "popular" ? "Popular" : "Name"}
                <button 
                  onClick={() => handleFilterChange({ ...filters, sort: "latest" })}
                  className="ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Sorting and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {(filters.page - 1) * 12 + 1} - {Math.min(filters.page * 12, pagination.total)} of {pagination.total} products
            </p>
            
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-sm">Sort by:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 text-sm"
              >
                <option value="latest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Product Grid/List */}
          {isFetching ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Filter size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard 
                      product={product} 
                      viewMode={viewMode}
                      inCart={cartItems.some(item => item._id === product._id)}
                      inWishlist={wishlistItems.some(item => item._id === product._id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={pagination.pages}
                    onPageChange={(newPage) => handleFilterChange({ ...filters, page: newPage })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Extract filter section to a separate component
const FilterSection = ({ 
  filters, 
  categoriesData, 
  handleFilterChange, 
  handleApplyFilters, 
  handleResetFilters,
  handleSortChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button
          onClick={handleResetFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reset All
        </button>
      </div>

            {/* Search */}
            <div>
              <label className="block mb-2 font-medium">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search products..."
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block mb-2 font-medium">Categories</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Categories</option>
                {categoriesData?.categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block mb-2 font-medium">Price Range</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  min={0}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  min={0}
                  placeholder="Max"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹{filters.minPrice}</span>
                <span>₹{filters.maxPrice}</span>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block mb-2 font-medium">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="latest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button
              onClick={handleApplyFilters}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>

          {/* Product Grid */}
          {isFetching ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No products found. Try adjusting your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={pagination.pages}
                    onPageChange={(newPage) => handleFilterChange({ ...filters, page: newPage })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};