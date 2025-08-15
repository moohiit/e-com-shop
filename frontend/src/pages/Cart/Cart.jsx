import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotalAmount,
  selectCartTotalQuantity,
  addItem,
  removeItem,
  deleteItem,
  clearCart,
} from '../../features/cart/cartSlice';
import { toast } from 'react-hot-toast';
import AccessDenied from '../../components/common/AccessDenied';

function Cart() {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  console.log('Cart Items:', cartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const totalQuantity = useSelector(selectCartTotalQuantity);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (user?.role === 'seller' || user?.role === 'admin') {
    return <AccessDenied />;
  }

  const handleIncrease = (item) => {
    dispatch(addItem(item));
  };

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      dispatch(deleteItem(item._id));
      toast.success('Item removed from cart');
    } else {
      dispatch(removeItem(item._id));
    }
  };

  const handleRemove = (id) => {
    dispatch(deleteItem(id));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');
    navigate('/checkout');
  };

  // Calculate price breakdown for the cart summary
  const calculatePrices = () => {
    const itemsPrice = cartItems.reduce(
      (acc, item) => acc + item.actualPrice * item.quantity,
      0
    );
    const taxPrice = cartItems.reduce(
      (acc, item) => acc + item.taxes * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    return { itemsPrice, taxPrice, shippingPrice, totalPrice };
  };

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculatePrices();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lg">
        <p>Your cart is empty.</p>
        <Link
          to="/products"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.images[0]?.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="text-gray-500 space-y-1">
                    <p>Base Price: ₹{(item.actualPrice * item.quantity).toFixed(2)}</p>
                    <p>Taxes ({item.taxPercentage}%): ₹{(item.taxes * item.quantity).toFixed(2)}</p>
                    <p>Total Price: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="bg-gray-300 px-2 rounded hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="bg-gray-300 px-2 rounded hover:bg-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-red-500 hover:text-red-700 mb-2"
                >
                  Remove
                </button>
                <span className="font-semibold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4 h-fit">
          <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>

          <div className="flex justify-between">
            <span>Total Items:</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Items Price:</span>
            <span>₹{itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Price:</span>
            <span>₹{taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Price:</span>
            <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Amount:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={handleClearCart}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;