import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUploadMultipleImagesMutation } from '../../features/upload/uploadApi';
import { useCreateProductMutation } from '../../features/products/productApiSlice';
import { useFetchCategoriesQuery } from '../../features/category/categoryApiSlice';

function AddProduct() {
  const { data: response, isLoading: loadingCategories } = useFetchCategoriesQuery();
  const categoryData = response?.categories || [];
  console.log('Categories:', response);
  const [uploadImages] = useUploadMultipleImagesMutation();
  const [createProduct, { isLoading: creating, isSuccess, error }] = useCreateProductMutation();

  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      price: '',
      discountPrice: '',
      stock: '',
      category: '',
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    if (files.length === 0) {
      setError('images', { message: 'At least one image is required' });
    } else {
      clearErrors('images');
    }
  };

  const uploadSelectedImages = async () => {
    if (imageFiles.length === 0) return [];

    const formData = new FormData();
    formData.append('folder', 'products');
    imageFiles.forEach((file) => formData.append('images', file));

    setUploading(true);
    try {
      const res = await uploadImages(formData).unwrap();
      return res.images.map((img) => img.imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData) => {
    if (imageFiles.length === 0) {
      setError('images', { message: 'Please upload at least one image' });
      return;
    }

    const uploadedImages = await uploadSelectedImages();
    if (!uploadedImages.length) return;

    try {
      await createProduct({ ...formData, images: uploadedImages }).unwrap();
      reset();
      setImageFiles([]);
      alert('Product created!');
    } catch (err) {
      console.error('Product creation failed:', err);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Product Name */}
        <div>
          <input
            {...register('name', { required: 'Product name is required' })}
            placeholder="Product Name"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <textarea
            {...register('description', { required: 'Description is required' })}
            placeholder="Product Description"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Brand */}
        <div>
          <input
            {...register('brand')}
            placeholder="Brand (optional)"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Price and Discount Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              {...register('price', { required: 'Price is required' })}
              placeholder="Price"
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <input
              type="number"
              {...register('discountPrice')}
              placeholder="Discount Price (optional)"
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <input
            type="number"
            {...register('stock', { required: 'Stock is required' })}
            placeholder="Stock"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
        </div>

        {/* Category Dropdown */}
        <div>
          <Controller
            control={control}
            name="category"
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Category</option>
                {!loadingCategories &&
                  categoryData.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            )}
          />
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Upload Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:bg-gray-700 file:rounded-lg file:text-sm file:font-semibold"
          />
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || creating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {(uploading || creating) && <Loader2 className="animate-spin" size={18} />}
          {uploading ? 'Uploading...' : creating ? 'Creating...' : 'Add Product'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">Error: {error?.data?.message || 'Something went wrong'}</p>}
      {isSuccess && <p className="text-green-500 mt-4">Product added successfully!</p>}
    </div>
  );
}

export default AddProduct;
