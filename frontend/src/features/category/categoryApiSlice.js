import { apiSlice } from "../../services/apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchCategories: builder.query({
      query: () => "/category",
      providesTags: ["Category"],
    }),
    fetchAllCategories: builder.query({
      query: () => "/category/all",
      providesTags: ["Category"],
    }),
    addCategory: builder.mutation({
      query: (data) => ({
        url: "/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    toggleCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useFetchCategoriesQuery,
  useFetchAllCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryMutation,
} = categoryApiSlice;
