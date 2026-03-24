import { apiSlice } from "../../services/apiSlice";

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: ({ productId, page = 1, limit = 10, sort = "latest" }) => ({
        url: `/reviews/product/${productId}`,
        params: { page, limit, sort },
      }),
      providesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
      ],
    }),

    getUserReview: builder.query({
      query: (productId) => `/reviews/user/${productId}`,
      providesTags: (result, error, productId) => [
        { type: "Review", id: `user-${productId}` },
      ],
    }),

    createReview: builder.mutation({
      query: ({ productId, data }) => ({
        url: `/reviews/${productId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Review", id: `user-${productId}` },
        { type: "Product", id: productId },
      ],
    }),

    updateReview: builder.mutation({
      query: ({ reviewId, productId, data }) => ({
        url: `/reviews/${reviewId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Review", id: `user-${productId}` },
        { type: "Product", id: productId },
      ],
    }),

    deleteReview: builder.mutation({
      query: ({ reviewId, productId }) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Review", id: `user-${productId}` },
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetUserReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApiSlice;
