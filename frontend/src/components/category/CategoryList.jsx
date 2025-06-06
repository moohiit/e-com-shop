import { useFetchAllCategoriesQuery, useDeleteCategoryMutation, useToggleCategoryMutation,  } from '../../features/category/categoryApiSlice';
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
    <div className="bg-white shadow rounded-xl p-4">
      <table className="min-w-full table-auto border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Slug</th>
            <th className="p-2 border-b">Parent</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-gray-50">
              <td className="p-2 border-b">{cat.name}</td>
              <td className="p-2 border-b">{cat.slug}</td>
              <td className="p-2 border-b">{cat.parent?.name || '—'}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                  ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 border-b">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold hover:bg-red-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleToggle(cat._id)}
                  className={`ml-2 px-2 py-1 rounded text-xs font-semibold 
                    ${cat.isActive ? 'bg-red-100 text-red-800 hover:bg-red-300' : 'bg-green-100 text-green-800 hover:bg-green-300'}`}
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
