"use client";

import { PulseLoading } from "@/components/common/loading";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { TableCell, TableRow } from "@/components/ui/table";
import { useModal } from "@/hooks/useModal";
import { ChevronDownIcon } from "@/icons";
import { RootState } from "@/store";
import { VoucherType } from "@/utility/types";
import dayjs from 'dayjs';
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from 'yup';

const Voucher: React.FC = () => {
    const [tableData, setTableData] = useState<VoucherType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isCreate, setIsCreate] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [search, setSearch] = useState<string>("")
    const [searchButton, setSearchButton] = useState<boolean>(false)


    const { isOpen, openModal, closeModal } = useModal();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
            const fetchVoucher = async () => {
                try {
                    const response = await fetch(`${API_URL}/admin/voucher/get-all?search=${search}&page=${currentPage}&limit=10`);
                    const res = await response.json();
                    setTableData(res.data.vouchers);
                    setTotalPages(res.data.totalPages);
                    // console.log(res.data);
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
                setIsLoading(!isLoading)
            };

            fetchVoucher();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton]);

    const formikCreateUpdate = useFormik({
        initialValues: {
            "id": "",
            "code": "",
            "discount_type": "",
            "discount_value": 0,
            "usage_limit": null,
            "start_date": dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss[Z]'),
            "end_date": dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss[Z]'),
            "description": "",
            "is_active": true
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Field can't be empty"),
            discount_type: Yup.string().required("Field can't be empty"),
            discount_value: Yup.number().required("Field can't be empty"),
            start_date: Yup.string(),
            end_date: Yup.string(),
            description: Yup.string().required("Field can't be empty"),
            is_active: Yup.boolean()
        }),
        onSubmit: async (values) => {
            // console.log(values);
            setIsLoading(!isLoading)
            let createValues = {}
            if (values.id == "") {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...newValues } = values
                createValues = newValues
            }
            try {
                const response = await fetch(`${API_URL}admin/voucher/create-update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(isCreate ? createValues : values),
                });
                const res = await response.json();
                if (res.statusCode == 200) {
                    closeModal()
                    toast.success(`${isCreate ? "Create " : "Update "}Voucher Success!`)
                    resetFormik()
                } else {
                    closeModal()
                    toast.error(`${isCreate ? "Create " : "Update "}Voucher Failed! ${res.err}`)
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
        formikCreateUpdate.setFieldValue("code", "")
        formikCreateUpdate.setFieldValue("discount_type", "")
        formikCreateUpdate.setFieldValue("discount_value", 0)
        formikCreateUpdate.setFieldValue("start_date", dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss[Z]'))
        formikCreateUpdate.setFieldValue("end_date", dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss[Z]'))
        formikCreateUpdate.setFieldValue("description", "")
    }

    const options = [
        { value: "percentage", label: "Percentage" },
        { value: "fixed", label: "Fixed" },
    ];
    const header = ["no", "voucher code", "discount type", "discount value", "start date", "end date", "description", "action"];

    if (isLoading) {
        return (
            <PulseLoading />
        )
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
                            placeholder="Search voucher"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value.toUpperCase())
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
                        variant="primary" onClick={() => {
                            setIsCreate(true)
                            openModal()
                        }}>
                        Add Voucher +
                    </Button>
                </div>

                {/* Card Body */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                    <div className="space-y-6">
                        <TableBasic header={header}>
                            {tableData.map((i, index) => (
                                <TableRow key={i.id}>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                                        {(currentPage - 1) * 10 + (index + 1)}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-semibold text-blue-500 text-center text-theme-sm ">
                                        <div className="w-full bg-blue-200 py-4 rounded-lg">
                                            {i.code}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                                        {i.discount_type}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {i.discount_value}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-success-600 text-center text-theme-sm">
                                        <div className="w-full bg-success-100 p-2 rounded-lg">
                                            <span className="block font-medium text-theme-sm">
                                                {dateConvert(i.start_date)}
                                            </span>
                                            {/* <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                            {timeConvert(i.start_date)}
                                        </span> */}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-warning-500 text-center text-theme-sm">
                                        <div className="w-full bg-warning-100 p-2 rounded-lg">
                                            <span className="block font-medium text-theme-sm">
                                                {dateConvert(i.end_date)}
                                            </span>
                                            {/* <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                            {timeConvert(i.end_date)}
                                        </span> */}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {i.description}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-blue-600 text-center text-theme-sm ">
                                        <div className="flex w-fit bg-blue-200 p-2 rounded-lg justify-center cursor-pointer" onClick={() => {
                                            setIsCreate(false)
                                            formikCreateUpdate.setFieldValue("id", i?.id)
                                            formikCreateUpdate.setFieldValue("code", i?.code)
                                            formikCreateUpdate.setFieldValue("discount_type", i?.discount_type)
                                            formikCreateUpdate.setFieldValue("discount_value", i?.discount_value)
                                            formikCreateUpdate.setFieldValue("start_date", i?.start_date)
                                            formikCreateUpdate.setFieldValue("end_date", i?.end_date)
                                            formikCreateUpdate.setFieldValue("description", i?.description)
                                            openModal()
                                        }}>
                                            <BiEdit size={20} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBasic>
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
                        resetFormik()
                        closeModal()
                    }}
                    className="max-w-[700px] p-6 lg:p-10"
                >
                    <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
                        <div>
                            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                                {isCreate ? "Add Voucher" : "Update Voucher"}
                            </h5>
                        </div>

                        {
                            /* form create */
                            isCreate ?
                                <div className="overflow-y-auto custom-scrollbar">
                                    <form>
                                        <div className="space-y-6 mt-8">
                                            <div>
                                                <DatePicker
                                                    id="start_date"
                                                    label="Start Date"
                                                    placeholder="Start Date"
                                                    mode="single"
                                                    onChange={(selectedDates: Date[], dateStr: string) => {
                                                        console.log("start date:", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'));
                                                        formikCreateUpdate.setFieldValue("start_date", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'))
                                                    }}
                                                    defaultDate={formikCreateUpdate.values.start_date}
                                                />
                                                {formikCreateUpdate.touched.start_date && formikCreateUpdate.errors.start_date ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.start_date}</div>
                                                ) : null}
                                            </div>
                                            <div>
                                                <DatePicker
                                                    id="end_date"
                                                    label="End Date"
                                                    placeholder="End Date"
                                                    mode="single"
                                                    onChange={(selectedDates: Date[], dateStr: string) => {

                                                        console.log("end date:", dayjs(dateStr)
                                                            .format('YYYY-MM-DDTHH:mm:ss[Z]'));
                                                        formikCreateUpdate.setFieldValue("end_date", dayjs(dateStr)
                                                            .format('YYYY-MM-DDTHH:mm:ss[Z]'))
                                                    }}
                                                    defaultDate={formikCreateUpdate.values.end_date}
                                                />
                                                {formikCreateUpdate.touched.end_date && formikCreateUpdate.errors.end_date ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.end_date}</div>
                                                ) : null}
                                            </div>
                                            <div>
                                                <Label>
                                                    Voucher Code <span className="text-error-500">*</span>{" "}
                                                </Label>
                                                <Input
                                                    name="code"
                                                    type="text"
                                                    placeholder=""
                                                    value={formikCreateUpdate.values.code}
                                                    onChange={
                                                        (e) => {
                                                            formikCreateUpdate.setFieldValue("code", e.target.value.toUpperCase())
                                                        }} />
                                                {formikCreateUpdate.touched.code && formikCreateUpdate.errors.code ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.code}</div>
                                                ) : null}
                                            </div>
                                            <div className="relative">
                                                <Label>
                                                    Discount Type
                                                </Label>
                                                <div className="relative">
                                                    <Select
                                                        options={options}
                                                        placeholder="Select an option"
                                                        className="dark:bg-dark-900"
                                                        onChange={
                                                            (e) => {
                                                                formikCreateUpdate.setFieldValue("discount_type", e)
                                                            }} />
                                                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                        <ChevronDownIcon />
                                                    </span>
                                                    {formikCreateUpdate.touched.discount_type && formikCreateUpdate.errors.discount_type ? (
                                                        <div style={{ color: 'red' }}>{formikCreateUpdate.errors.discount_type}</div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>
                                                    Discount Value <span className="text-error-500">*</span>{" "}
                                                </Label>
                                                <Input
                                                    name="discount_value"
                                                    type="number"
                                                    placeholder=""
                                                    value={formikCreateUpdate.values.discount_value}
                                                    onChange={
                                                        formikCreateUpdate.handleChange} />
                                                {formikCreateUpdate.touched.discount_value && formikCreateUpdate.errors.discount_value ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.discount_value}</div>
                                                ) : null}
                                            </div>

                                            <div>
                                                <Label>
                                                    Description <span className="text-error-500">*</span>{" "}
                                                </Label>
                                                <Input
                                                    name="description"
                                                    type="text"
                                                    placeholder=""
                                                    value={formikCreateUpdate.values.description}
                                                    onChange={
                                                        formikCreateUpdate.handleChange} />
                                                {formikCreateUpdate.touched.description && formikCreateUpdate.errors.description ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.description}</div>
                                                ) : null}
                                            </div>
                                            <Button
                                                className="md:w-fit w-full"
                                                size="sm"
                                                variant="primary" onClick={formikCreateUpdate.handleSubmit}>
                                                Submit
                                            </Button>
                                        </div>
                                    </form>
                                </div> :

                                /* form update */
                                <div className="overflow-y-auto custom-scrollbar">
                                    <form>
                                        <div className="space-y-6 mt-8">
                                            <div>
                                                <DatePicker
                                                    id="start_date"
                                                    label="Start Date"
                                                    placeholder="Start Date"
                                                    mode="single"
                                                    onChange={(selectedDates: Date[], dateStr: string) => {
                                                        console.log("start date:", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'));
                                                        formikCreateUpdate.setFieldValue("start_date", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'))
                                                    }}
                                                    defaultDate={formikCreateUpdate.values.start_date}
                                                />
                                                {formikCreateUpdate.touched.start_date && formikCreateUpdate.errors.start_date ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.start_date}</div>
                                                ) : null}
                                            </div>
                                            <div>
                                                <DatePicker
                                                    id="end_date"
                                                    label="End Date"
                                                    placeholder="End Date"
                                                    mode="single"
                                                    onChange={(selectedDates: Date[], dateStr: string) => {
                                                        console.log("end date:", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'));
                                                        formikCreateUpdate.setFieldValue("end_date", dayjs(dateStr).format('YYYY-MM-DDTHH:mm:ss[Z]'))
                                                    }}
                                                    defaultDate={formikCreateUpdate.values.end_date}
                                                />
                                                {formikCreateUpdate.touched.end_date && formikCreateUpdate.errors.end_date ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.end_date}</div>
                                                ) : null}
                                            </div>
                                            <div>
                                                <Label>
                                                    Voucher Code <span className="text-error-500">*</span>{" "}
                                                </Label>
                                                <Input
                                                    name="code"
                                                    type="text"
                                                    placeholder=""
                                                    value={formikCreateUpdate.values.code}
                                                    onChange={
                                                        (e) => {
                                                            formikCreateUpdate.setFieldValue("code", e.target.value.toUpperCase())
                                                        }} />
                                                {formikCreateUpdate.touched.code && formikCreateUpdate.errors.code ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.code}</div>
                                                ) : null}
                                            </div>
                                            <div className="relative">
                                                <Label>
                                                    Discount Type
                                                </Label>
                                                <div className="relative">
                                                    <Select
                                                        options={options}
                                                        value={formikCreateUpdate.values.discount_type}
                                                        placeholder="Select an option"
                                                        className="dark:bg-dark-900"
                                                        onChange={
                                                            (e) => {
                                                                formikCreateUpdate.setFieldValue("discount_type", e)
                                                            }} />
                                                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                        <ChevronDownIcon />
                                                    </span>
                                                    {formikCreateUpdate.touched.discount_type && formikCreateUpdate.errors.discount_type ? (
                                                        <div style={{ color: 'red' }}>{formikCreateUpdate.errors.discount_type}</div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>
                                                    Discount Value <span className="text-error-500">*</span>{" "}
                                                </Label>
                                                <Input
                                                    name="discount_value"
                                                    type="number"
                                                    placeholder=""
                                                    value={formikCreateUpdate.values.discount_value}
                                                    onChange={
                                                        formikCreateUpdate.handleChange} />
                                                {formikCreateUpdate.touched.discount_value && formikCreateUpdate.errors.discount_value ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.discount_value}</div>
                                                ) : null}
                                            </div>

                                            <div>
                                                <Label>
                                                    Description <span className="text-error-500">*</span>{" "}
                                                </Label>
                                                <Input
                                                    name="description"
                                                    type="text"
                                                    placeholder=""
                                                    value={formikCreateUpdate.values.description}
                                                    onChange={
                                                        formikCreateUpdate.handleChange} />
                                                {formikCreateUpdate.touched.description && formikCreateUpdate.errors.description ? (
                                                    <div style={{ color: 'red' }}>{formikCreateUpdate.errors.description}</div>
                                                ) : null}
                                            </div>
                                            <Button size="sm" variant="primary" onClick={formikCreateUpdate.handleSubmit}>
                                                Submit
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                        }
                    </div>
                </Modal>
            </div>
    );
};

export default Voucher;
