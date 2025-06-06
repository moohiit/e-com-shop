import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../services/apiSlice.js";
import authReducer from "../features/auth/authSlice.js";
import cartReducer from "../features/cart/cartSlice.js";
// Optional: if you're keeping UI-related category state (like selectedCategory)
import categoryUIReducer from "../features/category/categorySlice.js"; // <- optional

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // <- apiSlice reducer
    auth: authReducer,
    cart: cartReducer,
    categoryUI: categoryUIReducer, // <- optional, if you have UI state for categories
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});
