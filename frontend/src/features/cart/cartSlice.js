import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem("cart");
    return stored
      ? JSON.parse(stored)
      : {
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
          shippingAddress: null, // Only the selected shipping address
          paymentMethod: null,
        };
  } catch {
    return {
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      shippingAddress: null,
      paymentMethod: null,
    };
  }
};

const saveCartToStorage = (state) => {
  localStorage.setItem("cart", JSON.stringify(state));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCartFromStorage(),
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
      state.totalAmount += (action.payload.discountPrice || action.payload.price);
      saveCartToStorage(state);
    },
    removeItem: (state, action) => {
      const existingItem = state.items.find(
        (item) => item._id === action.payload
      );
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
        } else {
          existingItem.quantity -= 1;
        }
        state.totalQuantity -= 1;
        state.totalAmount -= (existingItem.discountPrice || existingItem.price);
        saveCartToStorage(state);
      }
    },
    deleteItem: (state, action) => {
      const itemToRemove = state.items.find(
        (item) => item._id === action.payload
      );
      if (itemToRemove) {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.totalQuantity -= itemToRemove.quantity;
        state.totalAmount -= (itemToRemove.discountPrice || itemToRemove.price) * itemToRemove.quantity;
        saveCartToStorage(state);
      }
    },
    saveShippingAddress: (state, action) => {
      // Only save the selected shipping address (fetched from the API)
      state.shippingAddress = action.payload;
      saveCartToStorage(state);
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.shippingAddress = null;
      state.paymentMethod = null;
      saveCartToStorage(state);
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
