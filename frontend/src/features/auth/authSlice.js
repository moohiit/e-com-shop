import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {jwtDecode} from 'jwt-decode'
import { apiSlice } from '../../services/apiSlice'
import toast from 'react-hot-toast'

const token = localStorage.getItem('token')
let user = null

if (token) {
  try {
    const decoded = jwtDecode(token)
    const isExpired = decoded.exp * 1000 < Date.now()
    if (!isExpired) user = decoded
    else localStorage.removeItem('token')
  } catch (e) {
    localStorage.removeItem('token')
  }
}

const initialState = {
  user,
  token,
}

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      // ❗ Call mutation manually using `initiate`
      const response = await dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
      if (response.success) {
        // Reset API cache
        dispatch(apiSlice.util.resetApiState());
        toast.success(response.message || "Logout Successful")
        // Optional: Clear token from localStorage
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message || error.response.message || "Lougout Error.")
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const token = action.payload.token;
      const user = action.payload.user;
      localStorage.setItem("token", token);
      state.token = token;
      state.user = user;
    },
    updateProfile(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
    });
  },
});

export const { loginSuccess, updateProfile } = authSlice.actions
export default authSlice.reducer
