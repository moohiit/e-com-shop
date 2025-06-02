import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory } from '../features/category/categorySlice';

export default function AddCategoryModal({ onClose }) {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);

  const [name, setName] = useState('');
  const [parent, setParent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name };
    if (parent) data.parent = parent;
    dispatch(addCategory(data)).then((res) => {
      if (!res.error) {
        onClose();  // Close modal on success
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Add Category</h2>

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
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {error && <p className="text-red-500 mb-2">{error}</p>}

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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
