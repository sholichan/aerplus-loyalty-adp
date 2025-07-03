import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode"

interface RoleType {
  id: string;
  name: string;
}

interface UserPayload {
  user_name: string;
  role: RoleType;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: UserPayload | null;
}

const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

const initialState: AuthState = {
  token,
  user: token ? jwtDecode<UserPayload>(token) : null,
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
