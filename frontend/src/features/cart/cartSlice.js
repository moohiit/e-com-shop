import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  shippingAddress: null,
  paymentMethod: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalQuantity += 1;
      state.totalAmount += action.payload.price;
    },
    removeItem: (state, action) => {
      const existingItem = state.items.find(
        (item) => item._id === action.payload
      );
      if (existingItem.quantity === 1) {
        state.items = state.items.filter((item) => item._id !== action.payload);
      } else {
        existingItem.quantity -= 1;
      }
      state.totalQuantity -= 1;
      state.totalAmount -= existingItem.price;
    },
    deleteItem: (state, action) => {
      const itemToRemove = state.items.find(
        (item) => item._id === action.payload
      );
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.totalQuantity -= itemToRemove.quantity;
      state.totalAmount -= itemToRemove.price * itemToRemove.quantity;
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const {
  addItem,
  removeItem,
  deleteItem,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
