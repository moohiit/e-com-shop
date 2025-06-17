import {
  useFetchAllCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryMutation,
} from "../../features/category/categoryApiSlice";
import LoadingSpinner from "../common/LoadingSpinner";
import { useState } from "react";
import AddCategoryModal from "../../modals/AddCategoryModal";
import toast from "react-hot-toast";

export default function CategoryList({ isAdmin = false }) {
  const { data: response, isLoading, error } = useFetchAllCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [toggleCategory] = useToggleCategoryMutation();

  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of categories per page

  const categories = response?.categories || [];

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) => {
    const query = searchQuery.toLowerCase();
    const parentNames = Array.isArray(cat.parents)
      ? cat.parents.map((p) => p?.name).filter(Boolean).join(", ").toLowerCase()
      : "";
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      parentNames.includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("Category deleted successfully");
      } catch (err) {
        console.error("Failed to delete category:", err);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await toggleCategory(id).unwrap();
      if (!response.success) {
        throw new Error(response.message || "Failed to toggle category");
      }
      toast.success(response.message || "Category toggled successfully");
    } catch (err) {
      console.error("Failed to toggle category:", err);
      toast.error("Failed to toggle category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) return <LoadingSpinner fullScreen={false} />;
  if (error) return <p className="text-red-500">Error loading categories</p>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, slug, or parent..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 w-full rounded"
        />
      </div>

      {/* Category Table */}
      <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Name
            </th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Slug
            </th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Parent
            </th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Status
            </th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedCategories.map((cat) => (
            <tr
              key={cat._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="p-2 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                {cat.name}
              </td>
              <td className="p-2 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                {cat.slug}
              </td>
              <td className="p-2 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                {Array.isArray(cat.parents) && cat.parents.length > 0
                  ? cat.parents
                    .map((p) => p?.name)
                    .filter(Boolean)
                    .join(", ")
                  : "—"}
              </td>
              <td className="p-2 border-b dark:border-gray-700">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${cat.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900"
                      : "bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900"
                    }`}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-2 border-b dark:border-gray-700 flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900 px-2 py-1 rounded text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-300"
                >
                  Edit
                </button>
                {isAdmin && <button
                  onClick={() => handleDelete(cat._id)}
                  className="bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-900 px-2 py-1 rounded text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-300"
                >
                  Delete
                </button>
                }
                <button
                  onClick={() => handleToggle(cat._id)}
                  className={`px-2 py-1 rounded text-xs font-semibold
                    ${cat.isActive
                      ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-200 dark:text-red-900 dark:hover:bg-red-300"
                      : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-200 dark:text-green-900 dark:hover:bg-green-300"
                    }`}
                >
                  {cat.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-800 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showEditModal && (
        <AddCategoryModal
          onClose={() => {
            setEditingCategory(null);
            setShowEditModal(false);
          }}
          existingCategory={editingCategory}
        />
      )}
    </div>
  );
}