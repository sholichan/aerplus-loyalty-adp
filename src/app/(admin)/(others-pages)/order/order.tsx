"use client";

import { PulseLoading } from "@/components/common/loading";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import { useOutlet } from "@/context/OutletContext";
import { RootState } from "@/store";
import { OrderType } from "@/utility/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const OrderPage: React.FC = () => {
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<OrderType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState<string>("")
    const [searchButton, setSearchButton] = useState<boolean>(false)
    const [prevSelOutlet, setPrevSeloutlet] = useState<string>("")
    const { selectedOutlet } = useOutlet();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (auth.user?.role.name !== "super admin") {
            router.push("/signin")
        } else {
            setRefresh(!refresh)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token, router])

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const formatDate = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
            ).padStart(2, "0")}`;

        setStartDate(formatDate(firstDay));
        setEndDate(formatDate(lastDay));
    }, [auth.token, router]);


    useEffect(() => {
        setPrevSeloutlet(selectedOutlet)
        if (auth.token) {
            if (prevSelOutlet !== selectedOutlet) {
                setIsLoading(true)
            }
            const fetchOrder = async () => {
                try {
                    const response = await fetch(`${API_URL}/admin/order/get-all?search=${search}&outletId=${selectedOutlet}&page=${currentPage}&limit=10&startDate=${startDate}&endDate=${endDate}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${auth.token}`,
                        },
                    });
                    const res = await response.json();
                    setTableData(res.data.orders);
                    setTotalPages(res.data.totalPages);
                    // console.log(res.data);
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
                setIsLoading(false)
            };

            fetchOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton, startDate, endDate, selectedOutlet]);

    const handlePaginationChange = (page: number) => {
        if (currentPage !== page) {
            setIsLoading(true)
            setCurrentPage(page);
        }
    };

    const dateConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const date: string = parsedDate.format('YYYY-MM-DD');
        return date
    }

    const timeConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const time: string = parsedDate.format('HH:mm:ss');
        return time
    }


    const header = ["no", "date order", "invoice ref", "member", "outlet", "quantity", "amount", "total amount", "benefit"];

    return (
        isLoading ?
            <PulseLoading /> :
            <>
                <div
                    className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-10 pb-5 md:flex justify-between space-y-6 md:space-y-0">
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
                                placeholder="Search by invoice"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                }}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        setIsLoading(true);
                                        setSearchButton(!searchButton);
                                    }
                                }}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                            />

                            <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                                type="submit"

                                onClick={() => {
                                    setIsLoading(true)
                                    setSearchButton(!searchButton)
                                }}
                            >
                                Search
                            </button>
                        </div>
                        <div className="md:flex md:space-x-6 space-y-6 md:space-y-0 space-x-0">

                            <div className="relative">
                                <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500"
                                >
                                    Start
                                </div>
                                <DatePicker
                                    id="start_date"
                                    placeholder="Start Date"
                                    mode="single"
                                    onChange={(selectedDates: Date[], dateStr: string) => {
                                        setIsLoading(true)
                                        setStartDate(dateStr)
                                    }}
                                    defaultDate={new Date(startDate)}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500"
                                >
                                    End
                                </div>
                                <DatePicker
                                    id="end_date"
                                    placeholder="End Date"
                                    mode="single"
                                    onChange={(selectedDates: Date[], dateStr: string) => {
                                        setIsLoading(true);
                                        setEndDate(dateStr);
                                    }}
                                    defaultDate={endDate ? new Date(endDate) : undefined}
                                    minDate={startDate ? new Date(startDate) : undefined}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                        <div className="space-y-6">
                            <TableBasic header={header}>
                                {tableData.map((i, index) => (
                                    <TableRow key={i.id}>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                           {(currentPage - 1) * 10 + (index + 1)}
                                        </TableCell>
                                        <TableCell className="p-3 text-theme-sm  text-gray-500 dark:text-gray-400">
                                            <div className="rounded-sm">
                                                <span className="block text-theme-sm">
                                                    {dateConvert(i.created_at)}
                                                </span>
                                                <span className="block text-theme-xs">
                                                    {timeConvert(i.created_at)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {i.ref_id}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {i.user ? i.user?.user_name : "-"}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {i.outlet}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {i.qty}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {i.amount}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {i.total_amount}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {i.total_benefit}
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
                </div>
            </>
    );
};

export default OrderPage;
