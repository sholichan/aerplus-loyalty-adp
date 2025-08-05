"use client";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { BenefitType } from "@/utility/types";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";

const Benefit: React.FC = () => {
    const [benfitData, setBenefitData] = useState<BenefitType>({
        id: "",
        value: 0,
        type: "",
        is_active: true,
        created_at: "",
        updated_at: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!auth) {
            router.push("/signin")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchBenefit = async () => {
            try {
                const response = await fetch(`${API_URL}/admin/benefit/get-all`);
                const res = await response.json();
                setBenefitData(res.data[0]);
                //console.log(res.data);

            } catch (error) {
                console.error("Error fetching benefit:", error);
            }
        };
        fetchBenefit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token]);

    const formikUpdate = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: benfitData?.id || "",
            value: benfitData?.value || 0,
            type: benfitData?.type || "item",
            is_active: benfitData?.is_active || true
        },
        validationSchema: Yup.object({
            value: Yup.number().required("Wajib diisi"),
        }),
        onSubmit: async (values: Partial<BenefitType>) => {
            // console.log(values);

            try {
                const response = await fetch(`${API_URL}/admin/benefit/create-update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });
                const res = await response.json();
                if (res.statusCode === 200) {

                    toast.success("Update benefit success!");
                    setBenefitData((prev: BenefitType) => ({ ...prev, ...values }));
                    setIsEditing(false); // close after save
                    console.log(benfitData);
                } else {
                    toast.warning(res.message || "Update failed!");
                }
            } catch (error) {
                toast.warning("Update benefit failed!");
                console.error("Error update benefit:", error);
            }
        },
    });

    const handleCancel = () => setIsEditing(false);

    const dateConvert = (isoString?: string) => {
        return isoString ? dayjs(isoString).format("YYYY-MM-DD") : "-";
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br bg-blue-950 text-white shadow-2xl">
                <div className="p-12 text-center space-y-6">
                    <h1 className="text-2xl font-bold text-blue-100">System Benefit</h1>
                    <p className="text-blue-100 text-sm">Manage the benefit</p>

                    {isEditing ? (
                        <form onSubmit={formikUpdate.handleSubmit} className="space-y-4">
                            <Input
                                className="w-40 text-4xl font-bold text-center bg-white/20 border-white/30 text-white placeholder-white/70 h-16"
                                name="value"
                                type="number"
                                value={formikUpdate.values.value}
                                onChange={formikUpdate.handleChange}
                            />
                            {formikUpdate.touched.value && typeof formikUpdate.errors.value === "string" && (
                                <div style={{ color: "red" }}>{formikUpdate.errors.value}</div>
                            )}

                            <div className="flex justify-center space-x-3 mt-4">
                                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                                    Save
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="text-8xl font-bold text-white drop-shadow-lg">{benfitData?.value}</div>
                            <p className="text-blue-100 text-lg">{benfitData.type}</p>
                            <Button
                                onClick={() => {
                                    formikUpdate.setFieldValue("id", benfitData?.id)
                                    setIsEditing(true)
                                }}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 mt-4"
                            >
                                Update Benefit
                            </Button>
                        </>
                    )}

                    <div className="pt-6 border-t border-white/20 mt-4">
                        <p className="text-blue-100 text-sm">Last Update: {dateConvert(benfitData?.updated_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Benefit;
