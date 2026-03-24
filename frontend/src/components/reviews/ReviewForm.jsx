import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useGetUserReviewQuery,
} from "../../features/reviews/reviewApiSlice";
import StarRatingInput from "./StarRatingInput";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const ReviewForm = ({ productId }) => {
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: userReviewData, isLoading: loadingUserReview } =
    useGetUserReviewQuery(productId, { skip: !user });

  const [createReview, { isLoading: creating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();

  const existingReview = userReviewData?.review;

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    }
  }, [existingReview]);

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            log in
          </a>{" "}
          to write a review.
        </p>
      </div>
    );
  }

  if (loadingUserReview) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // User already has a review and is not editing
  if (existingReview && !isEditing) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">Your Review</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
        </div>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              className={
                star <= existingReview.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>
        {existingReview.comment && (
          <p className="text-gray-600 dark:text-gray-300">
            {existingReview.comment}
          </p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      if (existingReview && isEditing) {
        await updateReview({
          reviewId: existingReview._id,
          productId,
          data: { rating, comment },
        }).unwrap();
        toast.success("Review updated");
        setIsEditing(false);
      } else {
        await createReview({
          productId,
          data: { rating, comment },
        }).unwrap();
        toast.success("Review submitted");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your experience with this product..."
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={creating || updating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {(creating || updating) && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {isEditing ? "Update Review" : "Submit Review"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setRating(existingReview.rating);
              setComment(existingReview.comment || "");
            }}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Need Star for the "Your Review" display
import { Star } from "lucide-react";

export default ReviewForm;
