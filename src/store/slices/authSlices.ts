import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

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

const isTokenValid = (token: string): boolean => {
  try {
    const decoded: UserPayload = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

const initialState: AuthState = {
  token: token && isTokenValid(token) ? token : null,
  user: token && isTokenValid(token) ? jwtDecode<UserPayload>(token) : null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      if (isTokenValid(action.payload)) {
        state.token = action.payload;
        localStorage.setItem("token", action.payload);
        try {
          const decoded: UserPayload = jwtDecode(action.payload);
          state.user = decoded;
        } catch {
          state.user = null;
        }
      } else {
        state.token = null;
        state.user = null;
        localStorage.removeItem("token");
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
