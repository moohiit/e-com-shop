import { useState, useEffect } from 'react';
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useFetchCategoriesQuery,
} from '../features/category/categoryApiSlice';

export default function AddCategoryModal({ onClose, existingCategory = null }) {
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');

  const { data: response } = useFetchCategoriesQuery();
  const categories = response?.categories || [];

  const [addCategory, { isLoading: adding, error: addError }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: updating, error: updateError }] = useUpdateCategoryMutation();

  // Prefill form if editing
  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name || '');
      setParent(existingCategory.parent?._id || '');
    }
  }, [existingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryData = { name };
    if (parent) categoryData.parent = parent;

    try {
      if (existingCategory) {
        await updateCategory({ id: existingCategory._id, data: categoryData }).unwrap();
      } else {
        await addCategory(categoryData).unwrap();
      }
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const isLoading = adding || updating;
  const error = addError || updateError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">
          {existingCategory ? 'Edit Category' : 'Add Category'}
        </h2>

        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 w-full mb-3"
        />

        <select
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          className="border p-2 w-full mb-3"
        >
          <option value="">No Parent</option>
          {categories
            .filter((cat) => cat._id !== existingCategory?._id)
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>

        {error && (
          <p className="text-red-500 mb-2">
            {error.data?.message || 'Something went wrong'}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isLoading
              ? existingCategory
                ? 'Updating...'
                : 'Adding...'
              : existingCategory
              ? 'Update'
              : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
