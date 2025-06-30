import React from 'react';
import { useGetSellerOrdersQuery } from '../../features/order/sellerOrderApi';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function SellerOrders() {
  const { data: orders, isLoading, isError, error } = useGetSellerOrdersQuery();
  console.log('Seller Orders:', orders);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 text-center mt-8">
        Error: {error?.data?.message || 'Failed to load seller orders'}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">No Orders Found</h2>
        <p>You haven’t received any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Seller Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm uppercase tracking-wider">
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total Price</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-6 py-4">{order._id}</td>
                <td className="px-6 py-4">{order.order?.user?.name || 'Unknown'}</td>
                <td className="px-6 py-4 space-y-1">
                  {order.items.map((item) => (
                    <div key={item._id}>
                      <p>{item.product?.name} x {item.quantity}</p>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4">₹{order.order?.totalPrice?.toFixed(2)}</td>
                <td className="px-6 py-4">{order.order?.paymentMethod}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">
                  <Link
                    to={`/seller/order/${order._id}`}
                    className="bg-blue-600 text-white py-1 px-3 rounded text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerOrders;
