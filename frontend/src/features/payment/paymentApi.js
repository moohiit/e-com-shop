import { apiSlice } from "../../services/apiSlice";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: "/payment/order",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: "/payment/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});
export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} = paymentApiSlice;