import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Direct parent categories (can have multiple parents if needed)
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    // All ancestors up the tree (for quick lookup or breadcrumb)
    ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    // Store image (Cloudinary/GCS/S3 URL)
    image: {
      imageUrl: { type: String }, // Cloudinary URL
      publicId: { type: String }, // Cloudinary public ID
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
