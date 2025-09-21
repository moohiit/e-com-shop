import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUploadMultipleImagesMutation } from "../../features/upload/uploadApi";
import { useCreateProductMutation } from "../../features/products/productApiSlice";
import { useFetchCategoriesQuery } from "../../features/category/categoryApiSlice";
import toast from "react-hot-toast";

function AddProduct() {
  const { data: response, isLoading: loadingCategories } =
    useFetchCategoriesQuery();
  const categoryData = response?.categories || [];
  const [uploadImages] = useUploadMultipleImagesMutation();
  const [createProduct, { isLoading: creating, isSuccess, error }] =
    useCreateProductMutation();

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
      name: "",
      description: "",
      brand: "",
      basePrice: "",
      taxPercentage: "",
      discountPercentage: "",
      stock: "",
      categories: [],
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    if (files.length === 0) {
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
      if (res.images) {
        toast.success("Image Uploaded Successfully");
      }
      return res.images;
    } catch (err) {
      toast.error(err?.data?.message || "Image Upload Failed");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const uploadedImages = await uploadSelectedImages();
    if (!uploadedImages.length) return;

    try {
      const response = await createProduct({
        ...formData,
        images: uploadedImages,
      }).unwrap();
      if (response.success) {
        reset();
        setImageFiles([]);
        toast.success(response.message || "Product created..");
      }
    } catch (err) {
      console.error("Product creation failed:", err);
      toast.error(err?.data?.message || "Product creation failed..");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Add New Product
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Name */}
        <div>
          <input
            {...register("name", { required: "Product name is required" })}
            placeholder="Product Name"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Product Description"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            rows={4}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Brand */}
        <div>
          <input
            {...register("brand")}
            placeholder="Brand (optional)"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Price, Tax, and Discount */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              step="0.01"
              {...register("basePrice", { required: "Base price is required", min: 0 })}
              placeholder="Base Price"
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            {errors.basePrice && (
              <p className="text-red-500 text-sm mt-1">
                {errors.basePrice.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              {...register("taxPercentage", {
                required: "Tax Percentage is required",
                min: 0,
                max: 100
              })}
              placeholder="Tax Percentage"
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            {errors.taxPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.taxPercentage.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="number"
              step="0.01"
              {...register("discountPercentage", {
                min: 0,
                max: 100
              })}
              placeholder="Discount % (optional)"
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            {errors.discountPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discountPercentage.message}
              </p>
            )}
          </div>
        </div>

        {/* Stock */}
        <div>
          <input
            type="number"
            {...register("stock", {
              required: "Stock is required",
              min: 0
            })}
            placeholder="Stock"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>

        {/* Categories Dropdown (Multiple) */}
        <div>
          <Controller
            control={control}
            name="categories"
            rules={{ required: "At least one category is required" }}
            render={({ field }) => (
              <select
                multiple
                {...field}
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
                value={field.value || []}
                onChange={(e) => {
                  const options = e.target.options;
                  const value = [];
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                      value.push(options[i].value);
                    }
                  }
                  field.onChange(value);
                }}
              >
                <option value="">Select Categories (Hold Ctrl for multiple)</option>
                {!loadingCategories &&
                  categoryData.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            )}
          />
          {errors.categories && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categories.message}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Upload Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:bg-gray-700 file:rounded-lg file:text-sm file:font-semibold"
          />
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || creating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {(uploading || creating) && (
            <Loader2 className="animate-spin" size={18} />
          )}
          {uploading
            ? "Uploading..."
            : creating
              ? "Creating..."
              : "Add Product"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 mt-4">
          Error: {error?.data?.message || "Something went wrong"}
        </p>
      )}
      {isSuccess && (
        <p className="text-green-500 mt-4">Product added successfully!</p>
      )}
    </div>
  );
}

export default AddProduct;