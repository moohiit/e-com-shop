import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetProductReviewsQuery, useDeleteReviewMutation } from "../../features/reviews/reviewApiSlice";
import Rating from "../common/Rating";
import { Loader2, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";

const ReviewList = ({ productId }) => {
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("latest");

  const { data, isLoading, isFetching } = useGetProductReviewsQuery({
    productId,
    page,
    limit: 5,
    sort,
  });

  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation();

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview({ reviewId, productId }).unwrap();
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Customer Reviews ({pagination?.total || 0})
        </h3>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
        >
          <option value="latest">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-4">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {review.user?.avatar?.imageUrl ? (
                    <img
                      src={review.user.avatar.imageUrl}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{review.user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Rating value={review.rating} />
                  {user &&
                    (review.user?._id === user.id || user.role === "admin") && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={deleting}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                </div>
              </div>

              {review.comment && (
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages || isFetching}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
