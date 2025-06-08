import { useFetchAllCategoriesQuery, useDeleteCategoryMutation, useToggleCategoryMutation } from '../../features/category/categoryApiSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { useState } from 'react';
import AddCategoryModal from '../../modals/AddCategoryModal';
import toast from 'react-hot-toast';

export default function CategoryList() {
  const { data: response, isLoading, error } = useFetchAllCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [toggleCategory] = useToggleCategoryMutation();

  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const categories = response?.categories || [];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await toggleCategory(id).unwrap();
      if (!response.success) {
        throw new Error(response.message || "Failed to toggle category");
      }
      toast.success(response.data.message || "Category toggled successfully");
    } catch (err) {
      console.error("Failed to toggle category:", err);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  if (isLoading) return <LoadingSpinner fullScreen={false} />;
  if (error) return <p className="text-red-500">Error loading categories</p>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
      <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">Name</th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">Slug</th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">Parent</th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">Status</th>
            <th className="p-2 border-b dark:border-gray-600 text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-2 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">{cat.name}</td>
              <td className="p-2 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">{cat.slug}</td>
              <td className="p-2 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">{cat.parent?.name || '—'}</td>
              <td className="p-2 border-b dark:border-gray-700">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${cat.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900'
                    : 'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 border-b dark:border-gray-700 flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900 px-2 py-1 rounded text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-900 px-2 py-1 rounded text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleToggle(cat._id)}
                  className={`px-2 py-1 rounded text-xs font-semibold
                    ${cat.isActive
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-200 dark:text-red-900 dark:hover:bg-red-300'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-200 dark:text-green-900 dark:hover:bg-green-300'}`}
                >
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
