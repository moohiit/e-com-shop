import React, { useState } from "react";
import { useFetchAllProductsQuery } from "../../features/products/productApiSlice";
import { useFetchCategoriesQuery } from "../../features/category/categoryApiSlice";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import ProductCard from "../../components/products/ProductCard"; // Create a separate ProductCard component

export default function ProductListing() {
  const { data: productsData, isLoading } = useFetchAllProductsQuery();
  const { data: categoriesData } = useFetchCategoriesQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("default");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const products = productsData?.products || [];

  // Filter and sort logic
  const filteredProducts = products
    .filter((product) =>
      selectedCategory === "all" ? true : product.category._id === selectedCategory
    )
    .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((product) => product.price >= minPrice && product.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === "price-low-high") return a.price - b.price;
      if (sortBy === "price-high-low") return b.price - a.price;
      if (sortBy === "name-a-z") return a.name.localeCompare(b.name);
      if (sortBy === "name-z-a") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">Shop Products</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block mb-1 font-medium">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block mb-1 font-medium">Categories</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
            <label className="block mb-1 font-medium">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-20 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                min={0}
              />
              <span>to</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                min={0}
              />
            </div>
          </div>

          {/* Sorting */}
          <div>
            <label className="block mb-1 font-medium">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="default">Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Product Listing */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No products found.</p>
          ) : (
            filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
