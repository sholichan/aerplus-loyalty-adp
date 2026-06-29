"use client";

import PermissionGuard from "@/components/auth/PermissionGuard";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { PointType } from "@/utility/types";
import dayjs from "dayjs";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";

const Point: React.FC = () => {
    const [pointData, setPointData] = useState<PointType>({
        id: "",
        point: 0,
        created_at: "",
        updated_at: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const auth = useSelector((state: RootState) => state.auth);



    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchPoint = async () => {
            try {
                const response = await fetch(`${API_URL}point`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                });

                const contentType = response.headers.get("content-type");
                if (!response.ok || !contentType || !contentType.includes("application/json")) {
                    toast.warning("Failed to load point data");
                    return;
                }

                const res = await response.json();
                setPointData(res.data[0]);
                //console.log(res.data);

            } catch (error) {
                console.error("Error fetching point:", error);
            }
        };
        fetchPoint();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token]);

    const formikUpdate = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: pointData?.id || "",
            point: pointData?.point || 0,
        },
        validationSchema: Yup.object({
            point: Yup.number().required("Wajib diisi"),
        }),
        onSubmit: async (values: Partial<PointType>) => {
            // console.log(values);

            try {
                const response = await fetch(`${API_URL}/point/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify(values),
                });

                const contentType = response.headers.get("content-type");
                if (!response.ok || !contentType || !contentType.includes("application/json")) {
                    toast.warning("Update additional point failed!");
                    return;
                }

                const res = await response.json();
                if (res.statusCode === 200) {

                    toast.success("Update point success!");
                    setPointData((prev: PointType) => ({ ...prev, ...values }));
                    setIsEditing(false); // close after save
                    console.log(pointData);
                } else {
                    toast.warning(res.message || "Update failed!");
                }
            } catch (error) {
                toast.warning("Update additional point failed!");
                console.error("Error update point:", error);
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
                    <h1 className="text-2xl font-bold text-blue-100">System Points</h1>
                    <p className="text-blue-100 text-sm">Manage the additional point value</p>

                    {isEditing ? (
                        <form onSubmit={formikUpdate.handleSubmit} className="space-y-4">
                            <Input
                                className="w-40 text-4xl font-bold text-center bg-white/20 border-white/30 text-white placeholder-white/70 h-16"
                                name="point"
                                type="number"
                                value={formikUpdate.values.point}
                                onChange={formikUpdate.handleChange}
                            />
                            {formikUpdate.touched.point && typeof formikUpdate.errors.point === "string" && (
                                <div style={{ color: "red" }}>{formikUpdate.errors.point}</div>
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
                            <div className="text-8xl font-bold text-white drop-shadow-lg">{pointData?.point}</div>
                            <p className="text-blue-100 text-lg">Points</p>
                            <PermissionGuard module="point" action="update">
                                <Button
                                    onClick={() => {
                                        formikUpdate.setFieldValue("id", pointData?.id)
                                        setIsEditing(true)
                                    }}
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 mt-4"
                                >
                                    Update Point
                                </Button>
                            </PermissionGuard>
                        </>
                    )}

                    <div className="pt-6 border-t border-white/20 mt-4">
                        <p className="text-blue-100 text-sm">Last Update: {dateConvert(pointData?.updated_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Point;
