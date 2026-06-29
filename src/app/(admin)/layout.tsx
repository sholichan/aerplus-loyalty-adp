"use client";

import { PulseLoading } from "@/components/common/loading";
import { OutletProvider } from "@/context/OutletContext";
import { useSidebar } from "@/context/SidebarContext";
import { RootState } from "@/store";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import { getModuleForPath } from "@/layout/sidebar-menu.config";
import Backdrop from "@/layout/Backdrop";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const SUPER_ADMIN = "super admin";

/** Cek apakah user boleh akses path berdasarkan module_permissions */
function useCanAccessPath(pathname: string): boolean | null {
  const auth = useSelector((state: RootState) => state.auth);
  if (!auth.user) return null;

  const role = auth.user.role?.name?.toLowerCase() ?? "";

  // super admin: akses semua
  if (role === SUPER_ADMIN) return true;

  // path /roles khusus super admin
  if (pathname.startsWith("/roles")) return false;

  const module = getModuleForPath(pathname);
  console.log("useCanAccessPath", pathname, module, auth.user.role?.module_permissions);

  // path tanpa module (dashboard "/", dll.) → boleh
  if (!module) return true;

  const mp = auth.user.role?.module_permissions?.find(
    (p) => p.module.toLowerCase() === module.toLowerCase()
  );

  return mp?.can_read ?? false;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const canAccess = useCanAccessPath(pathname);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!auth.token || !auth.user?.role?.name) {
      router.replace("/signin");
      return;
    }

    if (canAccess === false) {
      router.replace("/");
    }
  }, [auth.token, auth.user?.role?.name, canAccess, isHydrated, pathname, router]);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  if (!isHydrated || !auth.token || !auth.user?.role?.name) {
    return <PulseLoading />;
  }

  if (canAccess === false) {
    return <PulseLoading />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden flex">
      <OutletProvider>
        <AppSidebar />
        <Backdrop />
        <div
          className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <div className="w-full p-4 md:p-6">{children}</div>
        </div>
      </OutletProvider>
    </div>
  );
}
