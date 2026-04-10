import { createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "../auth/authSlice";

// Wishlist key is scoped per user — prevents item leaking between accounts
const wishlistKey = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.id) return `wishlist_${payload.id}`;
    }
  } catch {}
  return "wishlist_guest";
};

const loadWishlistFromStorage = () => {
  try {
    const stored = localStorage.getItem(wishlistKey());
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem(wishlistKey(), JSON.stringify(items));
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
      localStorage.removeItem(wishlistKey());
      return [];
    },
    setWishlistFromServer: (_state, action) => {
      const items = action.payload || [];
      saveToStorage(items);
      return items;
    },
    // Re-load wishlist from localStorage for the current user (call after login)
    reloadWishlistForUser: () => {
      return loadWishlistFromStorage();
    },
  },
  extraReducers: (builder) => {
    // On logout, reset wishlist state
    builder.addCase(logoutUser.fulfilled, () => {
      return [];
    });
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist,
  setWishlistFromServer,
  reloadWishlistForUser,
} = wishlistSlice.actions;

export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist;

export default wishlistSlice.reducer;
