import { apiSlice } from "../../services/apiSlice";

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadMultipleImages: builder.mutation({
      query: (formData) => ({
        url: '/upload/multiple',
        method: 'POST',
        body: formData,
      }),
    }),
    uploadSingleImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/single',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const { useUploadMultipleImagesMutation, useUploadSingleImageMutation } = uploadApi;
