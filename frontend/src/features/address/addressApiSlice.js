import { apiSlice } from "../../services/apiSlice.js";

export const addressApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all addresses
    getAddresses: builder.query({
      query: () => "/addresses",
      providesTags: ["Addresses"],
    }),

    // Create new address
    createAddress: builder.mutation({
      query: (addressData) => ({
        url: "/addresses",
        method: "POST",
        body: addressData,
      }),
      invalidatesTags: ["Addresses"],
    }),

    // Update an address
    updateAddress: builder.mutation({
      query: ({ id, addressData }) => ({
        url: `/addresses/${id}`,
        method: "PUT",
        body: addressData,
      }),
      invalidatesTags: ["Addresses"],
    }),

    // Delete an address
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses"],
    }),
    
    // Set default address
    setDefaultAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Addresses", id },
        "Addresses",
      ],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApiSlice;
