import { useState } from 'react';
import { useFetchAllProductsQuery, useDeleteProductMutation, useRestoreProductMutation } from '../../features/products/productApiSlice';
import { Loader2, Pencil, Trash2, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';

function ManageProducts() {
  const { data, isLoading, isError, refetch } = useFetchAllProductsQuery();
  console.log('Products:', data);
  const [deleteProduct] = useDeleteProductMutation();
  const [restoreProduct] = useRestoreProductMutation();
  const [feedback, setFeedback] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      setFeedback({ type: 'success', message: 'Product deleted' });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.data?.message || 'Delete failed' });
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreProduct(id).unwrap();
      setFeedback({ type: 'success', message: 'Product restored' });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.data?.message || 'Restore failed' });
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Products</h2>
        <Link
          to="/seller/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      {isLoading && <Loader2 className="animate-spin mx-auto" size={24} />}
      {isError && <p className="text-red-500">Failed to load products.</p>}

      {feedback && (
        <p className={`text-sm mb-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.message}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2 text-gray-700 dark:text-white">Name</th>
              <th className="text-left p-2 text-gray-700 dark:text-white">Price</th>
              <th className="text-left p-2 text-gray-700 dark:text-white">Stock</th>
              <th className="text-left p-2 text-gray-700 dark:text-white">Status</th>
              <th className="text-left p-2 text-gray-700 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map((product) => (
              <tr key={product._id} className="border-b dark:border-gray-700">
                <td className="p-2 text-gray-800 dark:text-gray-200">{product.name}</td>
                <td className="p-2 text-gray-800 dark:text-gray-200">${product.price}</td>
                <td className="p-2 text-gray-800 dark:text-gray-200">{product.stock}</td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  {product.isDeleted ? 'Deleted' : 'Active'}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200 flex gap-2">
                  <Link to={`/seller/products/edit/${product._id}`} className="text-blue-500 hover:underline">
                    <Pencil size={16} />
                  </Link>
                  {!product.isDeleted ? (
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button onClick={() => handleRestore(product._id)} className="text-green-600 hover:text-green-800">
                      <RotateCw size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageProducts;
