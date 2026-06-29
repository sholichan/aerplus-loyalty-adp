"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";

type Action = "create" | "read" | "update" | "delete";

interface PermissionGuardProps {
  module: string;
  action: Action;
  children: React.ReactNode;
  /** Render pengganti jika tidak punya akses (opsional) */
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard – tampilkan children hanya jika user punya akses
 * pada modul dan action yang ditentukan.
 *
 * Contoh:
 *   <PermissionGuard module="banner" action="create">
 *     <button>Add Banner</button>
 *   </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback = null,
}) => {
  const perms = usePermission(module);

  const allowed =
    action === "create" ? perms.canCreate :
    action === "read"   ? perms.canRead   :
    action === "update" ? perms.canUpdate :
    action === "delete" ? perms.canDelete :
    false;

  return <>{allowed ? children : fallback}</>;
};

export default PermissionGuard;
