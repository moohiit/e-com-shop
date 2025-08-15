import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useFetchCategoriesQuery } from "../features/category/categoryApiSlice";
import { useUpdateProductMutation } from "../features/products/productApiSlice";
import { useUploadMultipleImagesMutation } from "../features/upload/uploadApi";
import { useDispatch, useSelector } from "react-redux";
import { clearSelectedProduct } from "../features/products/productSlice";

function EditProductModal({ onClose }) {
  const { selectedProduct: product } = useSelector((state) => state.product);
  const { data: response, isLoading: loadingCategories } = useFetchCategoriesQuery();
  const categoryData = response?.categories || [];
  const [uploadImages] = useUploadMultipleImagesMutation();
  const [updateProduct, { isLoading: updating, isSuccess, error }] = useUpdateProductMutation();

  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(product.images || []);
  const dispatch = useDispatch();

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
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      taxPercentage: product.taxPercentage,
      discountPrice: product.discountPrice,
      stock: product.stock,
      category: product.category,
    },
  });

  useEffect(() => {
    reset({
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      taxPercentage: product.taxPercentage,
      discountPrice: product.discountPrice,
      stock: product.stock,
      category: product.category,
    });
    setExistingImages(product.images || []);
  }, [product, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    if (files.length === 0 && existingImages.length === 0) {
      setError("images", { message: "At least one image is required" });
    } else {
      clearErrors("images");
    }
  };

  const uploadSelectedImages = async () => {
    if (imageFiles.length === 0) return [];

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    setUploading(true);
    try {
      const res = await uploadImages({ formData, folder: "products" }).unwrap();
      if (res.images) toast.success("Image(s) uploaded successfully");
      return res.images;
    } catch (err) {
      toast.error(err.message || "Image Upload Failed");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData) => {
    if (imageFiles.length === 0 && existingImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    let uploadedImages = [];
    if (imageFiles.length > 0) {
      uploadedImages = await uploadSelectedImages();
      if (!uploadedImages.length) return;
    }

    try {
      const payload = {
        ...formData,
        images: [...existingImages, ...uploadedImages],
      };
      const response = await updateProduct({ id: product._id, data: payload }).unwrap();
      if (response.success) {
        toast.success(response.message || "Product updated successfully");
        dispatch(clearSelectedProduct());
        onClose();
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.message || "Product update failed");
    }
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 dark:text-gray-300"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Product</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input {...register("name", { required: "Product name is required" })} placeholder="Product Name" className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

          <textarea {...register("description", { required: "Description is required" })} placeholder="Product Description" rows={4} className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}

          <input {...register("brand")} placeholder="Brand (optional)" className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="number" {...register("price", { required: "Price is required" })} placeholder="Price" className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <input type="number" {...register("taxPercentage", { required: "Tax Percentage is required" })} placeholder="Tax Percentage" className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />
              {errors.taxPercentage && <p className="text-red-500 text-sm mt-1">{errors.taxPercentage.message}</p>}
            </div>
            <div>
              <input type="number" {...register("discountPrice")} placeholder="Discount Price (optional)" className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <input type="number" {...register("stock", { required: "Stock is required" })} placeholder="Stock" className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white" />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}

          <Controller control={control} name="category" rules={{ required: "Category is required" }} render={({ field }) => (
            <select {...field} className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white">
              <option value="">Select Category</option>
              {!loadingCategories && categoryData.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          )} />
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}

          {/* Existing Images */}
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={img.imageUrl} alt="product" className="w-full h-full object-cover rounded-md" />
                <button type="button" onClick={() => removeExistingImage(img)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Upload New Images</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:bg-gray-700 file:rounded-lg file:text-sm file:font-semibold" />
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>}
          </div>

          <button type="submit" disabled={uploading || updating} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {(uploading || updating) && <Loader2 className="animate-spin" size={18} />}
            {uploading ? "Uploading..." : updating ? "Updating..." : "Update Product"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4">Error: {error?.data?.message || "Something went wrong"}</p>}
        {isSuccess && <p className="text-green-500 mt-4">Product updated successfully!</p>}
      </div>
    </div>
  );
}

export default EditProductModal;
