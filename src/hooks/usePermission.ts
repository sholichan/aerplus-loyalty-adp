import { useSelector } from "react-redux";
import { RootState } from "@/store";

const SUPER_ADMIN = "super admin";

/**
 * usePermission – cek akses CRUD pada suatu modul.
 * Super admin selalu mendapat akses penuh.
 * Role lain dicek dari module_permissions dalam JWT.
 */
export function usePermission(module: string) {
  const user = useSelector((state: RootState) => state.auth.user);

  // super admin selalu full access
  if (user?.role?.name?.toLowerCase() === SUPER_ADMIN) {
    return { canCreate: true, canRead: true, canUpdate: true, canDelete: true };
  }

  const mp = user?.role?.module_permissions?.find(
    (p) => p.module.toLowerCase() === module.toLowerCase()
  );

  return {
    canCreate: mp?.can_create ?? false,
    canRead:   mp?.can_read   ?? false,
    canUpdate: mp?.can_update ?? false,
    canDelete: mp?.can_delete ?? false,
  };
}