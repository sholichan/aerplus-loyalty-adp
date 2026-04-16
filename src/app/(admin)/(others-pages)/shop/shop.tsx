"use client";

import { PulseLoading } from "@/components/common/loading";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { Modal } from "@/components/ui/modal";
import { TableCell, TableRow } from "@/components/ui/table";
import { useOutlet } from "@/context/OutletContext";
import { useModal } from "@/hooks/useModal";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { ShopOrderType } from "@/utility/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const ShopPage: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);
    const { selectedOutlet } = useOutlet();
    const { isOpen, openModal, closeModal } = useModal();

    const [tableData, setTableData] = useState<ShopOrderType[]>([]);
    const [selectedData, setSelectedData] = useState<ShopOrderType | null>(null);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState<string>("");
    const [searchButton, setSearchButton] = useState<boolean>(false);
    const [prevSelOutlet, setPrevSelOutlet] = useState<string>("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const now = Date.now() / 1000;
        let exp = true;
        if (auth.user?.exp !== undefined) exp = now > auth.user?.exp;
        if (auth.user?.role.name !== "super admin" || exp) {
            localStorage.clear();
            dispatch(clearToken());
            router.push("/signin");
            toast.warn("Your session has expired, please login!");
        } else {
            setRefresh(!refresh);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token, router]);

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
        setPrevSelOutlet(selectedOutlet);
        if (auth.token) {
            if (prevSelOutlet !== selectedOutlet) {
                setIsLoading(true);
            }

            const fetchShop = async () => {
                try {
                    const response = await fetch(
                        `${API_URL}/admin/shop/get-all?search=${search}&outletId=${selectedOutlet}&page=${currentPage}&limit=10&startDate=${startDate}&endDate=${endDate}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${auth.token}`,
                            },
                        }
                    );

                    const res = await response.json();
                    setTableData(res?.data?.orders || []);
                    setTotalPages(res?.data?.totalPages || 1);
                } catch (error) {
                    console.error("Error fetching shop data:", error);
                }
                setIsLoading(false);
            };

            fetchShop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton, startDate, endDate, selectedOutlet]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const dateConvert = (isoString?: string | null) => {
        if (!isoString) return "-";
        return dayjs(isoString).format("YYYY-MM-DD");
    };

    const timeConvert = (isoString?: string | null) => {
        if (!isoString) return "-";
        return dayjs(isoString).format("HH:mm:ss");
    };

    const openDetail = (data: ShopOrderType) => {
        setSelectedData(data);
        openModal();
    };

    const exportToCSV = () => {
        const csvHeader = header.filter((item) => item !== "Action");
        const rows = [
            csvHeader,
            ...tableData.map((item, index) => [
                (currentPage - 1) * 10 + (index + 1),
                item.outlet_name || "-",
                item.order_number || "-",
                item.payment_method || "-",
                item.payment_unit === "point"
                    ? `${Number(item.price_or_point || 0).toLocaleString("id-ID")} Point`
                    : `Rp ${Number(item.price_or_point || 0).toLocaleString("id-ID")}`,
                item.status || "-",
                `${dateConvert(item.payment_date)} ${timeConvert(item.payment_date)}`,
                `${dateConvert(item.pickup_date)} ${timeConvert(item.pickup_date)}`,
                `${dateConvert(item.order_date)} ${timeConvert(item.order_date)}`,
            ]),
        ];

        const csvContent =
            "data:text/csv;charset=utf-8," +
            rows.map((e) => e.join(";")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.setAttribute(
            "download",
            `shop-page-${currentPage}-${selectedOutlet !== "" ? selectedOutlet : "all"}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const header = [
        "No",
        "Outlet Name",
        "Nomor Pesanan",
        "Metode Pembayaran",
        "Price/Point",
        "Status",
        "Tanggal Pembayaran",
        "Tanggal Pengambilan",
        "Tanggal Pesan",
        "Action",
    ];

    return (
        isLoading ? (
            <PulseLoading />
        ) : (
            <>
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="px-6 pt-10 pb-5 md:flex justify-between space-y-6 md:space-y-0">
                        <div className="relative" title="search by order number, payment method, status">
                            <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                                <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
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
                                placeholder="Search shop..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        setCurrentPage(1);
                                        setIsLoading(true);
                                        setSearchButton(!searchButton);
                                    }
                                }}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                            />
                            <button
                                className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                                type="submit"
                                onClick={() => {
                                    setCurrentPage(1);
                                    setIsLoading(true);
                                    setSearchButton(!searchButton);
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
                                    id="start_date"
                                    placeholder="Start Date"
                                    mode="single"
                                    onChange={(_selectedDates: Date[], dateStr: string) => {
                                        setIsLoading(true);
                                        setStartDate(dateStr);
                                    }}
                                    defaultDate={new Date(startDate)}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500">
                                    End
                                </div>
                                <DatePicker
                                    id="end_date"
                                    placeholder="End Date"
                                    mode="single"
                                    onChange={(_selectedDates: Date[], dateStr: string) => {
                                        setIsLoading(true);
                                        setEndDate(dateStr);
                                    }}
                                    defaultDate={endDate ? new Date(endDate) : undefined}
                                    minDate={startDate ? new Date(startDate) : undefined}
                                />
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="h-11 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                        <div className="space-y-6">
                            <TableBasic header={header}>
                                {tableData.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {(currentPage - 1) * 10 + (index + 1)}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {item.outlet_name}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {item.order_number}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {item.payment_method}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {item.payment_unit === "point"
                                                ? `${Number(item.price_or_point || 0).toLocaleString("id-ID")} Point`
                                                : `Rp ${Number(item.price_or_point || 0).toLocaleString("id-ID")}`}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {item.status}
                                        </TableCell>
                                        <TableCell className="p-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            <div className="rounded-sm">
                                                <span className="block text-theme-sm">{dateConvert(item.payment_date)}</span>
                                                <span className="block text-theme-xs">{timeConvert(item.payment_date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            <div className="rounded-sm">
                                                <span className="block text-theme-sm">{dateConvert(item.pickup_date)}</span>
                                                <span className="block text-theme-xs">{timeConvert(item.pickup_date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            <div className="rounded-sm">
                                                <span className="block text-theme-sm">{dateConvert(item.order_date)}</span>
                                                <span className="block text-theme-xs">{timeConvert(item.order_date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <button
                                                type="button"
                                                onClick={() => openDetail(item)}
                                                className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                Detail
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBasic>

                            <div className="flex justify-end">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePaginationChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[900px] m-4">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90">
                            Detail Shop - {selectedData?.order_number}
                        </h4>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div><span className="text-gray-500">Outlet:</span> {selectedData?.outlet_name || "-"}</div>
                            <div><span className="text-gray-500">Metode Pembayaran:</span> {selectedData?.payment_method || "-"}</div>
                            <div><span className="text-gray-500">Status:</span> {selectedData?.status || "-"}</div>
                            <div>
                                <span className="text-gray-500">Price/Point:</span>{" "}
                                {selectedData?.payment_unit === "point"
                                    ? `${Number(selectedData?.price_or_point || 0).toLocaleString("id-ID")} Point`
                                    : `Rp ${Number(selectedData?.price_or_point || 0).toLocaleString("id-ID")}`}
                            </div>
                        </div>

                        <TableBasic header={["Product Name", "Qty", "Subtotal (Price/Point)"]} isSetMinW="none">
                            {(selectedData?.items || []).map((item, index) => (
                                <TableRow key={`${item.product_name}-${index}`}>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.product_name}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.qty}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {selectedData?.payment_unit === "point"
                                            ? `${Number(item.subtotal_point || 0).toLocaleString("id-ID")} Point`
                                            : `Rp ${Number(item.subtotal_price || item.subtotal || 0).toLocaleString("id-ID")}`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBasic>
                    </div>
                </Modal>
            </>
        )
    );
};

export default ShopPage;
