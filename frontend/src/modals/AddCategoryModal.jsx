import { useState, useEffect } from "react";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useFetchCategoriesQuery,
} from "../features/category/categoryApiSlice";

export default function AddCategoryModal({ onClose, existingCategory = null }) {
  const [name, setName] = useState("");
  const [parents, setParents] = useState([]);
  const [parentSearch, setParentSearch] = useState("");

  const { data: response } = useFetchCategoriesQuery();
  const categories = response?.categories || [];

  const [addCategory, { isLoading: adding, error: addError }] =
    useAddCategoryMutation();
  const [updateCategory, { isLoading: updating, error: updateError }] =
    useUpdateCategoryMutation();

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name || "");
      setParents(existingCategory.parents?.map((p) => p._id) || []);
    }
  }, [existingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryData = { name };
    if (parents.length > 0) categoryData.parents = parents;

    try {
      if (existingCategory) {
        await updateCategory({
          id: existingCategory._id,
          data: categoryData,
        }).unwrap();
      } else {
        await addCategory(categoryData).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  const handleParentChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setParents(selected);
  };

  // Filter categories based on parent search
  const filteredCategories = categories.filter((cat) => {
    const query = parentSearch.toLowerCase();
    const parentNames = Array.isArray(cat.parents)
      ? cat.parents
          .map((p) => p?.name)
          .filter(Boolean)
          .join(", ")
          .toLowerCase()
      : "";
    return (
      cat._id !== existingCategory?._id &&
      (cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        parentNames.includes(query))
    );
  });

  const isLoading = adding || updating;
  const error = addError || updateError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">
          {existingCategory ? "Edit Category" : "Add Category"}
        </h2>

        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 w-full mb-3 rounded"
        />

        <label className="block text-sm font-medium mb-1">
          Parent Categories (optional)
        </label>
        <input
          type="text"
          placeholder="Search parent categories..."
          value={parentSearch}
          onChange={(e) => setParentSearch(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 w-full mb-2 rounded"
        />
        <select
          multiple
          value={parents}
          onChange={handleParentChange}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 w-full mb-3 rounded h-32"
        >
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-red-500 mb-2">
            {error.data?.message || "Something went wrong"}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading
              ? existingCategory
                ? "Updating..."
                : "Adding..."
              : existingCategory
              ? "Update"
              : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
