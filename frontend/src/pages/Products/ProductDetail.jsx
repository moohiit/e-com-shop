import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductByIdQuery, useGetRelatedProductsQuery } from '../../features/products/productApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../features/cart/cartSlice';
import { addToWishlist, removeFromWishlist, selectWishlist } from '../../features/wishlist/wishlistSlice';
import { useAddToWishlistApiMutation, useRemoveFromWishlistApiMutation } from '../../features/wishlist/wishlistApiSlice';
import { Heart, Loader2, ShoppingCart, MessageCircle } from 'lucide-react';
import { useGetOrCreateConversationMutation } from '../../features/chat/chatApiSlice';
import { motion } from 'framer-motion';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Rating from '../../components/common/Rating';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import { Link } from 'react-router-dom';
import toast from "react-hot-toast";

// Recently viewed helper
const addToRecentlyViewed = (product) => {
  try {
    const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const filtered = stored.filter((p) => p._id !== product._id);
    filtered.unshift({
      _id: product._id,
      name: product.name,
      basePrice: product.basePrice,
      finalPrice: product.finalPrice,
      discountPercentage: product.discountPercentage,
      images: product.images?.slice(0, 1),
      ratingsAverage: product.ratingsAverage,
    });
    localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 12)));
  } catch {}
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const wishlist = useSelector(selectWishlist);

  const {
    data: productData,
    isLoading,
    isError
  } = useGetProductByIdQuery(id);

  const { data: relatedData } = useGetRelatedProductsQuery(id, { skip: !id });

  const { user } = useSelector((state) => state.auth);
  const [addToApi] = useAddToWishlistApiMutation();
  const [removeFromApi] = useRemoveFromWishlistApiMutation();
  const [createConversation] = useGetOrCreateConversationMutation();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (productData?.product && wishlist) {
      setIsInWishlist(wishlist.some(item => item._id === productData.product._id));
    }
  }, [productData, wishlist]);

  // Track recently viewed
  useEffect(() => {
    if (productData?.product) {
      addToRecentlyViewed(productData.product);
      setSelectedVariants({});
      setQuantity(1);
    }
  }, [productData?.product?._id]);

  // Calculate variant price adjustment
  const getVariantPriceAdjustment = () => {
    let adjustment = 0;
    const product = productData?.product;
    if (product?.variants) {
      for (const variant of product.variants) {
        const selectedValue = selectedVariants[variant.name];
        if (selectedValue) {
          const option = variant.options.find((o) => o.value === selectedValue);
          if (option) adjustment += option.priceAdjustment || 0;
        }
      }
    }
    return adjustment;
  };

  const handleAddToCart = () => {
    if (productData?.product?.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    const product = productData.product;
    const priceAdj = getVariantPriceAdjustment();
    const adjustedPrice = (product.finalPrice || product.basePrice) + priceAdj;

    dispatch(addItem({
      ...product,
      quantity,
      price: adjustedPrice,
      finalPrice: adjustedPrice,
      selectedVariants: Object.keys(selectedVariants).length > 0 ? { ...selectedVariants } : undefined,
    }));

    toast.success('Added to cart successfully');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(productData.product._id));
      if (user) removeFromApi(productData.product._id).catch(() => {});
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(productData.product));
      if (user) addToApi(productData.product._id).catch(() => {});
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

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.name}>
                  <h3 className="text-sm font-semibold mb-2">{variant.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => {
                      const isSelected = selectedVariants[variant.name] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [variant.name]: isSelected ? undefined : option.value,
                            }))
                          }
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          } ${option.stock === 0 ? "opacity-40 line-through" : ""}`}
                          disabled={option.stock === 0}
                        >
                          {option.value}
                          {option.priceAdjustment > 0 && ` (+₹${option.priceAdjustment})`}
                          {option.priceAdjustment < 0 && ` (-₹${Math.abs(option.priceAdjustment)})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {getVariantPriceAdjustment() !== 0 && (
                <p className="text-sm text-blue-600">
                  Adjusted price: ₹{((product.finalPrice || product.basePrice) + getVariantPriceAdjustment()).toFixed(2)}
                </p>
              )}
            </div>
          )}

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
              <div className="flex items-center gap-3">
                <p className="text-gray-600 dark:text-gray-300">{seller.name}</p>
                {user && user._id !== seller._id && (
                  <button
                    onClick={async () => {
                      try {
                        await createConversation({ recipientId: seller._id, productId: product._id }).unwrap();
                        navigate("/chat");
                      } catch (err) {
                        toast.error("Failed to start chat");
                      }
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                )}
              </div>
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

      {/* Reviews Section */}
      <div className="mt-12 space-y-8">
        <hr className="border-gray-200 dark:border-gray-700" />
        <ReviewForm productId={id} />
        <ReviewList productId={id} />
      </div>

      {/* Related Products */}
      {relatedData?.products?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedData.products.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <img
                  src={p.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm">₹{p.finalPrice?.toFixed(2) || p.basePrice?.toFixed(2)}</span>
                    {p.discountPercentage > 0 && (
                      <span className="text-xs text-red-500">{Math.round(p.discountPercentage)}% off</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Rating value={p.ratingsAverage || 0} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;