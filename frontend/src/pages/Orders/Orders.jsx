import React from 'react';
import { useGetMyOrdersQuery } from '../../features/order/orderApi';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function Orders() {
  const { data: orders, isLoading, isError, error } = useGetMyOrdersQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-600 text-center mt-8">Error: {error?.data?.message || 'Failed to load orders'}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">You have no orders yet</h2>
        <Link to="/" className="bg-blue-600 text-white py-2 px-4 rounded">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Order ID: {order._id}</h3>
              <span className={`text-sm px-3 py-1 rounded-full ${order.isPaid ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'}`}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </span>
            </div>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>

            <div className="mt-4 flex space-x-4">
              <Link
                to={`/order/${order._id}`}
                className="bg-blue-600 text-white py-2 px-4 rounded"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
