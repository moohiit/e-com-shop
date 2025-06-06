import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedProduct: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    },
  },
})

export const { setSelectedProduct, clearSelectedProduct } = productSlice.actions
export default productSlice.reducer
