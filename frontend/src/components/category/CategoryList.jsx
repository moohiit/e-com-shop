import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/category/categorySlice';

export default function CategoryList() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <table className="min-w-full table-auto border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Parent</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-gray-50">
              <td className="p-2 border-b">{cat.name}</td>
              <td className="p-2 border-b">{cat.parent?.name || '—'}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                  ${cat.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 border-b">
                {/* Actions will be added later (edit, delete, toggle) */}
                <button className="text-blue-600 hover:underline mr-2">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
