import { createSlice } from "@reduxjs/toolkit";

const loadWishlistFromStorage = () => {
  try {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: loadWishlistFromStorage(),
  reducers: {
    addToWishlist: (state, action) => {
      if (!state.some((item) => item._id === action.payload._id)) {
        state.push(action.payload);
        localStorage.setItem("wishlist", JSON.stringify(state));
      }
    },
    removeFromWishlist: (state, action) => {
      const newState = state.filter((item) => item._id !== action.payload);
      localStorage.setItem("wishlist", JSON.stringify(newState));
      return newState;
    },
    moveToCart: (state, action) => {
      // This would dispatch both removeFromWishlist and addToCart actions
      const newState = state.filter((item) => item._id !== action.payload._id);
      localStorage.setItem("wishlist", JSON.stringify(newState));
      return newState;
    },
    clearWishlist: () => {
      localStorage.removeItem("wishlist");
      return [];
    },
  },
});
export const selectWishlist = (state) => state.wishlist;
export const { addToWishlist, removeFromWishlist, moveToCart, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
