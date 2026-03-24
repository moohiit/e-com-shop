import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate and update product's average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const Product = mongoose.model("Product");

  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRating,
      numReviews: result[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      numReviews: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

// Recalculate after delete
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.product);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
