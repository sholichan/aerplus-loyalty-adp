"use client";

import { PulseLoading } from "@/components/common/loading";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { RoleType } from "@/utility/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PROTECTED_ROLES = ["super admin", "member"];

const Roles: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<RoleType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const header = ["No", "Name", "Module Permissions", "Created At", "Actions"];

    useEffect(() => {
        if (!auth.token) return;

        const fetchRoles = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/admin/roles`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                const res = await response.json();

                if (res.statusCode === 200) {
                    setTableData(res.data);
                } else if (res.statusCode === 401) {
                    dispatch(clearToken());
                    router.replace("/signin");
                } else {
                    toast.error(`Failed to load roles: ${res.err ?? "Unknown error"}`);
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
                toast.error("Failed to load roles");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoles();
    }, [auth.token, refresh]);

    const handleDelete = async (role: RoleType) => {
        if (PROTECTED_ROLES.includes(role.name.toLowerCase())) {
            toast.error(`Role "${role.name}" is protected and cannot be deleted.`);
            return;
        }

        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

        setDeletingId(role.id);
        try {
            const response = await fetch(`${API_URL}/admin/roles/${role.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            const res = await response.json();

            if (res.statusCode === 200) {
                toast.success(`Role "${role.name}" deleted.`);
                setRefresh((p) => !p);
            } else {
                toast.error(`Delete failed: ${res.err ?? "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Delete role failed!");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) return <PulseLoading />;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between">
                <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                    Roles
                </h5>
                <button
                    onClick={() => router.push("/roles/create")}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
                >
                    + Create Role
                </button>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                <TableBasic header={header}>
                    {
                        tableData.filter((role) => !PROTECTED_ROLES.includes(role.name.toLowerCase())).map((role, index) => {
                            const isProtected = PROTECTED_ROLES.includes(role.name.toLowerCase());
                            return (
                                <TableRow key={role.id}>
                                    <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-700 font-medium text-theme-sm dark:text-gray-200">
                                        <div className="flex items-center gap-2">
                                            {role.name}
                                            {isProtected && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    protected
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-wrap gap-1">
                                            {role.module_permissions && role.module_permissions.length > 0 ? (
                                                role.module_permissions.filter((mp) => mp.can_read || mp.can_create || mp.can_update || mp.can_delete).map((mp) => (
                                                    <span
                                                        key={mp.id}
                                                        className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                    >
                                                        {mp.module}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs">No module permissions</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {dayjs(role.created_at).format("DD MMM YYYY")}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            {!isProtected && (
                                                <>
                                                    <button
                                                        onClick={() => router.push(`/roles/edit?id=${role.id}`)}
                                                        className="px-3 py-1 rounded text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleDelete(role)}
                                                        disabled={deletingId === role.id}
                                                        className="px-3 py-1 rounded text-xs bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId === role.id ? "Deleting..." : "Delete"}
                                                    </button> */}
                                                </>
                                            )}
                                            {/* <button
                                                onClick={() => router.push(`/roles/edit?id=${role.id}&view=true`)}
                                                className="px-3 py-1 rounded text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Detail
                                            </button> */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBasic>

                {tableData.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">No roles found.</div>
                )}
            </div>
        </div>
    );
};

export default Roles;
