import { motion } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useAddToCart, useAddToWishlist } from '../../features';

export const ProductCard = ({ product }) => {
  const [addToCart] = useAddToCart();
  const [addToWishlist] = useAddToWishlist();

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300"
    >
      <div className="relative group">
        <LazyLoadImage
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
          effect="blur"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => addToWishlist(product._id)}
            className="bg-white p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
          >
            <FaHeart />
          </button>
          <button
            onClick={() => addToCart(product._id)}
            className="bg-white p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">${product.price}</span>
          <span className="text-sm text-gray-500">{product.rating} ★</span>
        </div>
      </div>
    </motion.div>
  );
};