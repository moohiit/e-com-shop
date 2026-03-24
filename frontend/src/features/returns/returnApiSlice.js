import { apiSlice } from "../../services/apiSlice";

export const returnApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User: create return request
    createReturnRequest: builder.mutation({
      query: (data) => ({
        url: "/returns",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Return", "Order", "MyOrder"],
    }),

    // User: get my returns
    getMyReturns: builder.query({
      query: () => "/returns/my-returns",
      providesTags: ["Return"],
    }),

    // Seller: get return requests
    getSellerReturns: builder.query({
      query: (status) => ({
        url: "/returns/seller",
        params: status ? { status } : {},
      }),
      providesTags: ["Return"],
    }),

    // Seller: approve return
    approveReturn: builder.mutation({
      query: ({ id, sellerNote }) => ({
        url: `/returns/${id}/approve`,
        method: "PUT",
        body: { sellerNote },
      }),
      invalidatesTags: ["Return", "SellerOrder", "Order", "MyOrder"],
    }),

    // Seller: reject return
    rejectReturn: builder.mutation({
      query: ({ id, sellerNote }) => ({
        url: `/returns/${id}/reject`,
        method: "PUT",
        body: { sellerNote },
      }),
      invalidatesTags: ["Return"],
    }),

    // Admin: get all returns
    getAllReturns: builder.query({
      query: (status) => ({
        url: "/returns/admin",
        params: status ? { status } : {},
      }),
      providesTags: ["Return"],
    }),
  }),
});

export const {
  useCreateReturnRequestMutation,
  useGetMyReturnsQuery,
  useGetSellerReturnsQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
  useGetAllReturnsQuery,
} = returnApiSlice;
