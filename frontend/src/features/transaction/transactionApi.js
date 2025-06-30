import { apiSlice } from "../../services/apiSlice";

export const transactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation({
      query: (data) => ({
        url: "/transactions/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
    verifyTransaction: builder.mutation({
      query: (data) => ({
        url: "/transactions/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: "Transaction", id }],
    }),
    getAllUserTransactions: builder.query({
      query: () => "/transactions",
      providesTags: ["Transaction"],
    }),
    getAllTransactions: builder.query({
      query: () => "/transactions/admin",
      providesTags: ["Transaction"],
    }),
    updateTransactionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/transactions/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Transaction", id }],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Transaction", id }],
    }),
    getUserTransactions: builder.query({
      query: (userId) => `/transactions/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Transaction", id: userId }],
    }),
  }),
});
export const {
  useCreateTransactionMutation,
  useVerifyTransactionMutation,
  useGetTransactionByIdQuery,
  useGetAllUserTransactionsQuery,
  useGetAllTransactionsQuery,
  useUpdateTransactionStatusMutation,
  useDeleteTransactionMutation,
  useGetUserTransactionsQuery,
} = transactionApiSlice;