"use client"
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { store } from "@/store";
import { Provider } from "react-redux";
import { ToastContainer } from 'react-toastify';


const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/icon.webp" sizes="any" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ToastContainer style={{ zIndex: 99999 }} position='top-center' />
        <ThemeProvider>
          <Provider store={store}>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
