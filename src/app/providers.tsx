"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { store } from "@/store";
import { setToken } from "@/store/slices/authSlices";

function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      dispatch(setToken(storedToken));
    }
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AuthHydrator />
        <ToastContainer style={{ zIndex: 99999 }} position="top-center" />
        <SidebarProvider>{children}</SidebarProvider>
      </Provider>
    </ThemeProvider>
  );
}
