import { apiSlice } from "../../services/apiSlice";

export const sellerApplicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitSellerApplication: builder.mutation({
      query: (data) => ({
        url: "/seller-applications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SellerApplication"],
    }),

    getMyApplications: builder.query({
      query: () => "/seller-applications/my",
      providesTags: ["SellerApplication"],
    }),

    getAllApplications: builder.query({
      query: (params) => ({
        url: "/seller-applications/admin",
        params,
      }),
      providesTags: ["SellerApplication"],
    }),

    reviewApplication: builder.mutation({
      query: ({ id, status, adminNote }) => ({
        url: `/seller-applications/admin/${id}`,
        method: "PUT",
        body: { status, adminNote },
      }),
      invalidatesTags: ["SellerApplication", "User"],
    }),
  }),
});

export const {
  useSubmitSellerApplicationMutation,
  useGetMyApplicationsQuery,
  useGetAllApplicationsQuery,
  useReviewApplicationMutation,
} = sellerApplicationApi;
