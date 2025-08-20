import React, { useState, useEffect } from 'react';
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
import { addToWishlist } from '../../features/wishlist/wishlistSlice';
import { useGetProductByIdQuery } from '../../features/products/productApiSlice';
import { toast } from 'react-hot-toast';
import AccessDenied from '../../components/common/AccessDenied';
import { FaExclamationTriangle, FaHeart, FaTrash } from 'react-icons/fa';

function Cart() {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const totalQuantity = useSelector(selectCartTotalQuantity);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user?.role === 'seller' || user?.role === 'admin') {
    return <AccessDenied />;
  }

  // Check for out of stock items
  useEffect(() => {
    const checkStockAvailability = async () => {
      setLoading(true);
      const outOfStock = [];
      
      for (const item of cartItems) {
        try {
          // Fetch current product data to check stock
          const { data: product } = await dispatch(
            useGetProductByIdQuery.initiate(item._id)
          );
          
          if (product && product.stock < item.quantity) {
            outOfStock.push({
              ...item,
              availableStock: product.stock
            });
          }
        } catch (error) {
          console.error('Error checking stock for product:', item._id, error);
          // If we can't verify stock, assume it's available
        }
      }
      
      setOutOfStockItems(outOfStock);
      setLoading(false);
    };

    if (cartItems.length > 0) {
      checkStockAvailability();
    } else {
      setLoading(false);
    }
  }, [cartItems, dispatch]);

  const handleIncrease = (item) => {
    // Check if item is out of stock before adding
    const outOfStockItem = outOfStockItems.find(i => i._id === item._id);
    if (outOfStockItem) {
      toast.error('This item is out of stock');
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

  const handleMoveToWishlist = (item) => {
    dispatch(deleteItem(item._id));
    dispatch(addToWishlist(item));
    toast.success('Item moved to wishlist');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');
    
    // Check if there are any out of stock items
    if (outOfStockItems.length > 0) {
      toast.error('Please resolve out of stock items before checkout');
      return;
    }
    
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {/* Out of Stock Warning Banner */}
      {outOfStockItems.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span className="font-semibold">Attention required!</span>
          </div>
          <p className="mt-1">
            {outOfStockItems.length} item(s) in your cart are out of stock or have limited availability.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const isOutOfStock = outOfStockItems.some(i => i._id === item._id);
            const outOfStockInfo = outOfStockItems.find(i => i._id === item._id);
            
            return (
              <div
                key={item._id}
                className={`flex items-center justify-between rounded-lg shadow p-4 ${
                  isOutOfStock 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' 
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]?.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    
                    {isOutOfStock && (
                      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-md text-sm mt-2 mb-2">
                        <div className="flex items-center">
                          <FaExclamationTriangle className="mr-1" size={12} />
                          <span>
                            {outOfStockInfo.availableStock === 0 
                              ? 'Out of Stock' 
                              : `Only ${outOfStockInfo.availableStock} available (you have ${item.quantity} in cart)`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-gray-500 space-y-1">
                      <p>Base Price: ₹{(item.actualPrice * item.quantity).toFixed(2)}</p>
                      <p>Taxes ({item.taxPercentage}%): ₹{(item.taxes * item.quantity).toFixed(2)}</p>
                      <p>Total Price: ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    {!isOutOfStock && (
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
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {isOutOfStock ? (
                    <>
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        title="Move to Wishlist"
                      >
                        <FaHeart size={14} />
                        <span>Save for Later</span>
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                        title="Remove Item"
                      >
                        <FaTrash size={14} />
                        <span>Remove</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                      <span className="font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
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
            disabled={outOfStockItems.length > 0}
            className={`w-full py-2 rounded-lg transition-colors ${
              outOfStockItems.length > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {outOfStockItems.length > 0 ? 'Resolve Issues to Checkout' : 'Proceed to Checkout'}
          </button>

          <button
            onClick={handleClearCart}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear Cart
          </button>

          {outOfStockItems.length > 0 && (
            <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">
              <FaExclamationTriangle className="inline mr-1" size={12} />
              Please resolve out of stock items before checkout
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;