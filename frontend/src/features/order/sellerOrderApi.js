import { apiSlice } from "../../services/apiSlice";

export const sellerOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ QUERY: Fetch all seller orders
    getSellerOrders: builder.query({
      query: ({ page }) => `/seller-orders?page=${page}`,
      providesTags: ["SellerOrder"],
    }),

    // ✅ QUERY: Fetch single seller order by ID
    getSellerOrderById: builder.query({
      query: (id) => `/seller-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "SellerOrder", id }],
    }),

    // ✅ MUTATION: Update seller order item status
    updateSellerOrderItemStatus: builder.mutation({
      query: ({ id, productId, status }) => ({
        url: `/seller-orders/${id}/item-status`,
        method: "PUT",
        body: { productId, status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SellerOrder", id },
        "SellerOrder",
        "Order",
      ],
    }),

    // ✅ MUTATION: Cancel a seller order item
    cancelSellerOrderItem: builder.mutation({
      query: ({ id, productId, reason }) => ({
        url: `/seller-orders/${id}/cancel-item`,
        method: "PUT",
        body: { productId, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SellerOrder", id },
        "SellerOrder",
        "Order",
      ],
    }),
  }),
});

export const {
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderItemStatusMutation,
  useCancelSellerOrderItemMutation,
} = sellerOrderApiSlice;
