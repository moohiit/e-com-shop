// features/auth/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { logout as logoutAction } from "./authSlice";
import { apiSlice } from "../../services/apiSlice";
import toast from "react-hot-toast";
import { useLogoutMutation } from "./authApi";
const [logoutApi] = useLogoutMutation();

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Call backend logout endpoint
      const response = await dispatch(logoutApi()).unwrap();
      if (response.data.success) {
        console.log("Logout successfully");
      }
      // Clear auth state
      dispatch(logoutAction());

      // Reset RTK Query cache
      dispatch(apiSlice.util.resetApiState());

      toast.success("Logged out successfully");
      return response;
    } catch (err) {
      toast.error("Logout failed");
      return rejectWithValue(err);
    }
  }
);
