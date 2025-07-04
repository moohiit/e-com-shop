import { apiSlice } from "../../services/apiSlice.js";

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    resendVerification: builder.mutation({
      query: ({ email }) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: { email },
      }),
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/auth/verify-email/${token}`,
        method: "GET",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "GET",
      }),
      invalidatesTags: ["User", "Cart"],
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
      }),
    }),
    sendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/user/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateProfliePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/user/profile/update-password",
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
      invalidatesTags: ["User"],
    }),
    getProfile: builder.query({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),
    // Admin endpoints
    getAllUsers: builder.query({
      query: () => "/auth/users",
      providesTags: ["User"],
      transformResponse: (response) => response.users,
    }),
    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/auth/users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    sendContactMessage: builder.mutation({
      query: (data) => ({
        url: "/auth/contact",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
  useRefreshMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdateProfliePasswordMutation,
  useGetProfileQuery,
  // Admin hooks
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSendContactMessageMutation,
} = authApiSlice;
