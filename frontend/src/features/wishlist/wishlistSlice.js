import { createSlice } from "@reduxjs/toolkit";

const loadWishlistFromStorage = () => {
  try {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem("wishlist", JSON.stringify(items));
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: loadWishlistFromStorage(),
  reducers: {
    addToWishlist: (state, action) => {
      if (!state.some((item) => item._id === action.payload._id)) {
        state.push(action.payload);
        saveToStorage(state);
      }
    },
    removeFromWishlist: (state, action) => {
      const newState = state.filter((item) => item._id !== action.payload);
      saveToStorage(newState);
      return newState;
    },
    moveToCart: (state, action) => {
      const newState = state.filter((item) => item._id !== action.payload._id);
      saveToStorage(newState);
      return newState;
    },
    clearWishlist: () => {
      localStorage.removeItem("wishlist");
      return [];
    },
    setWishlistFromServer: (_state, action) => {
      const items = action.payload || [];
      saveToStorage(items);
      return items;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist,
  setWishlistFromServer,
} = wishlistSlice.actions;

export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist;

export default wishlistSlice.reducer;
