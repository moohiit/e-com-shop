import { apiSlice } from "../../services/apiSlice";

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadMultipleImages: builder.mutation({
      query: ({ formData, folder }) => ({
        url: "/upload/multiple",
        method: "POST",
        body: formData,
        headers: {
          "x-upload-folder": folder,
        },
      }),
    }),

    uploadSingleImage: builder.mutation({
      query: ({ formData, folder }) => ({
        url: "/upload/single",
        method: "POST",
        body: formData,
        headers: {
          "x-upload-folder": folder,
        },
      }),
    }),
  }),
});

export const { useUploadMultipleImagesMutation, useUploadSingleImageMutation } =
  uploadApi;
