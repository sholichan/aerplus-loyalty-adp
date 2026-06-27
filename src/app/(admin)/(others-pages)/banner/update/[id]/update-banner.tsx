"use client";

import { PulseLoading } from "@/components/common/loading";
import MarkdownEditor from "@/components/common/MarkdownEditor";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import dayjs from 'dayjs';
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Markdown from 'react-markdown';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import remarkGfm from 'remark-gfm';
import * as Yup from 'yup';


interface BannerId {
    id: string;
}

const UpdateBanner = ({ id }: BannerId) => {
    const [refresh, setRefresh] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [dragActive, setDragActive] = useState(false);
    const [previewBannner, setPreviewBannner] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            formikCreateUpdate.setFieldValue("base64", reader.result)
        }
        reader.readAsDataURL(file)
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const banner_url = API_URL?.split("/api")[0]

    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (auth.user?.role.name !== "super admin") {
            router.push("/signin")
        } else {
            setRefresh(!refresh)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token, router])

    const formikCreateUpdate = useFormik({
        initialValues: {
            id: "",
            name: "",
            content: "",
            end_date: null,
            is_active: true,
            base64: ""
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nama banner wajib diisi"),
            content: Yup.string().required("Content banner wajib diisi"),
            base64: Yup.string().required("Banner wajib diupload")
        }),
        onSubmit: async (values) => {

            setIsLoading(!isLoading)
            let submitValues
            if (values.id === "") {
                /* eslint-disable @typescript-eslint/no-unused-vars */
                const { id, ...newValues } = values
                submitValues = newValues
            } else {
                submitValues = values
            }

            try {
                const response = await fetch(`${API_URL}admin/banner/create-update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(submitValues),
                });
                const res = await response.json();
                if (res.statusCode == 200) {
                    toast.success(`Update banner Success!`)
                    resetFormik()
                    router.push("/banner")
                } else {
                    toast.warning(`Update banner Failed!`)
                }
                setRefresh(!refresh)
            } catch (error) {
                console.error("Error update banner:", error);
            }
        }
    })

    const resetFormik = () => {
        setPreviewBannner(false)
        formikCreateUpdate.setFieldValue("id", "")
        formikCreateUpdate.setFieldValue("name", "")
        formikCreateUpdate.setFieldValue("content", "")
        formikCreateUpdate.setFieldValue("end_date", null)
        formikCreateUpdate.setFieldValue("base64", "")
    }


    useEffect(() => {
        if (auth.token && id) {
            const fetchbanner = async () => {
                try {
                    const response = await fetch(`${API_URL}/admin/banner/${id}`);
                    const res = await response.json();
                    if (res.statusCode === 200) {
                        formikCreateUpdate.setFieldValue("id", res.data.id)
                        formikCreateUpdate.setFieldValue("name", res.data.name)
                        formikCreateUpdate.setFieldValue("content", res.data.content)
                        formikCreateUpdate.setFieldValue("end_date", res.data.end_date)
                        formikCreateUpdate.setFieldValue("base64", banner_url + res.data.url)
                    }

                } catch (error) {
                    console.error("Error fetching vouchers:", error)
                }
                setIsLoading(!isLoading)
            };

            fetchbanner();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);


    return (
        isLoading ?
            <PulseLoading /> :
            <div
                className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
            >
                <div className="flex flex-col p-6 overflow-y-auto ">
                    <div>
                        <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                            Add Banner
                        </h5>
                    </div>

                    <div className="overflow-y-auto ">
                        <form>
                            <div className="space-y-6 mt-8 ">
                                {/* Name */}
                                <div>
                                    <Label>
                                        Banner Name <span className="text-error-500">*</span>
                                    </Label>
                                    <Input
                                        name="name"
                                        type="text"
                                        placeholder="Banner name"
                                        value={formikCreateUpdate.values.name}
                                        onChange={formikCreateUpdate.handleChange}
                                    />
                                    {formikCreateUpdate.touched.name && formikCreateUpdate.errors.name ? (
                                        <div style={{ color: "red" }}>{formikCreateUpdate.errors.name}</div>
                                    ) : null}
                                </div>

                                {/* Drag & Drop Upload */}
                                <div>
                                    <Label>
                                        Upload Banner <span className="text-error-500">*</span>
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
                                    {formikCreateUpdate.values.base64 && (
                                        <div className="mt-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={formikCreateUpdate.values.base64}
                                                alt="Preview"
                                                className="w-full h-1/4 rounded-lg border"
                                            />
                                        </div>
                                    )}

                                    {formikCreateUpdate.touched.base64 && formikCreateUpdate.errors.base64 ? (
                                        <div style={{ color: "red" }}>{formikCreateUpdate.errors.base64}</div>
                                    ) : null}
                                </div>

                                <div className="w-full">
                                    <div>
                                        <DatePicker
                                            id="end_date"
                                            label="Valid Date"
                                            placeholder="Default as Null"
                                            mode="single"
                                            onChange={(selectedDates: Date[], dateStr: string) => {
                                                formikCreateUpdate.setFieldValue("end_date", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'))
                                            }}
                                            defaultDate={formikCreateUpdate.values.end_date ? formikCreateUpdate.values.end_date : ""}
                                        />
                                        {formikCreateUpdate.touched.end_date && formikCreateUpdate.errors.end_date ? (
                                            <div style={{ color: 'red' }}>{formikCreateUpdate.errors.end_date}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div>
                                    <Label>
                                        Banner Content <span className="text-error-500">*</span>
                                    </Label>

                                    <div className="">
                                        <MarkdownEditor
                                            initialValue={formikCreateUpdate.values.content ? formikCreateUpdate.values.content : "Write your description banner style here"}
                                            onChange={(v) => {
                                                formikCreateUpdate.setFieldValue("content", v)
                                            }} />
                                        {formikCreateUpdate.touched.content && formikCreateUpdate.errors.content ? (
                                            <div style={{ color: "red" }}>{formikCreateUpdate.errors.content}</div>
                                        ) : null}

                                        {/* Preview */}
                                        <div className={previewBannner ? `mt-6 border rounded-lg p-3 bg-gray-200 overflow-auto prose max-w-none` : `hidden`}>
                                            <Label>
                                                Preview
                                            </Label>
                                            {formikCreateUpdate.values.content ? (
                                                <div className="space-y-2">
                                                    {formikCreateUpdate.values.base64 && (
                                                        <div className="mb-6">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={formikCreateUpdate.values.base64}
                                                                alt="Preview"
                                                                className="w-full h-1/4 rounded-lg border"
                                                            />
                                                        </div>
                                                    )}
                                                    <Markdown
                                                        remarkPlugins={[remarkGfm]}
                                                    >
                                                        {formikCreateUpdate.values.content}
                                                    </Markdown>
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 italic">Markdown preview akan muncul di sini...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <Label>
                                        Banner Status
                                    </Label>
                                    <Switch
                                        label={formikCreateUpdate.values.is_active ? "Active" : "Disable"}
                                        defaultChecked={true}
                                        onChange={() =>
                                            formikCreateUpdate.setFieldValue("is_active", !formikCreateUpdate.values.is_active)}
                                    />
                                </div>


                                {/* Preview */}
                                <Button
                                    className="md:w-fit md:mr-4 w-full"
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => setPreviewBannner(!previewBannner)}
                                >
                                    {previewBannner ? "Hide Preview" : "Show Preview"}
                                </Button>

                                <Button
                                    className="md:w-fit w-full"
                                    size="sm"
                                    variant="primary"
                                    type="button"
                                    onClick={formikCreateUpdate.handleSubmit}
                                >
                                    Submit
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
    );
};

export default UpdateBanner;
