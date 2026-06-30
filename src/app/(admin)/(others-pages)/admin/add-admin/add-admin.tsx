"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { RootState } from "@/store";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RoleItem = {
    id: string;
    name: string;
};

const AddAdmin = () => {
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [roleSearch, setRoleSearch] = useState("");
    const roleDropdownRef = useRef<HTMLDivElement>(null);

    const filteredRoleOptions = useMemo(
        () =>
            roleOptions.filter(
                (option) => option.value !== "" && option.label.toLowerCase().includes(roleSearch.toLowerCase())
            ),
        [roleOptions, roleSearch]
    );

    const formikCreateAdmin = useFormik({
        initialValues: {
            user_name: "",
            password: "",
            role_id: "",
        },
        validationSchema: Yup.object({
            user_name: Yup.string().required("Field can't be empty"),
            password: Yup.string().required("Field can't be empty"),
            role_id: Yup.string().required("Field can't be empty"),
        }),
        onSubmit: async (values) => {
            setIsLoading(true);

            try {
                const response = await fetch(`${API_URL}/admin/auth/create-admin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify(values),
                });

                const res = await response.json();

                if (res.statusCode === 200) {
                    toast.success("Create admin success!");
                    router.push("/admin");
                } else {
                    toast.error(`Create admin failed! ${res.err ?? "Unknown error"}`);
                }
            } catch (error) {
                console.error("Error creating admin:", error);
                toast.error("Create admin failed!");
            } finally {
                setIsLoading(false);
            }
        },
    });

    const selectedRoleLabel =
        roleOptions.find((option) => option.value === formikCreateAdmin.values.role_id)?.label || "-- Select role --";

    const fetchRoles = async (selectedRoleName?: string) => {
        if (!auth.token) return;

        try {
            const response = await fetch(`${API_URL}/admin/roles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });

            const res = await response.json();
            if (res.statusCode === 200 && Array.isArray(res.data)) {
                const options = (res.data as RoleItem[]).map((role) => ({
                    value: role.id,
                    label: role.name,
                }));

                options.unshift({ value: "", label: "-- Select role --" });
                setRoleOptions(options);
                console.log("Fetched roles:", options);

                if (selectedRoleName && options.some((i) => i.value === selectedRoleName)) {
                    formikCreateAdmin.setFieldValue("role_id", selectedRoleName);
                    return;
                }

                if (formikCreateAdmin.values.role_id === "" && options.length > 1) {
                    formikCreateAdmin.setFieldValue("role_id", options[1].value);
                }
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("Failed to load roles");
        }
    };

    useEffect(() => {
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!roleDropdownRef.current?.contains(event.target as Node)) {
                setIsRoleDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (isLoading) {
        return <PulseLoading />;
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                    <h5 className="mb-2 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                        Add Admin
                    </h5>
                </div>

                <form className="mt-8" onSubmit={formikCreateAdmin.handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <Label>
                                Username <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                name="user_name"
                                type="text"
                                placeholder="Username"
                                value={formikCreateAdmin.values.user_name}
                                onChange={formikCreateAdmin.handleChange}
                            />
                            {formikCreateAdmin.touched.user_name && formikCreateAdmin.errors.user_name ? (
                                <div style={{ color: "red" }}>{formikCreateAdmin.errors.user_name}</div>
                            ) : null}
                        </div>

                        <div className="relative">
                            <Label>
                                Password <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="password"
                                value={formikCreateAdmin.values.password}
                                onChange={formikCreateAdmin.handleChange} />
                            {formikCreateAdmin.touched.password && formikCreateAdmin.errors.password ? (
                                <div style={{ color: 'red' }}>{formikCreateAdmin.errors.password}</div>
                            ) : null}
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-12"
                            >
                                {showPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                )}
                            </span>
                        </div>

                        <div>
                            <Label>
                                Role <span className="text-error-500">*</span>
                            </Label>
                            <div className="relative" ref={roleDropdownRef}>
                                <button
                                    type="button"
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-left text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                    onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                                >
                                    {selectedRoleLabel}
                                </button>

                                {isRoleDropdownOpen && (
                                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                        <Input
                                            type="text"
                                            placeholder="Search role..."
                                            value={roleSearch}
                                            onChange={(e) => setRoleSearch(e.target.value)}
                                            className="mb-2"
                                        />

                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredRoleOptions.length > 0 ? (
                                                filteredRoleOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => {
                                                            console.log("Selected role:", option.label);
                                                            formikCreateAdmin.setFieldValue("role_id", option.value);
                                                            formikCreateAdmin.setFieldTouched("role_id", true, false);
                                                            setRoleSearch("");
                                                            setIsRoleDropdownOpen(false);
                                                        }}
                                                        className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No roles found</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {formikCreateAdmin.touched.role_id && formikCreateAdmin.errors.role_id ? (
                                <div style={{ color: "red" }}>{formikCreateAdmin.errors.role_id}</div>
                            ) : null}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/admin")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="w-full">
                                Create Admin
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdmin;