import AddCategoryModal from '../../modals/AddCategoryModal';
import CategoryList from '../../components/category/CategoryList';
import { useState } from 'react';

export default function ManageCategoryPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Category
        </button>
      </div>

      <CategoryList />

      {showModal && <AddCategoryModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
