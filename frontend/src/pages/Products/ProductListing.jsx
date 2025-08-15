import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFetchAllProductsQuery } from "../../features/products/productApiSlice";
import { useFetchCategoriesQuery } from "../../features/category/categoryApiSlice";
import { Loader2, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../../components/products/ProductCard";
import Pagination from "../../components/common/Pagination";

export default function ProductListing() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to parse query parameters
  const parseQueryParams = () => {
    const queryParams = new URLSearchParams(location.search);
    return {
      search: queryParams.get("search") || "",
      category: queryParams.get("category") || "all",
      minPrice: Number(queryParams.get("minPrice")) || 0,
      maxPrice: Number(queryParams.get("maxPrice")) || 10000,
      page: Number(queryParams.get("page")) || 1,
    };
  };

  // Initialize state from URL query parameters
  const [filters, setFilters] = useState(parseQueryParams());
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  // Update state when URL changes
  useEffect(() => {
    setFilters(parseQueryParams());
  }, [location.search]);

  // Fetch data with current filters
  const { data: productsData, isLoading, isFetching } = useFetchAllProductsQuery({
    search: filters.search,
    category: filters.category !== "all" ? filters.category : undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    page: filters.page,
    limit: 12,
  });

  const { data: categoriesData } = useFetchCategoriesQuery();

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category !== "all") params.set("category", newFilters.category);
    if (newFilters.minPrice > 0) params.set("minPrice", newFilters.minPrice.toString());
    if (newFilters.maxPrice < 10000) params.set("maxPrice", newFilters.maxPrice.toString());
    if (newFilters.page > 1) params.set("page", newFilters.page.toString());

    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleApplyFilters = () => {
    handleFilterChange({ ...filters, page: 1 }); // Reset to first page when filters change
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      category: "all",
      minPrice: 0,
      maxPrice: 10000,
      page: 1,
    };
    handleFilterChange(resetFilters);
    setShowFilters(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || { total: 0, pages: 1 };

  // Frontend sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low-high") return a.price - b.price;
    if (sortBy === "price-high-low") return b.price - a.price;
    if (sortBy === "name-a-z") return a.name.localeCompare(b.name);
    if (sortBy === "name-z-a") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop Products</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          {showFilters ? <X size={18} /> : <Filter size={18} />}
          Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md h-fit sticky top-4`}>
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
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                placeholder="Search products..."
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block mb-2 font-medium">Categories</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
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
                  onChange={(e) => handleFilterChange({ ...filters, minPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  min={0}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  min={0}
                  placeholder="Max"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
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
          {/* Sorting and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {products.length} of {pagination.total} products
            </p>
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="default">Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A to Z</option>
                <option value="name-z-a">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isFetching ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : sortedProducts.length === 0 ? (
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
                {sortedProducts.map((product) => (
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
}