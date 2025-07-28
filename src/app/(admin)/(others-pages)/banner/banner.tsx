"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { RootState } from "@/store";
import { BannerType } from "@/utility/types";
import dayjs from 'dayjs';
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from 'yup';

const Banner: React.FC = () => {
    const [tableData, setTableData] = useState<BannerType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [search, setSearch] = useState<string>("")
    const [searchButton, setSearchButton] = useState<boolean>(false)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            formikCreateUpdate.setFieldValue("base64", reader.result);
        };
        reader.readAsDataURL(file);
    };


    const { isOpen, openModal, closeModal } = useModal();

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

    useEffect(() => {
        if (auth.token) {
            const fetchbanner = async () => {
                try {
                    const response = await fetch(`${API_URL}/admin/banner/get-all?search=${search}&page=${currentPage}&limit=6`);
                    const res = await response.json();
                    setTableData(res.data.banners);
                    setTotalPages(res.data.totalPages);
                    setCurrentIndex(0)
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
                setIsLoading(!isLoading)
            };

            fetchbanner();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton]);

    const formikCreateUpdate = useFormik({
        initialValues: {
            name: "",
            is_active: true,
            base64: ""
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nama banner wajib diisi"),
            base64: Yup.string().required("Banner wajib diupload")
        }),
        onSubmit: async (values) => {
            // console.log(values);

            setIsLoading(!isLoading)

            try {
                const response = await fetch(`${API_URL}admin/banner/create-update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });
                const res = await response.json();
                console.log(res);
                if (res.statusCode == 200) {
                    closeModal()
                    toast.success(`Create banner Success!`)
                    resetFormik()
                }
                setRefresh(!refresh)
            } catch (error) {
                console.error("Error to login:", error);
            }
        }
    })

    const dateConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const date: string = parsedDate.format('YYYY-MM-DD');
        return date
    }

    const handlePaginationChange = (page: number) => {
        if (currentPage !== page) {
            setIsLoading(!isLoading)
            setCurrentPage(page);
        }
    };

    const resetFormik = () => {
        formikCreateUpdate.setFieldValue("name", "")
        formikCreateUpdate.setFieldValue("base64", "")
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === tableData.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? tableData.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000); // Autoplay setiap 4 detik

        return () => clearInterval(interval); // Clear saat unmount
    }, [currentIndex]); // Depend on currentIndex untuk autoplay looping
    return (
        isLoading ?
            <PulseLoading /> :
            <div
                className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
            >
                {/* Card Header */}
                <div className="px-6 py-5 md:flex md:space-y-0 justify-between space-y-6">
                    <div className="relative">
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
                            placeholder="Search banner"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                            }}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    setIsLoading(!isLoading);
                                    setSearchButton(!searchButton);
                                }
                            }}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                        />

                        <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                            type="submit"

                            onClick={() => {
                                setIsLoading(!isLoading)
                                setSearchButton(!searchButton)
                            }}
                        >
                            Search
                        </button>
                    </div>
                    <Button
                        className="md:w-fit w-full"
                        size="sm"
                        variant="primary"
                        onClick={() => {
                            openModal()
                        }}>
                        Add banner +
                    </Button>
                </div>

                {/* Card Body */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                    <div className="space-y-6">
                        <div className="hidden md:block relative w-full">
                            <div className="relative  h-56 overflow-hidden rounded-lg md:h-96">
                                {tableData.map((i, index) => (
                                    <div
                                        key={index}
                                        className={`duration-700 ease-in-out absolute inset-0 transition-opacity ${index === currentIndex ? "opacity-100" : "opacity-0"
                                            }`}
                                    >
                                        <Image
                                            src={`${banner_url + i.url}`}
                                            alt={`Slide ${index + 1}`}
                                            width={1193}
                                            height={500}
                                            className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Indicators */}
                            <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
                                {tableData.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`w-3 h-3 rounded-full ${currentIndex === index ? "bg-white" : "bg-gray-400"
                                            }`}
                                        aria-label={`Slide ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Controls */}
                            <button
                                onClick={prevSlide}
                                className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                            >
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70">
                                    <svg
                                        className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                                        fill="none"
                                        viewBox="0 0 6 10"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 1 1 5l4 4"
                                        />
                                    </svg>
                                    <span className="sr-only">Previous</span>
                                </span>
                            </button>

                            <button
                                onClick={nextSlide}
                                className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                            >
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70">
                                    <svg
                                        className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                                        fill="none"
                                        viewBox="0 0 6 10"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 9 4-4-4-4"
                                        />
                                    </svg>
                                    <span className="sr-only">Next</span>
                                </span>
                            </button>
                        </div>

                        <div className="md:grid grid-cols-3 gap-6">
                            {
                                tableData.map((i) => (
                                    <div key={i.id} className="border pb-6 space-y-4 bg-white">
                                        <Image src={`http://localhost:3002${i.url}`} alt={`${i.url}`} width={500} height={500} className="w-full h-auto" />
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h1 className="text-sm md:text-lg font-bold text-gray-900 pt-4 px-6">
                                                    {i.name}
                                                </h1>
                                                <h1 className="text-xs md:text-sm text-gray-500 pt-2 px-6">
                                                    Created at {dateConvert(i.created_at)}
                                                </h1>
                                            </div>
                                            {/* <div className="px-6">
                                                <Button
                                                    className="md:w-fit"
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => {
                                                        formikCreateUpdate.setFieldValue("id", i.id)
                                                        formikCreateUpdate.setFieldValue("name", i.name)
                                                        formikCreateUpdate.setFieldValue("base64", i.url)
                                                        openModal()
                                                    }}>
                                                    Edit
                                                </Button>
                                            </div> */}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="flex justify-end">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePaginationChange} />
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={isOpen}
                    onClose={() => {
                        resetFormik();
                        closeModal();
                    }}
                    className="max-w-[700px] p-6 lg:p-10"
                >
                    <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
                        <div>
                            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                                Add Banner
                            </h5>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar">
                            <form>
                                <div className="space-y-6 mt-8">
                                    {/* Name */}
                                    <div>
                                        <Label>
                                            Banner Name <span className="text-error-500">*</span>
                                        </Label>
                                        <Input
                                            name="name"
                                            type="text"
                                            placeholder="Masukkan judul banner"
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
                                                <img
                                                    src={formikCreateUpdate.values.base64}
                                                    alt="Preview"
                                                    className="w-full max-h-48 rounded-lg border"
                                                />
                                            </div>
                                        )}

                                        {formikCreateUpdate.touched.base64 && formikCreateUpdate.errors.base64 ? (
                                            <div style={{ color: "red" }}>{formikCreateUpdate.errors.base64}</div>
                                        ) : null}
                                    </div>

                                    {/* Checkbox is_active */}
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formikCreateUpdate.values.is_active}
                                            onChange={(e) =>
                                                formikCreateUpdate.setFieldValue("is_active", e.target.checked)
                                            }
                                        />
                                        <Label htmlFor="is_active">Aktifkan banner</Label>
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        className="md:w-fit w-full"
                                        size="sm"
                                        variant="primary"
                                        onClick={formikCreateUpdate.handleSubmit}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            </div>
    );
};

export default Banner;
