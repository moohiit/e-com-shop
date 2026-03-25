import { apiSlice } from "../../services/apiSlice";

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),

    syncCart: builder.mutation({
      query: (items) => ({
        url: "/cart/sync",
        method: "PUT",
        body: { items },
      }),
      invalidatesTags: ["Cart"],
    }),

    addToCartApi: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: "/cart",
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItemApi: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/cart/${productId}`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCartApi: builder.mutation({
      query: (productId) => ({
        url: `/cart/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCartApi: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useSyncCartMutation,
  useAddToCartApiMutation,
  useUpdateCartItemApiMutation,
  useRemoveFromCartApiMutation,
  useClearCartApiMutation,
} = cartApiSlice;
