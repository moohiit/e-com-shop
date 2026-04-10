import { createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "../auth/authSlice";

const defaultState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  shippingAddress: null,
  paymentMethod: null,
};

// Cart key is scoped per user so switching accounts never leaks items.
const cartKey = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.id) return `cart_${payload.id}`;
    }
  } catch {}
  return "cart_guest";
};

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(cartKey());
    return stored ? JSON.parse(stored) : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
};

const saveCartToStorage = (state) => {
  localStorage.setItem(cartKey(), JSON.stringify(state));
};

const recalcTotals = (state) => {
  state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
  state.totalAmount = state.items.reduce(
    (sum, i) => sum + (i.finalPrice || i.basePrice || 0) * i.quantity,
    0
  );
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
      recalcTotals(state);
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
        recalcTotals(state);
        saveCartToStorage(state);
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      recalcTotals(state);
      saveCartToStorage(state);
    },
    saveShippingAddress: (state, action) => {
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
    setCartFromServer: (state, action) => {
      const serverItems = action.payload || [];
      state.items = serverItems.map((item) => {
        const product = item.product || item;
        return {
          ...product,
          _id: product._id,
          quantity: item.quantity || 1,
        };
      });
      recalcTotals(state);
      saveCartToStorage(state);
    },
    // Re-load cart from localStorage for the current user (call after login)
    reloadCartForUser: (state) => {
      const loaded = loadCartFromStorage();
      state.items = loaded.items || [];
      state.totalQuantity = loaded.totalQuantity || 0;
      state.totalAmount = loaded.totalAmount || 0;
      state.shippingAddress = loaded.shippingAddress || null;
      state.paymentMethod = loaded.paymentMethod || null;
    },
  },
  extraReducers: (builder) => {
    // On logout, reset cart state to empty (next login will load that user's cart)
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.shippingAddress = null;
      state.paymentMethod = null;
    });
  },
});

export const {
  addItem,
  removeItem,
  deleteItem,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  setCartFromServer,
  reloadCartForUser,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
