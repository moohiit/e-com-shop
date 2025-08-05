import { apiSlice } from "../../services/apiSlice";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create Order
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order", "MyOrder", "AdminOrder"],
    }),

    // ✅ Get All Orders (Admin)
    getAllOrders: builder.query({
      query: ({ page }) => `/orders?page=${page}`,
      providesTags: ["AdminOrder"],
    }),

    // ✅ Get My Orders
    getMyOrders: builder.query({
      query: ({ page }) => `/orders/myorders?page=${page}`,
      providesTags: ["MyOrder"],
    }),

    // ✅ Get Order By ID
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // ✅ Mark Order As Paid
    updateOrderToPaid: builder.mutation({
      query: ({ id, paymentResult }) => ({
        url: `/orders/${id}/pay`,
        method: "PUT",
        body: paymentResult,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        "MyOrder",
        "AdminOrder",
      ],
    }),

    // ✅ Delete Order
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        "MyOrder",
        "AdminOrder",
      ],
    }),

    // ✅ Cancel Order
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        "MyOrder",
        "AdminOrder",
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderToPaidMutation,
  useDeleteOrderMutation,
  useCancelOrderMutation,
} = orderApi;
