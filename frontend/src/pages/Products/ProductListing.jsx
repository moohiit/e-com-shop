import { motion } from 'framer-motion';
import { ProductCard, Filters, Pagination } from '../../components';
import { useGetProductsQuery } from '../../features/products/productApi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const ProductListing = () => {
  const { data: products, isLoading } = useGetProductsQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <Filters />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product._id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Pagination />
    </div>
  );
};