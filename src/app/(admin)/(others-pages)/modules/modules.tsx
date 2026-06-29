"use client";

import { PulseLoading } from "@/components/common/loading";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { ModuleType } from "@/utility/types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Modules: React.FC = () => {
    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<ModuleType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refresh, setRefresh] = useState<boolean>(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingModule, setEditingModule] = useState<ModuleType | null>(null);
    const [formName, setFormName] = useState("");
    const [formIsActive, setFormIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const header = ["No", "Name", "Created At", "Actions"];

    useEffect(() => {
        if (!auth.token) return;

        const fetchModules = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/admin/roles/modules`, {
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
                } else {
                    toast.error(`Failed to load modules: ${res.err ?? "Unknown error"}`);
                }
            } catch (error) {
                console.error("Error fetching modules:", error);
                toast.error("Failed to load modules");
            } finally {
                setIsLoading(false);
            }
        };

        fetchModules();
    }, [auth.token, refresh]);

    const openCreateModal = () => {
        setModalMode("create");
        setEditingModule(null);
        setFormName("");
        setFormIsActive(true);
        setIsModalOpen(true);
    };

    const openEditModal = (mod: ModuleType) => {
        setModalMode("edit");
        setEditingModule(mod);
        setFormName(mod.name);
        setFormIsActive(mod.is_active);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingModule(null);
        setFormName("");
        setFormIsActive(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim()) {
            toast.error("Module name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            if (modalMode === "create") {
                const response = await fetch(`${API_URL}/admin/roles/modules`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify({ name: formName.trim().toLowerCase() }),
                });
                const res = await response.json();

                if (res.statusCode === 200) {
                    toast.success(`Module "${formName}" created successfully!`);
                    closeModal();
                    setRefresh((p) => !p);
                } else {
                    toast.error(`Create failed: ${res.err ?? "Unknown error"}`);
                }
            } else {
                // edit
                const response = await fetch(`${API_URL}/admin/roles/modules`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify({
                        id: editingModule!.id,
                        name: formName.trim().toLowerCase(),
                        is_active: formIsActive,
                    }),
                });
                const res = await response.json();

                if (res.statusCode === 200) {
                    toast.success(`Module "${formName}" updated successfully!`);
                    closeModal();
                    setRefresh((p) => !p);
                } else {
                    toast.error(`Update failed: ${res.err ?? "Unknown error"}`);
                }
            }
        } catch (error) {
            console.error("Error saving module:", error);
            toast.error("Failed to save module");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (mod: ModuleType) => {
        if (!confirm(`Delete module "${mod.name}"? This cannot be undone.`)) return;

        setDeletingId(mod.id);
        try {
            const response = await fetch(`${API_URL}/admin/roles/modules/${mod.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            const res = await response.json();

            if (res.statusCode === 200) {
                toast.success(`Module "${mod.name}" deleted.`);
                setRefresh((p) => !p);
            } else {
                toast.error(`Delete failed: ${res.err ?? "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting module:", error);
            toast.error("Delete module failed!");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) return <PulseLoading />;

    return (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between">
                    <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                        Frontend Modules
                    </h5>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
                    >
                        + Create Module
                    </button>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                    <TableBasic header={header} isSetMinW="none">
                        {tableData.map((mod, index) => (
                            <TableRow key={mod.id}>
                                <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="p-3 text-gray-700 font-medium text-theme-sm dark:text-gray-200">
                                    {mod.name}
                                </TableCell>
                                {/* <TableCell className="p-3">
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs ${mod.is_active
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            }`}
                                    >
                                        {mod.is_active ? "Active" : "Inactive"}
                                    </span>
                                </TableCell> */}
                                <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {dayjs(mod.created_at).format("DD MMM YYYY")}
                                </TableCell>
                                <TableCell className="p-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(mod)}
                                            className="px-3 py-1 rounded text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        {/* <button
                                            onClick={() => handleDelete(mod)}
                                            disabled={deletingId === mod.id}
                                            className="px-3 py-1 rounded text-xs bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === mod.id ? "Deleting..." : "Delete"}
                                        </button> */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBasic>

                    {tableData.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">No modules found.</div>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                className="max-w-md p-6 lg:p-8"
            >
                <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {modalMode === "create" ? "Create Module" : "Edit Module"}
                    </h4>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Module Name
                            </label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="e.g. dashboard"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400"
                                autoFocus
                            />
                        </div>

                        {/* Is Active Toggle (only for edit) */}
                        {modalMode === "edit" && (
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active Status
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormIsActive((p) => !p)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formIsActive
                                        ? "bg-blue-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formIsActive ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : modalMode === "create"
                                        ? "Create"
                                        : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default Modules;
