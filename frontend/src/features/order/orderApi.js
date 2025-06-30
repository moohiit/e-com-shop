import { apiSlice } from "../../services/apiSlice";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Order
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
    }),

    // Get All Orders (Admin)
    getAllOrders: builder.query({
      query: () => "/orders",
    }),

    // Get My Orders
    getMyOrders: builder.query({
      query: () => "/orders/myorders",
    }),

    // Get Order By ID
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
    }),

    // Mark Order As Paid
    updateOrderToPaid: builder.mutation({
      query: ({ id, paymentResult }) => ({
        url: `/orders/${id}/pay`,
        method: "PUT",
        body: paymentResult,
      }),
    }),

    // Mark Order As Delivered
    updateOrderToDelivered: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/deliver`,
        method: "PUT",
      }),
    }),

    // Delete Order
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderToPaidMutation,
  useUpdateOrderToDeliveredMutation,
  useDeleteOrderMutation,
} = orderApi;
