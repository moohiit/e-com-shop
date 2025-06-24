import { apiSlice } from "../../services/apiSlice.js";


const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminGetAllUsers: builder.query({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["User"],
    }),
    adminGetUserById: builder.query({
      query: (id) => `/admin/user/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    adminUpdateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User" },
      ],
    }),
    adminDeleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User" },
      ],
    }),
    adminToggleUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User" },
      ],
    }),
    adminGetDashboardData: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});


export const {
  useAdminGetAllUsersQuery,
  useAdminGetUserByIdQuery,
  useAdminUpdateUserMutation,
  useAdminDeleteUserMutation,
  useAdminToggleUserMutation,
  useAdminGetDashboardDataQuery
} = adminApiSlice;