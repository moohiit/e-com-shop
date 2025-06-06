// optional file if you want to track modal state or other local UI states
import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "categoryUI",
  initialState: {
    selectedCategory: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
