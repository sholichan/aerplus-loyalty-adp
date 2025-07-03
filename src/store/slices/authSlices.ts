import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {jwtDecode} from "jwt-decode"

interface UserPayload {
  user_name: string;
  role: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: UserPayload | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
  user: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
      try {
        const decoded: UserPayload = jwtDecode(action.payload);
        state.user = decoded;
      } catch {
        state.user = null;
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    }
  }
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
