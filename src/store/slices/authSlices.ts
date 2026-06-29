import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

export interface ModulePermission {
  module: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface RoleType {
  id: string;
  name: string;
  permissions: string[];
  module_permissions: ModulePermission[];
}

interface UserPayload {
  user_id: string;
  user_name: string;
  role: RoleType;
  permissions: string[];
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

const initialState: AuthState = {
  token: null,
  user: null,
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
