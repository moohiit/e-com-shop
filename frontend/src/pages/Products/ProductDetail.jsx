import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductByIdQuery } from '../../features/products/productApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../features/cart/cartSlice';
import { addToWishlist, removeFromWishlist, selectWishlist } from '../../features/wishlist/wishlistSlice';
import { Heart, Loader2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Rating from '../../components/common/Rating';
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const wishlist = useSelector(selectWishlist);

  const {
    data: productData,
    isLoading,
    isError
  } = useGetProductByIdQuery(id);

  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (productData?.product && wishlist) {
      setIsInWishlist(wishlist.some(item => item._id === productData.product._id));
    }
  }, [productData, wishlist]);

  const handleAddToCart = () => {
    if (productData?.product?.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    dispatch(addItem({
      ...productData.product,
      quantity,
      price: productData.product.finalPrice || productData.product.basePrice
    }));

    toast.success('Added to cart successfully');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(productData.product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(productData.product));
      toast.success('Added to wishlist');
    }
  };

  const incrementQuantity = () => {
    if (quantity < productData?.product?.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError || !productData?.product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }

  const product = productData.product;
  const seller = product.seller;

  // Calculate discount percentage
  const discountPercentage = product.discountPercentage > 0
    ? Math.round(product.discountPercentage)
    : 0;

  // Calculate final price if not provided by backend
  const finalPrice = product.finalPrice ||
    (product.basePrice * (1 - product.discountPercentage / 100) * (1 + product.taxPercentage / 100));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Product Images */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 relative">
          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={24}
              className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>

          <Carousel
            showThumbs={true}
            infiniteLoop={true}
            showStatus={false}
            dynamicHeight={false}
          >
            {product.images.map((image, index) => (
              <div key={index} className="h-96 flex items-center justify-center">
                <img
                  src={image.imageUrl}
                  alt={`${product.name} ${index + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </Carousel>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2 space-x-4">
              <Rating value={product.ratingsAverage} />
              <span className="text-gray-600 dark:text-gray-400">
                {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {product.discountPercentage > 0 ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="text-xl line-through text-gray-500">
                    ₹{product.basePrice.toFixed(2)}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </>
              ) : (
                <span className="text-3xl font-bold">
                  ₹{finalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {product.stock > 0 ? (
              <p className="text-green-600">In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
          </div>

          {/* Product Brand */}
          {product.brand && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Brand</h3>
              <p className="text-gray-600 dark:text-gray-300">{product.brand}</p>
            </div>
          )}

          {/* Product Categories */}
          {product.categories && product.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category._id}
                    className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seller Information */}
          {seller && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Sold By</h3>
              <p className="text-gray-600 dark:text-gray-300">{seller.name}</p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={decrementQuantity}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stock} available
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              disabled={product.stock <= 0}
            >
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProductDetail;