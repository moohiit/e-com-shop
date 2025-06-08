import { apiSlice } from "../../services/apiSlice"


export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/product',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    fetchAllProducts: builder.query({
      query: (params) => ({
        url: '/product',
        params,
      }),
      providesTags: ['Product'],
    }),

    fetchAllProductsAdmin: builder.query({
      query: (params) => ({
        url: '/product/admin',
        params,
      }),
      providesTags: ['Product'],
    }),

    fetchAllProductsSeller: builder.query({
      query: (params) => ({
        url: '/product/seller',
        params,
      }),
      providesTags: ['Product'],
    }),

    getProductById: builder.query({
      query: (id) => `/product/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product' },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    toggleProduct: builder.mutation({
      query: (id) => ({
        url: `/product/toggle/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product'],
    }),

    getProductCount: builder.query({
      query: () => '/product/count',
    }),

    getProductsByCategory: builder.query({
      query: (categoryId) => `/product/category/${categoryId}`,
      providesTags: ['Product'],
    }),
  }),
})

export const {
  useCreateProductMutation,
  useFetchAllProductsQuery,
  useFetchAllProductsAdminQuery,
  useFetchAllProductsSellerQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductMutation,
  useGetProductCountQuery,
  useGetProductsByCategoryQuery,
} = productApiSlice
