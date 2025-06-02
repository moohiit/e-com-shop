// features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit'
import {jwtDecode} from 'jwt-decode'

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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const token = action.payload.token
      const user = action.payload.user
      localStorage.setItem('token', token)
      state.token = token
      state.user = user
    },
    logout: (state) => {
      localStorage.removeItem('token')
      state.token = null
      state.user = null
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
