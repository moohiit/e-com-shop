import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../../features/order/orderApi';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function OrderDetails() {
  const { id } = useParams();
  const { data: order, isLoading, isError, error } = useGetOrderByIdQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-600 text-center mt-8">Error: {error?.data?.message || 'Failed to load order details'}</div>;
  }

  if (!order) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
        <Link to="/my-orders" className="bg-blue-600 text-white py-2 px-4 rounded">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Order Details</h2>

      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow mb-6">
        <h3 className="font-semibold mb-2">Order ID: {order._id}</h3>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}</p>
        <p><strong>Status:</strong> {order.orderStatus}</p>
        <p><strong>Payment:</strong> {order.isPaid ? 'Paid' : 'Pending'}</p>
      </div>

      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow mb-6">
        <h3 className="font-semibold mb-4">Shipping Address</h3>
        {order.shippingAddress && (
          <div>
            <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
            <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p><strong>Country:</strong> {order.shippingAddress.country}</p>
          </div>
        )}
      </div>

      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow mb-6">
        <h3 className="font-semibold mb-4">Ordered Items</h3>
        {order.orderItems.map((item) => (
          <div key={item._id} className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p>Qty: {item.quantity}</p>
              <p>Price: ₹{item.price}</p>
            </div>
            <p className="font-semibold">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <Link to="/my-orders" className="bg-gray-600 text-white py-2 px-4 rounded">
        Back to Orders
      </Link>
    </div>
  );
}

export default OrderDetails;
