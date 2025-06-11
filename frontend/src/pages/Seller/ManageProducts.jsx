import { useState } from "react";
import {
  useFetchAllProductsSellerQuery,
  useDeleteProductMutation,
  useToggleProductMutation,
} from "../../features/products/productApiSlice";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ImageSlider from "../../components/common/ImageSlider";
import { toast } from "react-hot-toast";
import EditProductModal from "../../modals/EditProductModal";
import { setSelectedProduct } from "../../features/products/productSlice";
import { useDispatch } from "react-redux";

function ManageProducts() {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sort: "latest",
    page: 1,
    limit: 10,
  });
  const [showEditModal, setShowEditModal] = useState(false);

  const { data, isLoading, isError, refetch } =
    useFetchAllProductsSellerQuery(filters);
    console.log("Resposne: ", data)
  const [deleteProduct] = useDeleteProductMutation();
  const [toggleProduct] = useToggleProductMutation();

  const handleInputChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1,
    }));
    refetch()
  };

  const handleEditProduct = (product)=>{
    dispatch(setSelectedProduct(product));
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const response = await deleteProduct(id).unwrap();
      if (response.success) {
        toast.success(response.message || "Product deleted..");
        refetch();
      }
    } catch (err) {
      toast.error(err?.message || err.response.message || "Delete failed");
    }
  };

  const handleProductStatus = async (id) => {
    if (!window.confirm("Are you sure you want to restore this product?"))
      return;
    try {
      const response = await toggleProduct(id).unwrap();
      if (response.success) {
        toast.success(response.message);
        refetch();
      }
    } catch (err) {
      toast.error(err?.message || err.response.message || "Delete failed");
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Manage Products
        </h2>
        <Link
          to="/seller/add-product"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="search"
          placeholder="Search"
          value={filters.search}
          onChange={handleInputChange}
          className="input-field w-48"
        />
        <input
          type="text"
          name="brand"
          placeholder="Brand"
          value={filters.brand}
          onChange={handleInputChange}
          className="input-field w-48"
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleInputChange}
          className="input-field w-32"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleInputChange}
          className="input-field w-32"
        />
        <select
          name="sort"
          value={filters.sort}
          onChange={handleInputChange}
          className="input-field w-48"
        >
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {isLoading && <Loader2 className="animate-spin mx-auto" size={24} />}
      {isError && <p className="text-red-500">Failed to load products.</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Images
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Name
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Price
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Brand
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Category
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Stock
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Status
              </th>
              <th className="text-left p-2 text-gray-700 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map((product) => (
              <tr key={product._id} className="border-b dark:border-gray-700">
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  <ImageSlider
                    images={product.images}
                    width="100px"
                    height="100px"
                  />
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  {product.name}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  ₹{product.price}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  {product.brand}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  {product?.category?.name || "Unknown"}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  {product.stock}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  {product.isActive ? "Active" : "Inactive"}
                </td>
                <td className="p-2 text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-2 h-full">
                    <button
                      onClick={()=> handleEditProduct(product)}
                      className="text-blue-500 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleProductStatus(product._id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          disabled={filters.page <= 1}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700 dark:text-gray-300">
          Page {data?.pagination?.page} of {data?.pagination?.pages}
        </span>
        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          disabled={filters.page >= data?.pagination?.pages}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {showEditModal && <EditProductModal onClose={() => setShowEditModal(false)} />}
    </div>
  );
}

export default ManageProducts;
