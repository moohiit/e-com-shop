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
  const itemsPerPage = 10;

  const categories = response?.categories || [];

  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true; // Show all if search is empty

    // Check name and slug (guaranteed strings)
    const name = (cat.name || "").toLowerCase();
    const slug = (cat.slug || "").toLowerCase();

    if (name.includes(q) || slug.includes(q)) {
      return true;
    }

    // Check parents - handle both ObjectIds and populated documents
    if (cat.parents && cat.parents.length > 0) {
      const parentNames = cat.parents
        .map((p) => {
          // If parent is a populated document with name property
          if (typeof p === 'object' && p !== null && p.name) {
            return p.name.toLowerCase();
          }
          // If parent is just an ObjectId string, we can't search by name
          return "";
        })
        .filter(name => name.includes(q));

      if (parentNames.length > 0) {
        return true;
      }
    }

    return false;
  });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("Category deleted");
      } catch (err) {
        console.error(err);
        toast.error("Delete failed");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleCategory(id).unwrap();
      toast.success(res.message || "Status updated");
    } catch (err) {
      console.error(err);
      toast.error("Toggle failed");
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setShowEditModal(true);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">Error loading categories</p>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search name, slug or parent..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 w-full rounded"
        />
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredCategories.length} of {categories.length} categories
        {searchQuery && ` for "${searchQuery}"`}
      </div>

      {/* Table */}
      <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-2 border-b dark:border-gray-600">Image</th>
            <th className="p-2 border-b dark:border-gray-600">Name</th>
            <th className="p-2 border-b dark:border-gray-600">Slug</th>
            <th className="p-2 border-b dark:border-gray-600">Parent</th>
            <th className="p-2 border-b dark:border-gray-600">Status</th>
            <th className="p-2 border-b dark:border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCategories.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? "No categories found matching your search" : "No categories available"}
              </td>
            </tr>
          ) : (
            paginatedCategories.map((cat) => (
              <tr
                key={cat._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 h-20 align-middle"
              >
                <td className="p-2 border-b dark:border-gray-700 text-center">
                  {cat.image?.imageUrl ? (
                    <img
                      src={cat.image.imageUrl}
                      alt={cat.name}
                      className="w-16 h-16 object-cover rounded-md mx-auto"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No Image</span>
                  )}
                </td>

                <td className="p-2 border-b dark:border-gray-700 align-middle">
                  {cat.name}
                </td>
                <td className="p-2 border-b dark:border-gray-700 align-middle">
                  {cat.slug}
                </td>
                <td className="p-2 border-b dark:border-gray-700 align-middle">
                  {cat.parents?.length
                    ? cat.parents
                      .map((p) => (typeof p === 'object' && p?.name ? p.name : ''))
                      .filter(Boolean)
                      .join(", ") || "—"
                    : "—"}
                </td>
                <td className="p-2 border-b dark:border-gray-700 align-middle">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900"
                        : "bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900"
                      }`}
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-2 border-b dark:border-gray-700 align-middle">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200 dark:bg-blue-200 dark:text-blue-900"
                    >
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 dark:bg-red-200 dark:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => handleToggle(cat._id)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${cat.isActive
                          ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-200 dark:text-red-900"
                          : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-200 dark:text-green-900"
                        }`}
                    >
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-800 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50"
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