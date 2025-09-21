import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useUploadMultipleImagesMutation } from "../features/upload/uploadApi";
import { useAddCategoryMutation } from "../features/category/categoryApiSlice";

function CategoryModal({ onClose }) {
  const [createCategory, { isLoading: creating }] = useAddCategoryMutation();
  const [uploadImages] = useUploadMultipleImagesMutation();

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm({
    defaultValues: { name: "", slug: "", parent: "" },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file);
    if (!file) {
      setError("image", { message: "Category image is required" });
    } else {
      clearErrors("image");
    }
  };

  const uploadCategoryImage = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("images", imageFile);
    setUploading(true);
    try {
      const res = await uploadImages({ formData, folder: "categories" }).unwrap();
      if (res.images && res.images[0]) {
        toast.success("Image uploaded successfully");
        return res.images[0]; // { imageUrl, publicId }
      }
    } catch (err) {
      toast.error(err.message || "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData) => {
    if (!imageFile) {
      toast.error("Please upload a category image");
      return;
    }

    const uploadedImage = await uploadCategoryImage();
    if (!uploadedImage) return;

    const payload = {
      name: formData.name,
      slug: formData.slug,
      parents: formData.parent ? [formData.parent] : [],
      image: uploadedImage,
    };

    try {
      await createCategory(payload).unwrap();
      toast.success("Category created successfully");
      reset();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Category creation failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 dark:text-gray-300"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add Category</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="Category Name"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

          <input
            {...register("slug", { required: "Slug is required" })}
            placeholder="Slug (unique URL key)"
            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
          />
          {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}

          {/* If you allow selecting a parent category */}
          {/* <select {...register("parent")} className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white">
            <option value="">No Parent (Top-level)</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select> */}

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 dark:file:bg-gray-700 file:rounded-lg file:text-sm file:font-semibold"
            />
            {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
          </div>

          <button
            type="submit"
            disabled={creating || uploading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {(creating || uploading) && <Loader2 className="animate-spin" size={18} />}
            {uploading ? "Uploading..." : creating ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
