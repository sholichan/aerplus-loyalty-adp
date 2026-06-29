"use client";

import { PulseLoading } from "@/components/common/loading";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import LimitPagination from "@/components/tables/LimitPagination";
import TableBasic from "@/components/tables/Table";
import { Modal } from "@/components/ui/modal";
import { TableCell, TableRow } from "@/components/ui/table";
import { useOutlet } from "@/context/OutletContext";
import { useModal } from "@/hooks/useModal";
import { RootState } from "@/store";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type RefillDailyRow = {
    day: string;
    total_refill: string;
    total_orders: string;
};

type RefillDetailItem = {
    id: string;
    user_id: string;
    user_name?: string;
    phone_number?: string;
    outlet_name?: string;
    created_at: string;
    device_info?:
    | string
    | {
        device_name?: string;
        deviceName?: string;
        model?: string;
        browser?: string;
        platform?: string;
        ip?: string;
    };
};

const RefillPage: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);
    const { selectedOutlet } = useOutlet();
    const { isOpen, openModal, closeModal } = useModal();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [rows, setRows] = useState<RefillDailyRow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");

    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [detailRows, setDetailRows] = useState<RefillDetailItem[]>([]);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [detailError, setDetailError] = useState<string>("");

    

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
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return;
        if (!auth.token) return;

        const fetchRefill = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `${API_URL}admin/stats/daily-refill?outletId=${selectedOutlet}&startDate=${startDate}&endDate=${endDate}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );

                const res = await response.json();
                if (res?.statusCode === 200) {
                    setRows(Array.isArray(res.data) ? res.data : []);
                } else {
                    setRows([]);
                }
            } catch (error) {
                console.error("Error fetching refill stats:", error);
                setRows([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRefill();
    }, [API_URL, auth.token, endDate, refresh, selectedOutlet, startDate]);

    const filteredRows = useMemo(() => {
        if (!searchKeyword.trim()) return rows;

        const keyword = searchKeyword.trim().toLowerCase();
        return rows.filter((item) => {
            const dateLabel = dayjs(item.day).format("DD MMM YYYY").toLowerCase();
            const totalRefill = String(Number(item.total_refill || 0));
            // const totalOrders = String(Number(item.total_orders || 0));

            return (
                dateLabel.includes(keyword) ||
                totalRefill.includes(keyword)
                // totalOrders.includes(keyword)
            );
        });
    }, [rows, searchKeyword]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(filteredRows.length / limit)),
        [filteredRows.length, limit]
    );

    const pagedRows = useMemo(() => {
        const start = (currentPage - 1) * limit;
        return filteredRows.slice(start, start + limit);
    }, [currentPage, limit, filteredRows]);

    const handlePaginationChange = (page: number, limit: number) => {
        setCurrentPage(page);
        setLimit(limit);
    };

    const handleShowDetail = async (day: string) => {
        setSelectedDay(day);
        openModal();
        setIsDetailLoading(true);
        setDetailError("");
        setDetailRows([]);

        try {
            const response = await fetch(
                `${API_URL}admin/stats/daily-refill/detail?outletId=${selectedOutlet}&date=${day}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            // Cek apakah responnya ok dan tipenya JSON untuk menghindari error JSON.parse
            const contentType = response.headers.get("content-type");
            if (!response.ok || !contentType || !contentType.includes("application/json")) {
                setDetailRows([]);
                setDetailError("Gagal memuat detail refill.");
                return;
            }

            const res = await response.json();
            if (res?.statusCode === 200) {
                setDetailRows(Array.isArray(res.data) ? res.data : []);
            } else {
                setDetailRows([]);
                setDetailError(res?.err || "Gagal memuat detail refill.");
            }
        } catch (error) {
            console.error("Error fetching refill details:", error);
            setDetailRows([]);
            setDetailError("Terjadi kesalahan saat mengambil detail refill.");
        } finally {
            setIsDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        closeModal();
        setSelectedDay(null);
        setDetailRows([]);
        setIsDetailLoading(false);
        setDetailError("");
    };

    const getDeviceLabel = (deviceInfo?: RefillDetailItem["device_info"]) => {
        if (!deviceInfo) return "-";
        if (typeof deviceInfo === "string") return deviceInfo;

        const values = [
            deviceInfo.device_name,
            deviceInfo.deviceName,
            deviceInfo.model,
            deviceInfo.platform,
            deviceInfo.browser,
            deviceInfo.ip,
        ].filter((value): value is string => Boolean(value && value.trim()));

        return values.length > 0 ? values.join(" - ") : "-";
    };

    const header = ["No", "Tanggal", "Total Refill", "Aksi"];

    return isLoading ? (
        <PulseLoading />
    ) : (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-6 pt-8 pb-5 md:flex md:justify-between md:items-center space-y-4 md:space-y-0">
                    <div className="relative" title="search by date / total refill / total order">
                        <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                            <svg
                                className="fill-gray-500 dark:fill-gray-400"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
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
                            placeholder="Search refill..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    setCurrentPage(1);
                                    setSearchKeyword(search);
                                }
                            }}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                        />
                        <button
                            className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                            type="button"
                            onClick={() => {
                                setCurrentPage(1);
                                setSearchKeyword(search);
                            }}
                        >
                            Search
                        </button>
                    </div>

                    <div className="md:flex md:space-x-6 space-y-6 md:space-y-0 space-x-0">
                        <div className="relative">
                            <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500">
                                Start
                            </div>
                            <DatePicker
                                id="refill_start_date"
                                placeholder="Start Date"
                                mode="single"
                                onChange={(_selectedDates: Date[], dateStr: string) => {
                                    setCurrentPage(1);
                                    setStartDate(dateStr);
                                }}
                                defaultDate={startDate ? new Date(startDate) : undefined}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500">
                                End
                            </div>
                            <DatePicker
                                id="refill_end_date"
                                placeholder="End Date"
                                mode="single"
                                onChange={(_selectedDates: Date[], dateStr: string) => {
                                    setCurrentPage(1);
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
                            {pagedRows.map((item, index) => (
                                <TableRow key={`${item.day}-${index}`}>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {(currentPage - 1) * limit + index + 1}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {dayjs(item.day).format("DD MMM YYYY")}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {Number(item.total_refill || 0).toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <button
                                            onClick={() => handleShowDetail(item.day)}
                                            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            Detail
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBasic>

                        {filteredRows.length === 0 && (
                            <div className="text-center text-sm text-gray-500 py-8">
                                Tidak ada data refill pada rentang tanggal ini.
                            </div>
                        )}

                        <div className="flex p-4 border-t border-gray-200 dark:border-gray-700">
                            <LimitPagination
                                currentPage={currentPage}
                                limit={limit}
                                totalPages={totalPages}
                                onPaginationChange={handlePaginationChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeDetailModal} className="max-w-[900px] m-4">
                <div className="flex max-h-[85vh] flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90">
                            Detail Refill - {selectedDay ? dayjs(selectedDay).format("DD MMM YYYY") : "-"}
                        </h4>
                    </div>
                    <div className="flex-1 min-h-0 p-6">
                        <div className="max-h-[60vh] overflow-auto custom-scrollbar">
                            <TableBasic header={["Member", "Outlet", "No. HP", "Waktu", "Perangkat"]} isSetMinW="none">
                                {isDetailLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="p-3 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                                            Memuat detail refill...
                                        </TableCell>
                                    </TableRow>
                                ) : detailError ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="p-3 py-10 text-center text-theme-sm text-red-500">
                                            {detailError}
                                        </TableCell>
                                    </TableRow>
                                ) : detailRows.length > 0 ? (
                                    detailRows.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <div className="font-medium text-gray-700 dark:text-gray-200">
                                                    {detail.user_name || "-"}
                                                </div>
                                                <div className="font-mono text-xs text-gray-500">
                                                    {detail.user_id}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {detail.outlet_name || "-"}
                                            </TableCell>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {detail.phone_number || "-"}
                                            </TableCell>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {dayjs(detail.created_at).format("HH:mm:ss")}
                                            </TableCell>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {getDeviceLabel(detail.device_info)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="p-3 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                                            Tidak ada detail refill pada tanggal ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBasic>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default RefillPage;
