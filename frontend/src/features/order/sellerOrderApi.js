import { apiSlice } from "../../services/apiSlice";

export const sellerOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSellerOrders: builder.query({
      query: () => "/seller-orders",
    }),
    getSellerOrderById: builder.query({
      query: (id) => `/seller-orders/${id}`,
    }),
    updateSellerOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/seller-orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
    }),
  }),
});

export const {
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderStatusMutation,
} = sellerOrderApiSlice;
