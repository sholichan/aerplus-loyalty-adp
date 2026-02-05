"use client";

import { PulseLoading } from "@/components/common/loading";
import RequiredSymbol from "@/components/common/RequiredSymbol";
import MarkdownEditor from "@/components/common/MarkdownEditor";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { RootState } from "@/store";
import { ChevronDownIcon } from "@/icons";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { MapRewardPayload } from "@/utility/mapper";
import { GetProduct } from "@/utility/fetcher";

const CreateReward: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [dragActive, setDragActive] = useState(false);
    const [bogoOptions, setBogoOptions] = useState([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const lastSubmit = useRef(0);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (auth.user?.role.name !== "super admin") {
            router.push("/signin")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps

        const fetchProduct = async () => {
            const products = await GetProduct(auth.token as string)
            setBogoOptions(products.map((product: any) => {
                return {
                    value: product.id,
                    label: `${product.number} - ${product.name}`,
                }
            }))
        }

        fetchProduct()
    }, [auth.token, router])

    const formikReward = useFormik({
        initialValues: {
            name: "",
            type: "",
            point_eligibility: "",
            stock: "",
            about: "",
            tutorial: "",
            tnc: "",
            image: "",
            start_period: "",
            end_period: "",
            is_active: true,
            // === conditional fields ===
            discount_type: "",
            discount_value: "",
            bogo_product: "",
            bogo_buy_qty: 1,
            bogo_get_qty: 1,
            merchandise_id: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nama reward wajib diisi"),
            type: Yup.string().required("Tipe reward wajib dipilih"),
            point_eligibility: Yup.number().required("Syarat poin wajib diisi").min(1, "Minimal syarat poin adalah 1"),
            image: Yup.string().required("Wajib upload gambar voucher"),
            end_period: Yup.string().required("Wajib atur periode"),
        }),
        onSubmit: async (values, { resetForm }) => {
            setIsLoading(true)
            try {
                const payload = MapRewardPayload(values);

                const response = await fetch(`${API_URL}admin/reward/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify(payload),
                });
                const res = await response.json();
                if (res.statusCode == 200) {
                    toast.success(`Create reward Success!`)
                    resetForm()
                    router.push("/reward")
                } else {
                    toast.warning(`Create reward Failed!`)
                }
            } catch (error) {
                toast.error(`Something went wrong!`)
                console.error("Error to create reward:", error);
            } finally {
                setIsLoading(false);
            }
        },
    })

    useEffect(() => {
        const hasError = Object.keys(formikReward.errors).length > 0;

        if (formikReward.submitCount > lastSubmit.current && hasError) {
            toast.warn("Some inputs are invalid. Please check again.");
            lastSubmit.current = formikReward.submitCount;
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [formikReward.submitCount, formikReward.errors]);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            formikReward.setFieldValue("image", reader.result);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const type = formikReward.values.type;

        if (type !== "discount") {
            formikReward.setFieldValue("discount_type", "");
            formikReward.setFieldValue("discount_value", "");
        }

        if (type !== "bogo") {
            formikReward.setFieldValue("bogo_product", "");
            formikReward.setFieldValue("bogo_buy_qty", 1);
            formikReward.setFieldValue("bogo_get_qty", 1);
        }

        if (type !== "merchandise") {
            formikReward.setFieldValue("merchandise_id", "");
        }
    }, [formikReward.values.type]);

    const rewardTypeOptions = [
        { value: "discount", label: "Discount" },
        { value: "bogo", label: "BOGO (ex: buy 1 get 1)" },
        { value: "merchandise", label: "Merchandise" },
    ];

    return (
        isLoading ?
            <PulseLoading /> :
            <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}>
                <div className="flex flex-col p-6 overflow-y-auto">
                    <div>
                        <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                            Add Reward
                        </h5>
                    </div>

                    <div className="overflow-y-auto ">
                        <form onSubmit={formikReward.handleSubmit}>
                            <div className="space-y-6 mt-8 ">
                                <div>
                                    <Label>Reward Name <RequiredSymbol /></Label>
                                    <Input
                                        name="name"
                                        type="text"
                                        placeholder="Reward name"
                                        value={formikReward.values.name}
                                        onChange={(e) => {
                                            formikReward.setFieldValue("name", e.target.value)
                                        }}
                                    />
                                    {formikReward.touched.name && formikReward.errors.name ? (
                                        <div className="text-sm text-red-500">{formikReward.errors.name}</div>
                                    ) : null}
                                </div>

                                <div className="relative">
                                    <Label>Reward Type <RequiredSymbol /></Label>
                                    <div className="relative">
                                        <Select
                                            options={rewardTypeOptions}
                                            placeholder="Select an option"
                                            className="dark:bg-dark-900"
                                            onChange={(e) => {
                                                formikReward.setFieldValue("type", e)
                                            }} />
                                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                            <ChevronDownIcon />
                                        </span>
                                        {formikReward.touched.type && formikReward.errors.type ? (
                                            <div className="text-sm text-red-500">{formikReward.errors.type}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {formikReward.values.type === "discount" && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Discount Type <RequiredSymbol /></Label>
                                            <Select
                                                options={[
                                                    { value: "percentage", label: "Percentage (%)" },
                                                    { value: "fixed", label: "Fixed Amount" },
                                                ]}
                                                placeholder="Select discount type"
                                                onChange={(e) => {
                                                    formikReward.setFieldValue("discount_type", e);
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <Label>
                                                {formikReward.values.discount_type === "percentage"
                                                    ? "Discount Percentage (%)"
                                                    : "Discount Amount"}
                                                <RequiredSymbol />
                                            </Label>
                                            <Input
                                                type="number"
                                                name="discount_value"
                                                placeholder="0"
                                                onChange={formikReward.handleChange}
                                            />
                                        </div>
                                    </div>
                                )}
                                {formikReward.values.type === "bogo" && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>BOGO Product <RequiredSymbol /></Label>
                                            <Select
                                                options={bogoOptions}
                                                placeholder="Select product"
                                                onChange={(e) =>
                                                    formikReward.setFieldValue("bogo_product", e)
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Buy Qty <RequiredSymbol /></Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    name="bogo_buy_qty"
                                                    onChange={formikReward.handleChange}
                                                />
                                            </div>

                                            <div>
                                                <Label>Get Qty <RequiredSymbol /></Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    name="bogo_get_qty"
                                                    onChange={formikReward.handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formikReward.values.type === "merchandise" && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Merchandise Product<RequiredSymbol /></Label>
                                            <Select
                                                options={bogoOptions}
                                                placeholder="Select product"
                                                onChange={(e) =>
                                                    formikReward.setFieldValue("merchandise_id", e)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label>Points Required <RequiredSymbol /></Label>
                                    <Input
                                        name="point_eligibility"
                                        type="number"
                                        placeholder="0"
                                        value={formikReward.values.point_eligibility}
                                        onChange={formikReward.handleChange}
                                    />
                                    {formikReward.touched.point_eligibility && formikReward.errors.point_eligibility ? (
                                        <div className="text-sm text-red-500">{formikReward.errors.point_eligibility}</div>
                                    ) : null}
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <Input
                                        name="stock"
                                        type="number"
                                        placeholder="0"
                                        value={formikReward.values.stock}
                                        onChange={formikReward.handleChange}
                                    />
                                    <div className="text-xs">Jika stok kosong, maka tidak ada batasan reward yang dapat diklaim</div>
                                </div>
                                <div>
                                    <DatePicker
                                        id="period"
                                        label="Period"
                                        placeholder="Period"
                                        mode="range"
                                        required={true}
                                        onChange={(selectedDates: Date[], dateStr: string) => {
                                            const test = dateStr
                                            const splitDate = test.split(' to ')
                                            if (splitDate.length === 2) {
                                                formikReward.setFieldValue("start_period", splitDate[0])
                                                formikReward.setFieldValue("end_period", splitDate[1])
                                            }
                                        }}
                                    />
                                    {formikReward.touched.end_period && formikReward.errors.end_period ? (
                                        <div className="text-sm text-red-500">
                                            {formikReward.errors.end_period}
                                        </div>
                                    ) : null}
                                </div>
                                <div>
                                    <Label>About</Label>

                                    <div className="">
                                        <MarkdownEditor initialValue={"Write about reward here"} onChange={(v) => {
                                            formikReward.setFieldValue("about", v)
                                        }} />
                                    </div>
                                </div>
                                <div>
                                    <Label>How to Use</Label>

                                    <div className="">
                                        <MarkdownEditor initialValue={"Write how to use voucher here"} onChange={(v) => {
                                            formikReward.setFieldValue("tutorial", v)
                                        }} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Terms and Conditions</Label>

                                    <div className="">
                                        <MarkdownEditor initialValue={"Write terms and conditions voucher style here"} onChange={(v) => {
                                            formikReward.setFieldValue("tnc", v)
                                        }} />
                                    </div>
                                </div>
                                <div>
                                    <Label>
                                        Reward Image <RequiredSymbol />
                                    </Label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition 
                                            ${dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 dark:border-gray-600"}`}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragActive(true);
                                        }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setDragActive(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file) handleFileUpload(file);
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Drag & Drop image here or <span className="text-primary-500">click to upload</span>
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file);
                                            }}
                                        />
                                    </div>

                                    {/* Preview */}
                                    {formikReward.values.image && (
                                        <div className="mt-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={formikReward.values.image}
                                                alt="Preview"
                                                className="w-full h-1/4 rounded-lg border"
                                            />
                                        </div>
                                    )}

                                    {formikReward.touched.image && formikReward.errors.image ? (
                                        <div className="text-sm text-red-500">{formikReward.errors.image}</div>
                                    ) : null}
                                </div>
                                <div className="w-full">
                                    <Label>
                                        Reward Status
                                    </Label>
                                    <Switch
                                        label={formikReward.values.is_active ? "Active" : "Disable"}
                                        defaultChecked={true}
                                        onChange={() =>
                                            formikReward.setFieldValue("is_active", !formikReward.values.is_active)}
                                    />
                                </div>
                                <Button
                                    className="w-full"
                                    size="sm"
                                    variant="primary"
                                    type="submit"
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
    )
}

export default CreateReward;