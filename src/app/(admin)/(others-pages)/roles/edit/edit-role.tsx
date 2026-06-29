"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { ModuleType, PermissionType, RoleType } from "@/utility/types";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ModulePermissionForm = {
    module: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
};

const CRUD_KEYS: (keyof Omit<ModulePermissionForm, "module">)[] = [
    "can_create",
    "can_read",
    "can_update",
    "can_delete",
];

const PROTECTED_ROLES = ["super admin", "member"];

const EditRole: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useSelector((state: RootState) => state.auth);

    const roleId = searchParams.get("id");
    const viewOnly = searchParams.get("view") === "true";

    const [role, setRole] = useState<RoleType | null>(null);
    const [roleName, setRoleName] = useState("");
    const [modules, setModules] = useState<string[]>([]);
    const [allPermissions, setAllPermissions] = useState<PermissionType[]>([]);
    const [modulePerms, setModulePerms] = useState<ModulePermissionForm[]>([]);
    const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitLoading, setIsInitLoading] = useState(true);
    const [permSearch, setPermSearch] = useState("");

    const isProtected = role ? PROTECTED_ROLES.includes(role.name.toLowerCase()) : false;
    const isReadOnly = viewOnly || isProtected;

    useEffect(() => {
        if (!auth.token || !roleId) return;

        const fetchData = async () => {
            try {
                const [roleRes, modRes] = await Promise.all([
                    fetch(`${API_URL}/admin/roles/${roleId}`, {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }),
                    fetch(`${API_URL}/admin/roles/modules`, {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }),
                ]);

                const roleData = await roleRes.json();
                const modData = await modRes.json();

                if (roleData.statusCode === 200) {
                    const r: RoleType = roleData.data;
                    setRole(r);
                    setRoleName(r.name);
                    setSelectedPermIds(r.permissions.map((p) => p.id));
                }
                if (modData.statusCode === 200) {
                    const allMods: string[] = modData.data.map((m: ModuleType) => m.name);
                    setModules(allMods);

                    if (roleData.statusCode === 200) {
                        const r: RoleType = roleData.data;
                        const existingMap = new Map(
                            r.module_permissions.map((mp) => [mp.module, mp])
                        );
                        setModulePerms(
                            allMods.map((m) => ({
                                module: m,
                                can_create: existingMap.get(m)?.can_create ?? false,
                                can_read: existingMap.get(m)?.can_read ?? false,
                                can_update: existingMap.get(m)?.can_update ?? false,
                                can_delete: existingMap.get(m)?.can_delete ?? false,
                            }))
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching role data:", error);
                toast.error("Failed to load role data");
            } finally {
                setIsInitLoading(false);
            }
        };

        fetchData();
    }, [auth.token, roleId]);

    const toggleModulePerm = (module: string, key: keyof Omit<ModulePermissionForm, "module">) => {
        if (isReadOnly) return;
        setModulePerms((prev) =>
            prev.map((mp) => (mp.module === module ? { ...mp, [key]: !mp[key] } : mp))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;

        if (!roleName.trim()) {
            toast.error("Role name is required");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                id: roleId,
                name: roleName.trim(),
                module_permissions: modulePerms,
            };

            const response = await fetch(`${API_URL}/admin/roles/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(payload),
            });

            const res = await response.json();

            if (res.statusCode === 200) {
                toast.success("Role updated successfully!");
                router.push("/roles");
            } else if (res.statusCode === 401) {
                dispatch(clearToken());
                router.replace("/signin");
            } else {
                toast.error(`Failed: ${res.err ?? "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role");
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitLoading || !role) return <PulseLoading />;

    const toggleRow = (module: string) => {
        if (isReadOnly) return;

        setModulePerms((prev) =>
            prev.map((mp) => {
                if (mp.module !== module) return mp;

                const allChecked =
                    mp.can_create &&
                    mp.can_read &&
                    mp.can_update &&
                    mp.can_delete;

                return {
                    ...mp,
                    can_create: !allChecked,
                    can_read: !allChecked,
                    can_update: !allChecked,
                    can_delete: !allChecked,
                };
            })
        );
    };

    const isRowChecked = (mp: ModulePermissionForm) => {
        return (
            mp.can_create &&
            mp.can_read &&
            mp.can_update &&
            mp.can_delete
        );
    };

    const isRowIndeterminate = (mp: ModulePermissionForm) => {
        const checked = [
            mp.can_create,
            mp.can_read,
            mp.can_update,
            mp.can_delete,
        ].filter(Boolean).length;

        return checked > 0 && checked < CRUD_KEYS.length;
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ← Back
                </button>
                <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                    {viewOnly ? "Role Detail" : "Edit Role"}
                    {isProtected && (
                        <span className="ml-3 px-2 py-0.5 rounded text-sm font-normal bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            protected
                        </span>
                    )}
                </h5>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Role Name */}
                <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                        id="roleName"
                        type="text"
                        placeholder="e.g. editor, viewer"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Module CRUD Permissions */}
                <div>
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                        Module Permissions (CRUD)
                    </h6>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left">
                                        Module
                                    </th>

                                    {CRUD_KEYS.map((k) => (
                                        <th
                                            key={k}
                                            className="px-4 py-2 text-center capitalize"
                                        >
                                            {k.replace("can_", "")}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {modulePerms.map((mp) => (
                                    <tr
                                        key={mp.module}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">

                                                <input
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.indeterminate = isRowIndeterminate(mp);
                                                        }
                                                    }}
                                                    type="checkbox"
                                                    checked={isRowChecked(mp)}
                                                    disabled={isReadOnly}
                                                    onChange={() => toggleRow(mp.module)}
                                                    className="w-4 h-4 accent-blue-500"
                                                />

                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {mp.module}
                                                </span>

                                            </div>
                                        </td>
                                        {CRUD_KEYS.map((k) => (
                                            <td key={k} className="px-4 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={mp[k] as boolean}
                                                    onChange={() => toggleModulePerm(mp.module, k)}
                                                    disabled={isReadOnly}
                                                    className="w-4 h-4 accent-blue-500 cursor-pointer disabled:cursor-default"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submit */}
                {!isReadOnly && (
                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditRole;
