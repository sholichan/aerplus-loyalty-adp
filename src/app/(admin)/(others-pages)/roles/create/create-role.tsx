"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { ModuleType, PermissionType } from "@/utility/types";
import { useRouter } from "next/navigation";
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

const CreateRole: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);

    const [roleName, setRoleName] = useState("");
    const [modules, setModules] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<PermissionType[]>([]);
    const [modulePerms, setModulePerms] = useState<ModulePermissionForm[]>([]);
    const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitLoading, setIsInitLoading] = useState(true);
    const [permSearch, setPermSearch] = useState("");

    useEffect(() => {
        if (!auth.token) return;

        const fetchData = async () => {
            try {
                const [modRes, permRes] = await Promise.all([
                    fetch(`${API_URL}/admin/roles/modules`, {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }),
                    fetch(`${API_URL}/admin/roles/permissions`, {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }),
                ]);

                const modData = await modRes.json();
                const permData = await permRes.json();

                if (modData.statusCode === 200) {
                    const allMods: string[] = modData.data.map((m: ModuleType) => m.name);
                    setModules(allMods);

                    setModulePerms(
                        allMods.map((m) => ({
                            module: m,
                            can_create: false,
                            can_read: false,
                            can_update: false,
                            can_delete: false,
                        }))
                    );
                }
                if (permData.statusCode === 200) {
                    setPermissions(permData.data as PermissionType[]);
                }
            } catch (error) {
                console.error("Error fetching role data:", error);
                toast.error("Failed to load data");
            } finally {
                setIsInitLoading(false);
            }
        };

        fetchData();
    }, [auth.token]);

    const toggleModulePerm = (module: string, key: keyof Omit<ModulePermissionForm, "module">) => {
        setModulePerms((prev) =>
            prev.map((mp) => (mp.module === module ? { ...mp, [key]: !mp[key] } : mp))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roleName.trim()) {
            toast.error("Role name is required");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                name: roleName.trim(),
                permissions: selectedPermIds,
                module_permissions: modulePerms,
            };

            const response = await fetch(`${API_URL}/admin/roles/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(payload),
            });

            const res = await response.json();

            if (res.statusCode === 200) {
                toast.success("Role created successfully!");
                router.push("/roles");
            } else if (res.statusCode === 401) {
                dispatch(clearToken());
                router.replace("/signin");
            } else {
                toast.error(`Failed: ${res.err ?? "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error creating role:", error);
            toast.error("Failed to create role");
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitLoading) return <PulseLoading />;

    const toggleRow = (module: string) => {
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
                    Create Role
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
                                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                        Module
                                    </th>
                                    {CRUD_KEYS.map((k) => (
                                        <th
                                            key={k}
                                            className="px-4 py-2 text-center text-gray-600 dark:text-gray-300 font-medium capitalize"
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
                                                    className="w-4 h-4 accent-blue-500 cursor-pointer"
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
                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                    >
                        {isLoading ? "Creating..." : "Create Role"}
                    </Button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;
