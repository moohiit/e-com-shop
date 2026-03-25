import { useState } from "react";
import {
  useGetLowStockProductsQuery,
  useFetchAllProductsSellerQuery,
  useBulkUpdateStockMutation,
} from "../../features/products/productApiSlice";
import { Loader2, Save, AlertTriangle, Package } from "lucide-react";
import { toast } from "react-hot-toast";

function InventoryManagement() {
  const [tab, setTab] = useState("low-stock"); // "low-stock" | "all"
  const [stockEdits, setStockEdits] = useState({}); // { productId: newStock }
  const [filters, setFilters] = useState({ page: 1, limit: 20, sort: "latest" });

  const { data: lowStockData, isLoading: lowLoading } = useGetLowStockProductsQuery();
  const { data: allData, isLoading: allLoading } = useFetchAllProductsSellerQuery(filters);
  const [bulkUpdateStock, { isLoading: saving }] = useBulkUpdateStockMutation();

  const products = tab === "low-stock" ? lowStockData?.products : allData?.products;
  const isLoading = tab === "low-stock" ? lowLoading : allLoading;

  const handleStockChange = (productId, value) => {
    setStockEdits((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSave = async () => {
    const updates = Object.entries(stockEdits)
      .filter(([, val]) => val !== "" && val !== undefined)
      .map(([productId, stock]) => ({ productId, stock: Number(stock) }));

    if (updates.length === 0) {
      toast.error("No stock changes to save");
      return;
    }

    try {
      const result = await bulkUpdateStock(updates).unwrap();
      if (result.success) {
        const succeeded = result.results.filter((r) => r.success).length;
        toast.success(`Updated stock for ${succeeded} product(s)`);
        setStockEdits({});
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update stock");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        {Object.keys(stockEdits).length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : `Save Changes (${Object.keys(stockEdits).length})`}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("low-stock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "low-stock"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
        >
          <AlertTriangle size={16} />
          Low Stock {lowStockData?.products?.length > 0 && `(${lowStockData.products.length})`}
        </button>
        <button
          onClick={() => setTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "all"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-700 dark:text-white"
          }`}
        >
          <Package size={16} />
          All Products
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {tab === "low-stock"
            ? "No low stock products. All inventory levels are healthy!"
            : "No products found."}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-sm text-gray-600 dark:text-gray-300">Product</th>
                <th className="p-3 text-sm text-gray-600 dark:text-gray-300">Brand</th>
                <th className="p-3 text-sm text-gray-600 dark:text-gray-300 text-right">Price</th>
                <th className="p-3 text-sm text-gray-600 dark:text-gray-300 text-right">Current Stock</th>
                <th className="p-3 text-sm text-gray-600 dark:text-gray-300 text-right">New Stock</th>
                <th className="p-3 text-sm text-gray-600 dark:text-gray-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isEdited = stockEdits[product._id] !== undefined;
                return (
                  <tr
                    key={product._id}
                    className={`border-b dark:border-gray-700 ${
                      product.stock === 0
                        ? "bg-red-50 dark:bg-red-900/10"
                        : product.stock <= (product.lowStockThreshold || 5)
                        ? "bg-yellow-50 dark:bg-yellow-900/10"
                        : ""
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.imageUrl && (
                          <img
                            src={product.images[0].imageUrl}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{product.brand || "-"}</td>
                    <td className="p-3 text-right">₹{product.basePrice}</td>
                    <td className="p-3 text-right font-semibold">
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock <= (product.lowStockThreshold || 5)
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={product.stock}
                        value={stockEdits[product._id] ?? ""}
                        onChange={(e) =>
                          handleStockChange(product._id, e.target.value)
                        }
                        className={`w-24 text-right px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 ${
                          isEdited ? "border-blue-500 ring-1 ring-blue-500" : ""
                        }`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      {product.stock === 0 ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      ) : product.stock <= (product.lowStockThreshold || 5) ? (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination for "all" tab */}
      {tab === "all" && allData?.pagination && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            disabled={filters.page <= 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-500 text-sm">
            Page {allData.pagination.page} of {allData.pagination.pages}
          </span>
          <button
            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            disabled={filters.page >= allData.pagination.pages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;
