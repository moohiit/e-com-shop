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
  const totalAmount = useSelector(selectCartTotalAmount);
  const totalQuantity = useSelector(selectCartTotalQuantity);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (user?.role === 'seller' || user?.role === 'admin') {
    return <AccessDenied />;
  }

  const handleIncrease = (item) => {
    // Check if we can add more (stock limit)
    if (item.quantity >= (item.stock || 99)) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
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
      (acc, item) => acc + (item.basePrice || 0) * item.quantity,
      0
    );

    const taxPrice = cartItems.reduce(
      (acc, item) => {
        return acc + ((item.taxAmount || 0) * item.quantity);
      },
      0
    );

    const totalDiscount = cartItems.reduce(
      (acc, item) =>
        acc + ((item.discountAmount || 0) * item.quantity),
      0
    );

    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalPrice = Number((itemsPrice - totalDiscount + taxPrice + shippingPrice).toFixed(2));

    return { itemsPrice, taxPrice, totalDiscount, shippingPrice, totalPrice };
  };

  const { itemsPrice, taxPrice, totalDiscount, shippingPrice, totalPrice } = calculatePrices();

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
          {cartItems.map((item) => {
            const basePrice = (item.basePrice || 0) * item.quantity;
            const discountAmount = (item.discountAmount || 0) * item.quantity;
            const taxAmount = (item.taxAmount || 0) * item.quantity;
            const itemTotal = (item.finalPrice || 0) * item.quantity;

            return (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]?.imageUrl || "/placeholder-image.jpg"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>

                    {/* Categories */}
                    {item.categories && item.categories.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {item.categories.slice(0, 2).map((category) => (
                            <span
                              key={category._id}
                              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-gray-500 space-y-1">
                      <p>Base Price: ₹{basePrice.toFixed(2)}</p>
                      {discountAmount > 0 && (
                        <p className="text-red-500">
                          Discount ({item.discountPercentage || 0}%): ₹{discountAmount.toFixed(2)}
                        </p>
                      )}
                      <p>Taxes ({item.taxPercentage || 0}%): ₹{taxAmount.toFixed(2)}</p>
                      <p>Total Price: ₹{itemTotal.toFixed(2)}</p>
                    </div>

                    {/* Stock information */}
                    <div className="mt-1 text-sm">
                      {item.stock > 0 ? (
                        <span className="text-green-600">
                          In Stock ({item.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="bg-gray-300 px-2 rounded hover:bg-gray-400 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="bg-gray-300 px-2 rounded hover:bg-gray-400 disabled:opacity-50"
                        disabled={item.quantity >= (item.stock || 99)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove from cart"
                  >
                    Remove
                  </button>
                  <span className="font-semibold text-lg">
                    ₹{itemTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4 h-fit">
          <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Items Price:</span>
              <span>₹{itemsPrice.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Total Discount:</span>
                <span>₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax Price:</span>
              <span>₹{taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Price:</span>
              <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={handleClearCart}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Cart
            </button>

            <Link
              to="/products"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Free shipping notice */}
          {itemsPrice < 500 && (
            <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mt-4">
              Add ₹{(500 - itemsPrice).toFixed(2)} more for free shipping!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;