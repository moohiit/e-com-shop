import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { moveToCart, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { addItem } from '../../features/cart/cartSlice';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

function Wishlist() {
  const wishlist = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const handleMoveToCart = (product) => {
    // Calculate final price for cart
    const finalPrice = product.finalPrice ||
      (product.basePrice * (1 - product.discountPercentage / 100) * (1 + product.taxPercentage / 100));

    dispatch(addItem({
      ...product,
      price: finalPrice,
      actualPrice: product.basePrice
    }));
    dispatch(moveToCart(product));
    toast.success('Moved to cart');
  };

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
  };

  if (wishlist?.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-lg">
        Your wishlist is empty.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Your Wishlist</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          // Calculate final price
          const finalPrice = item.finalPrice ||
            (item.basePrice * (1 - item.discountPercentage / 100) * (1 + item.taxPercentage / 100));

          return (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md flex flex-col"
            >
              <Link to={`/product/${item._id}`}>
                <img
                  src={item.images[0]?.imageUrl || "/placeholder-image.jpg"}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              </Link>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>

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

                <div className="flex justify-between items-center mb-4">
                  {item.discountPercentage > 0 ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-lg font-bold text-red-500">
                        ₹{finalPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.basePrice.toFixed(2)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        {Math.round(item.discountPercentage)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold">₹{finalPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Stock information */}
                <div className="mb-3">
                  {item.stock > 0 ? (
                    <span className="text-sm text-green-600">
                      In Stock ({item.stock} available)
                    </span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={item.stock <= 0}
                  >
                    {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => handleRemove(item._id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;