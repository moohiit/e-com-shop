import { apiSlice } from "../../services/apiSlice";

export const sellerOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ QUERY: Fetch all seller orders
    getSellerOrders: builder.query({
      query: () => "/seller-orders",
      providesTags: ["SellerOrder"], // provides the list tag
    }),

    // ✅ QUERY: Fetch single seller order by ID
    getSellerOrderById: builder.query({
      query: (id) => `/seller-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "SellerOrder", id }],
    }),

    // ✅ MUTATION: Update seller order status
    updateSellerOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/seller-orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SellerOrder", id },
        "SellerOrder", // also invalidate the list
      ],
    }),

    // ✅ MUTATION: Cancel a seller order
    cancelSellerOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/seller-orders/${id}/cancel`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SellerOrder", id },
        "SellerOrder", // also invalidate the list
      ],
    }),

  }),
});

export const {
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderStatusMutation,
  useCancelSellerOrderMutation,
} = sellerOrderApiSlice;
