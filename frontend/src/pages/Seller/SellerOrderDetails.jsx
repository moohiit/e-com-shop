import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSellerOrderByIdQuery } from '../../features/order/sellerOrderApi';
import { Loader2 } from 'lucide-react';

function SellerOrderDetails() {
  const { id } = useParams();
  const { data: order, isLoading, isError, error } = useGetSellerOrderByIdQuery(id);

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
        Error: {error?.data?.message || 'Failed to load order details'}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Order Details</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Buyer Information</h3>
          <p><strong>Name:</strong> {order.order?.user?.name}</p>
          <p><strong>Email:</strong> {order.order?.user?.email}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
          <p>{order.order?.shippingAddress?.fullName}</p>
          <p>{order.order?.shippingAddress?.address}</p>
          <p>{order.order?.shippingAddress?.city}, {order.order?.shippingAddress?.postalCode}</p>
          <p>{order.order?.shippingAddress?.country}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item._id} className="flex justify-between border-b pb-2">
                <span>{item.product?.name} x {item.quantity}</span>
                <span>₹{(item.product?.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
          <p><strong>Payment Method:</strong> {order.order?.paymentMethod}</p>
          <p><strong>Total Price:</strong> ₹{order.order?.totalPrice.toFixed(2)}</p>
          <p><strong>Order Status:</strong> {order.status}</p>
        </div>
      </div>
    </div>
  );
}

export default SellerOrderDetails;
