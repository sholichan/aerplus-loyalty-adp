"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { BannerType } from "@/utility/types";
import dayjs from 'dayjs';
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from 'yup';

import { useDispatch } from "react-redux";
import { clearToken } from "@/store/slices/authSlices";

const Banner: React.FC = () => {
    const dispatch = useDispatch()
    const [tableData, setTableData] = useState<BannerType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [search, setSearch] = useState<string>("")
    const [searchButton, setSearchButton] = useState<boolean>(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const banner_url = API_URL?.split("/api")[0]
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const now = Date.now() / 1000;
        let exp = true
        if (auth.user?.exp !== undefined) exp = now > auth.user?.exp
        if (auth.user?.role.name !== "super admin" || exp) {
            localStorage.clear()
            dispatch(clearToken())
            router.push("/signin")
            toast.warn("Your session has expired, please login!")
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
                } catch (error) {
                    console.error("Error fetching vouchers:", error)
                }
                setIsLoading(!isLoading)
            };

            fetchbanner();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton]);

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
        formikCreateUpdate.setFieldValue("id", "")
        formikCreateUpdate.setFieldValue("name", "")
        formikCreateUpdate.setFieldValue("content", "")
        formikCreateUpdate.setFieldValue("end_date", null)
        formikCreateUpdate.setFieldValue("base64", "")
    }


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
                            router.push("/banner/create")
                        }}>
                        Add banner +
                    </Button>
                </div>

                {/* Card Body */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                    <div className="space-y-6">

                        <div className="md:grid grid-cols-3 gap-6">
                            {
                                tableData.map((i) => (
                                    <div key={i.id} className="border border-gray-100 dark:border-gray-800 rounded-md pb-6 space-y-4 bg-gray-100 dark:bg-gray-800">
                                        <Image src={`${banner_url + i.url}`} alt={`${i.url}`} width={500} height={500} className="w-full h-auto hover:cursor-pointer" />
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h1 className="text-sm md:text-lg font-bold text-gray-900 dark:text-gray-200 pt-4 px-6">
                                                    {i.name}
                                                </h1>
                                                <h1 className="text-xs md:text-sm text-gray-500 pt-2 px-6">
                                                    Created at {dateConvert(i.created_at)}
                                                </h1>
                                            </div>
                                            <div className="pr-6">
                                                <Button
                                                    className="md:w-fit"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        formikCreateUpdate.setFieldValue("id", i.id)
                                                        formikCreateUpdate.setFieldValue("name", i.name)
                                                        formikCreateUpdate.setFieldValue("content", i.content)
                                                        formikCreateUpdate.setFieldValue("end_date", i.end_date)
                                                        formikCreateUpdate.setFieldValue("base64", banner_url + i.url)
                                                        router.push(`/banner/update/${i.id}`)
                                                    }}>
                                                    Edit
                                                </Button>
                                            </div>
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
            </div>
    );
};

export default Banner;
