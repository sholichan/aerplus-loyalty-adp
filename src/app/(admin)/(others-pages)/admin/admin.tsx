"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import { useOutlet } from "@/context/OutletContext";
import { RootState } from "@/store";
import { AdminUserType, RoleType, UserType } from "@/utility/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const Admin: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<AdminUserType[]>([]);
    const [tableDataToCsv, setTableDataToCsv] = useState<UserType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState<string>("");
    const [searchButton, setSearchButton] = useState<boolean>(false);
    const [prevSelOutlet, setPrevSeloutlet] = useState<string>("");
    const { selectedOutlet } = useOutlet();

    // Assign role modal state
    const [assignRoleUser, setAssignRoleUser] = useState<AdminUserType | null>(null);
    const [roleOptions, setRoleOptions] = useState<RoleType[]>([]);
    const [selectedRoleName, setSelectedRoleName] = useState<string>("");
    const [isAssigningRole, setIsAssigningRole] = useState(false);
    const isSuperAdmin = auth.user?.role?.name?.toLowerCase() === "super admin";

    // Change password modal state
    const [changePwUser, setChangePwUser] = useState<AdminUserType | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPw, setIsChangingPw] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        setPrevSeloutlet(selectedOutlet);
        if (prevSelOutlet !== selectedOutlet) {
            setIsLoading(true);
        }
        if (auth.token) {
            const fetchMember = async () => {
                try {
                    const response = await fetch(
                        `${API_URL}/admin/user/get-all-admin?search=${search}&outletId=${selectedOutlet}&page=${currentPage}&limit=10`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${auth.token}`,
                            },
                        }
                    );
                    const res = await response.json();

                    if (res.statusCode === 200) {
                        setTableData(res.data.users);
                        setTotalPages(res.data.totalPages);
                        setTotalItems(res.data.totalItems);
                    }
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
                setIsLoading(false);
            };
            fetchMember();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton, selectedOutlet]);

    useEffect(() => {
        const fetchMemberToCsv = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/admin/user/get-all-admin?search=&outletId=${selectedOutlet}&page=1&limit=${totalItems}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );
                const res = await response.json();

                if (res.statusCode === 200) {
                    setTableDataToCsv(res.data.users);
                }
            } catch (error) {
                console.error("Error fetching vouchers:", error);
            }
            setIsLoading(false);
        };
        fetchMemberToCsv();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOutlet, totalItems]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const openAssignRole = async (user: AdminUserType) => {
        setAssignRoleUser(user);
        setSelectedRoleName(user.role?.name ?? "");
        if (roleOptions.length === 0 && auth.token) {
            try {
                const response = await fetch(`${API_URL}/admin/roles`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                });
                const res = await response.json();
                if (res.statusCode === 200) {
                    setRoleOptions((res.data as RoleType[]).filter(
                        (r) => r.name.toLowerCase() !== "member"
                    ));
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAssignRole = async () => {
        if (!assignRoleUser || !selectedRoleName) return;
        setIsAssigningRole(true);
        try {
            const response = await fetch(`${API_URL}/admin/user/assign-role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ user_id: assignRoleUser.id, role_name: selectedRoleName }),
            });
            const res = await response.json();
            if (res.statusCode === 200) {
                toast.success("Role assigned successfully!");
                setAssignRoleUser(null);
                setRefresh((p) => !p);
            } else {
                toast.error(`Failed: ${res.err ?? "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to assign role");
        } finally {
            setIsAssigningRole(false);
        }
    };

    // Password validation
    const passwordValidation = React.useMemo(() => {
        return {
            minLength: newPassword.length >= 8,
            upper: /[A-Z]/.test(newPassword),
            lower: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[^A-Za-z0-9]/.test(newPassword),
        };
    }, [newPassword]);

    const passwordsMatch =
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;

    const isPasswordValid =
        Object.values(passwordValidation).every(Boolean) &&
        passwordsMatch;

    const openChangePw = (user: AdminUserType) => {
        setChangePwUser(user);
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const closeChangePw = () => {
        setChangePwUser(null);
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleChangePassword = async () => {
        if (!changePwUser || !isPasswordValid) return;
        setIsChangingPw(true);
        try {
            const response = await fetch(`${API_URL}/admin/user/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ user_id: changePwUser.id, new_password: newPassword }),
            });
            const res = await response.json();
            if (res.statusCode === 200) {
                toast.success(`Password for "${changePwUser.user_name}" changed successfully!`);
                setChangePwUser(null);
            } else {
                toast.error(`Failed: ${res.err ?? "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to change password");
        } finally {
            setIsChangingPw(false);
        }
    };


    const header = ["No", "Name", "Role", ...(isSuperAdmin ? ["Actions"] : [])];

    return isLoading ? (
        <PulseLoading />
    ) : (
        <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
            {/* Card Header */}
            <div className="px-6 py-5 md:flex justify-between space-y-4 md:space-y-0">
                <div className="relative w-full md:w-auto">
                    {/* search */}
                    <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                        <svg
                            className="fill-gray-500 dark:fill-gray-400"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                fill=""
                            />
                        </svg>
                    </span>
                    <Input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                setCurrentPage(1);
                                setIsLoading(!isLoading);
                                setSearchButton(!searchButton);
                            }
                        }}
                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                    />

                    <button
                        className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                        type="submit"
                        onClick={() => {
                            setCurrentPage(1);
                            setIsLoading(!isLoading);
                            setSearchButton(!searchButton);
                        }}
                    >
                        Search
                    </button>
                </div>

                {/* Add Admin Button */}
                <button
                    onClick={() => router.push("/admin/add-admin")}
                    className="px-4 py-2 w-full md:w-fit rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                    Add Admin
                </button>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                <div className="space-y-6">
                    <TableBasic header={header}>
                        {tableData.map((i, index) => (
                            <TableRow key={i.id}>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {(currentPage - 1) * 10 + (index + 1)}
                                </TableCell>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {i.user_name}
                                </TableCell>
                                <TableCell className="p-3 text-theme-sm dark:text-gray-400">
                                    {i.role ? (
                                        <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                            {i.role.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </TableCell>
                                {isSuperAdmin && (
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openAssignRole(i)}
                                                className="px-3 py-1 rounded text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                                            >
                                                Change Role
                                            </button>
                                            <button
                                                onClick={() => openChangePw(i)}
                                                className="px-3 py-1 rounded text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 transition-colors"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBasic>
                    <div className="flex justify-end">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePaginationChange}
                        />
                    </div>
                </div>
            </div>

            {/* Assign Role Modal */}
            {assignRoleUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h6 className="font-semibold text-gray-800 dark:text-white mb-1">
                            Change Role
                        </h6>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            User: <strong>{assignRoleUser.user_name}</strong>
                        </p>
                        <select
                            value={selectedRoleName}
                            onChange={(e) => setSelectedRoleName(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 mb-4"
                        >
                            <option value="">-- Select Role --</option>
                            {roleOptions.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setAssignRoleUser(null)}
                                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignRole}
                                disabled={isAssigningRole || !selectedRoleName}
                                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isAssigningRole ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {changePwUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h6 className="font-semibold text-gray-800 dark:text-white mb-1">
                            Change Password
                        </h6>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            User: <strong>{changePwUser.user_name}</strong>
                        </p>

                        {/* New Password */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Masukkan password baru"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pr-10 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((p) => !p)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showNewPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Validation Rules */}
                        {newPassword.length > 0 && (
                            <div className="mb-3 space-y-1">
                                {[
                                    { label: "Minimal 8 karakter", ok: newPassword.length >= 8 },
                                    { label: "Huruf besar (A-Z)", ok: /[A-Z]/.test(newPassword) },
                                    { label: "Huruf kecil (a-z)", ok: /[a-z]/.test(newPassword) },
                                    { label: "Angka (0-9)", ok: /[0-9]/.test(newPassword) },
                                    { label: "Karakter spesial (!@#$...)", ok: /[^A-Za-z0-9]/.test(newPassword) },
                                ].map((rule) => (
                                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                                        <span className={rule.ok ? "text-green-500" : "text-red-400"}>
                                            {rule.ok ? "✓" : "✗"}
                                        </span>
                                        <span className={rule.ok ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    className={`w-full rounded-lg border bg-transparent px-3 py-2 pr-10 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${confirmPassword.length > 0 && !passwordsMatch
                                        ? "border-red-400 dark:border-red-500"
                                        : "border-gray-200 dark:border-gray-700"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((p) => !p)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setChangePwUser(null)}
                                className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPw || !isPasswordValid}
                                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isChangingPw ? "Saving..." : "Change Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
