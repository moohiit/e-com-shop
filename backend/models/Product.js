import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    // --- Pricing & Tax ---
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        imageUrl: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    // --- Category relationship (multi-category support) ---
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    // --- Ratings ---
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10, // round to 1 decimal
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ---------- Virtuals ---------- */
// Compute final price after discount + tax
productSchema.virtual("finalPrice").get(function () {
  const discounted = this.basePrice * (1 - this.discountPercentage / 100);
  const taxAmount = discounted * (this.taxPercentage / 100);
  return +(discounted + taxAmount).toFixed(2);
});

productSchema.virtual("discountAmount").get(function () {
  return +((this.basePrice * this.discountPercentage) / 100).toFixed(2);
});

productSchema.virtual("taxAmount").get(function () {
  const discounted = this.basePrice * (1 - this.discountPercentage / 100);
  return +(discounted * (this.taxPercentage / 100)).toFixed(2);
});

/* ---------- Hooks ---------- */
// Auto-generate slug if missing or name changed
productSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

/* ---------- Indexes ---------- */
productSchema.index({ slug: 1 });
productSchema.index({ isActive: 1, categories: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
