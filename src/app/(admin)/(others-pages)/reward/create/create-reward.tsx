"use client";

import { PulseLoading } from "@/components/common/loading";
import RequiredSymbol from "@/components/common/RequiredSymbol";
import MarkdownEditor from "@/components/common/MarkdownEditor";
import VoucherTemplatePositioner from "@/components/common/VoucherTemplatePositioner";
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
    const [dragActiveTemplate, setDragActiveTemplate] = useState(false);
    const [bogoOptions, setBogoOptions] = useState([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const voucherTemplateInputRef = useRef<HTMLInputElement | null>(null);
    const lastSubmit = useRef(0);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchProduct = async () => {
            const products = await GetProduct(auth.token as string)
            setBogoOptions((products ?? []).map((product: any) => {
                return {
                    value: product.id,
                    label: `${product.number} - ${product.name}`,
                }
            }))
        }

        fetchProduct()
    }, [auth.token])

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
            undian_code_prefix: "",
            undian_code_padding: 4,
            undian_text_x: "",
            undian_text_y: "",
            undian_font_size: 48,
            undian_font_color: "#000000",
            undian_font_align: "left",
            undian_voucher_template: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nama reward wajib diisi"),
            type: Yup.string().required("Tipe reward wajib dipilih"),
            point_eligibility: Yup.number().required("Syarat poin wajib diisi").min(1, "Minimal syarat poin adalah 1"),
            image: Yup.string().required("Wajib upload gambar voucher"),
            end_period: Yup.string().required("Wajib atur periode"),
            undian_code_prefix: Yup.string().when("type", {
                is: "undian",
                then: (s) => s.required("Prefix kode wajib diisi"),
            }),
            undian_text_x: Yup.number().when("type", {
                is: "undian",
                then: (s) => s.required("Posisi X teks wajib diisi"),
            }),
            undian_text_y: Yup.number().when("type", {
                is: "undian",
                then: (s) => s.required("Posisi Y teks wajib diisi"),
            }),
            undian_voucher_template: Yup.string().when("type", {
                is: "undian",
                then: (s) => s.required("Wajib upload template voucher"),
            }),
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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
    const handleFileUpload = (file: File) => {
        // ✅ Validasi ukuran
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran file maksimal 5MB")
            return
        }

        // ✅ Validasi tipe file
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Format file harus JPG, PNG, atau WEBP")
            return
        }

        // ✅ Kalau lolos validasi baru dibaca
        const reader = new FileReader()
        reader.onloadend = () => {
            formikReward.setFieldValue("image", reader.result);
        }
        reader.readAsDataURL(file)
    }

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

        if (type !== "undian") {
            formikReward.setFieldValue("undian_code_prefix", "");
            formikReward.setFieldValue("undian_code_padding", 4);
            formikReward.setFieldValue("undian_text_x", "");
            formikReward.setFieldValue("undian_text_y", "");
            formikReward.setFieldValue("undian_font_size", 48);
            formikReward.setFieldValue("undian_font_color", "#000000");
            formikReward.setFieldValue("undian_font_align", "left");
            formikReward.setFieldValue("undian_voucher_template", "");
        }
    }, [formikReward.values.type]);

    const handleVoucherTemplateUpload = (file: File) => {
        // ✅ Validasi ukuran
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Ukuran file maksimal 5MB")
            return
        }

        // ✅ Validasi tipe file
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Format file harus JPG, PNG, atau WEBP")
            return
        }

        // ✅ Kalau lolos validasi baru dibaca
        const reader = new FileReader();
        reader.onloadend = () => {
            formikReward.setFieldValue("undian_voucher_template", reader.result);
        };
        reader.readAsDataURL(file);
    };

    const rewardTypeOptions = [
        { value: "discount", label: "Discount" },
        { value: "bogo", label: "BOGO (ex: buy 1 get 1)" },
        { value: "merchandise", label: "Merchandise" },
        { value: "undian", label: "Undian (Lottery)" },
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

                                {formikReward.values.type === "undian" && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Kode Prefix <RequiredSymbol /></Label>
                                            <Input
                                                type="text"
                                                name="undian_code_prefix"
                                                placeholder="UND-"
                                                onChange={formikReward.handleChange}
                                            />
                                            {formikReward.touched.undian_code_prefix && formikReward.errors.undian_code_prefix ? (
                                                <div className="text-sm text-red-500">{formikReward.errors.undian_code_prefix}</div>
                                            ) : null}
                                        </div>

                                        <div>
                                            <Label>Panjang Nomor (padding)</Label>
                                            <Input
                                                type="number"
                                                name="undian_code_padding"
                                                placeholder="4"
                                                onChange={formikReward.handleChange}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Posisi Teks X (otomatis dari preview) <RequiredSymbol /></Label>
                                                <input
                                                    type="number"
                                                    name="undian_text_x"
                                                    readOnly
                                                    value={formikReward.values.undian_text_x}
                                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                                    onChange={() => undefined}
                                                />
                                                {formikReward.touched.undian_text_x && formikReward.errors.undian_text_x ? (
                                                    <div className="text-sm text-red-500">{formikReward.errors.undian_text_x}</div>
                                                ) : null}
                                            </div>
                                            <div>
                                                <Label>Posisi Teks Y (otomatis dari preview) <RequiredSymbol /></Label>
                                                <input
                                                    type="number"
                                                    name="undian_text_y"
                                                    readOnly
                                                    value={formikReward.values.undian_text_y}
                                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                                    onChange={() => undefined}
                                                />
                                                {formikReward.touched.undian_text_y && formikReward.errors.undian_text_y ? (
                                                    <div className="text-sm text-red-500">{formikReward.errors.undian_text_y}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Ukuran Font</Label>
                                                <Input
                                                    type="number"
                                                    name="undian_font_size"
                                                    onChange={formikReward.handleChange}
                                                />
                                            </div>
                                            <div>
                                                <Label>Warna Font</Label>
                                                <input
                                                    type="color"
                                                    name="undian_font_color"
                                                    value={formikReward.values.undian_font_color}
                                                    onChange={formikReward.handleChange}
                                                    className="h-10 w-full rounded border border-gray-300 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Perataan Teks</Label>
                                            <Select
                                                options={[
                                                    { value: "left", label: "Kiri" },
                                                    { value: "center", label: "Tengah" },
                                                    { value: "right", label: "Kanan" },
                                                ]}
                                                placeholder="Pilih perataan"
                                                onChange={(e) => formikReward.setFieldValue("undian_font_align", e)}
                                            />
                                        </div>

                                        <div>
                                            <Label>Template Voucher <RequiredSymbol /></Label>
                                            <div className="text-xs text-gray-500 mb-2">Gambar template ini yang dicetak kode incremental-nya saat user menukar (berbeda dari banner di atas).</div>
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
                                                    ${dragActiveTemplate ? "border-primary-500 bg-primary-50" : "border-gray-300 dark:border-gray-600"}`}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragActiveTemplate(true);
                                                }}
                                                onDragLeave={() => setDragActiveTemplate(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setDragActiveTemplate(false);
                                                    const file = e.dataTransfer.files[0];
                                                    if (file) handleVoucherTemplateUpload(file);
                                                }}
                                                onClick={() => voucherTemplateInputRef.current?.click()}
                                            >
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    Drag & Drop image here or <span className="text-primary-500">click to upload</span>
                                                </p>
                                                <input
                                                    ref={voucherTemplateInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleVoucherTemplateUpload(file);
                                                    }}
                                                />
                                            </div>

                                            {/* Preview + interactive position picker */}
                                            {formikReward.values.undian_voucher_template && (
                                                <VoucherTemplatePositioner
                                                    src={formikReward.values.undian_voucher_template}
                                                    x={formikReward.values.undian_text_x === "" ? "" : Number(formikReward.values.undian_text_x)}
                                                    y={formikReward.values.undian_text_y === "" ? "" : Number(formikReward.values.undian_text_y)}
                                                    fontSize={Number(formikReward.values.undian_font_size) || 48}
                                                    fontColor={formikReward.values.undian_font_color || "#000000"}
                                                    fontAlign={(formikReward.values.undian_font_align as "left" | "center" | "right") || "left"}
                                                    sampleText={`${formikReward.values.undian_code_prefix || "UND-"}${String(1).padStart(Number(formikReward.values.undian_code_padding) || 4, "0")}`}
                                                    onChange={(x, y) => {
                                                        formikReward.setFieldValue("undian_text_x", x);
                                                        formikReward.setFieldValue("undian_text_y", y);
                                                    }}
                                                />
                                            )}

                                            {formikReward.touched.undian_voucher_template && formikReward.errors.undian_voucher_template ? (
                                                <div className="text-sm text-red-500">{formikReward.errors.undian_voucher_template}</div>
                                            ) : null}
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