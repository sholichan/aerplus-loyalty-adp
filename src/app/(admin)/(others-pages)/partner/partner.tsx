"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { Modal } from "@/components/ui/modal";
import { TableCell, TableRow } from "@/components/ui/table";
import { useOutlet } from "@/context/OutletContext";
import { useModal } from "@/hooks/useModal";
import { RootState } from "@/store";
import { clearToken } from "@/store/slices/authSlices";
import { PartnerType } from "@/utility/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

type AssignedOutletRow = {
    id: string;
    outlet_id: number;
    outlet?: { id: number; name: string } | null;
    partner_start: string | null;
    partner_end: string | null;
};

const Partner: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);
    const { isOpen, openModal, closeModal } = useModal();

    const [tableData, setTableData] = useState<PartnerType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [unassigningUserId, setUnassigningUserId] = useState<string>("");
    const [selectedPartner, setSelectedPartner] = useState<PartnerType | null>(null);
    const [outletRows, setOutletRows] = useState<AssignedOutletRow[]>([]);
    const [isOutletLoading, setIsOutletLoading] = useState<boolean>(false);
    const [outletError, setOutletError] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState<string>("");
    const [searchButton, setSearchButton] = useState<boolean>(false);
    const [prevSelOutlet, setPrevSeloutlet] = useState<string>("");
    const { selectedOutlet } = useOutlet();

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
        setPrevSeloutlet(selectedOutlet);
        if (prevSelOutlet !== selectedOutlet) {
            setIsLoading(true);
        }
        if (auth.token) {
            const fetchPartner = async () => {
                try {
                    const response = await fetch(
                        `${API_URL}/admin/partner/?search=${search}&outletId=${selectedOutlet}&page=${currentPage}&limit=10&partnerAccess=true`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${auth.token}`,
                            },
                        }
                    );
                    const res = await response.json();

                    if (res.statusCode === 200) {
                        setTableData(res.data.partners);
                        setTotalPages(res.data.totalPages);
                        setTotalItems(res.data.totalItems);
                    }
                } catch (error) {
                    console.error("Error fetching partners:", error);
                }
                setIsLoading(false);
            };
            fetchPartner();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton, selectedOutlet]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const header = ["No", "Member Name", "Partner Name", "Phone", "Action"];

    const dateConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const date: string = parsedDate.format("YYYY-MM-DD");
        return date;
    };

    const timeConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const time: string = parsedDate.format("HH:mm:ss");
        return time;
    };

    const unassign = async (userId: string) => {
        if (!userId) return;
        try {
            setUnassigningUserId(userId);
            const response = await fetch(`${API_URL}/admin/partner/unassign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ user_id: userId }),
            });
            const res = await response.json();
            if (res.statusCode === 200) {
                toast.success("Unassign success");
                setIsLoading(true);
                setRefresh(!refresh);
            } else {
                toast.error(res.err || "Failed to unassign");
            }
        } catch (error) {
            console.error("Error unassign:", error);
            toast.error("Failed to unassign");
        } finally {
            setUnassigningUserId("");
        }
    };

    const openOutletModal = async (partner: PartnerType) => {
        setSelectedPartner(partner);
        openModal();
        setOutletRows([]);
        setOutletError("");
        if (!auth.token) return;

        try {
            setIsOutletLoading(true);
            const response = await fetch(`${API_URL}/admin/partner/${partner.id}/outlets`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            const res = await response.json();
            if (res?.statusCode === 200) {
                setOutletRows(Array.isArray(res.data) ? (res.data as AssignedOutletRow[]) : []);
            } else {
                setOutletError(res?.err || "Failed to load outlets");
            }
        } catch (error) {
            console.error("Error fetching assigned outlets:", error);
            setOutletError("Failed to load outlets");
        } finally {
            setIsOutletLoading(false);
        }
    };

    const closeOutletModal = () => {
        setSelectedPartner(null);
        setOutletRows([]);
        setOutletError("");
        closeModal();
    };

    return isLoading ? (
        <PulseLoading />
    ) : (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-5 md:flex justify-between space-y-4 md:space-y-0">
                <div className="relative w-full md:w-auto">
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
                        placeholder="Search partner"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                setCurrentPage(1);
                                setIsLoading(!isLoading);
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
                            setIsLoading(!isLoading);
                            setSearchButton(!searchButton);
                        }}
                    >
                        Search
                    </button>
                </div>
                <button
                    className="px-4 py-2 w-full md:w-fit rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                    onClick={() => router.push("/partner/assign")}
                >
                    Add Partner
                </button>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                <div className="space-y-6">
                    <TableBasic header={header} isSetMinW="none" headerTextPosition="text-center">
                        {tableData.length > 0 ? (
                            tableData.map((i, index) => (
                                <TableRow key={i.id}>
                                    <TableCell className="p-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                        {(currentPage - 1) * 10 + (index + 1)}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                        {i.user?.user_name}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                        {i.name}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                        {i.phone_number}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                                                onClick={() => openOutletModal(i)}
                                            >
                                                View Outlets
                                            </button>
                                            <button
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                                                disabled={!i.user_id || unassigningUserId === i.user_id}
                                                onClick={() => {
                                                    if (!i.user_id) return;
                                                    const ok = window.confirm(`Unassign partner from ${i.user?.user_name || "this user"}?`);
                                                    if (!ok) return;
                                                    unassign(i.user_id);
                                                }}
                                            >
                                                {unassigningUserId === i.user_id ? "Unassigning..." : "Unassign"}
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={header.length}
                                    className="p-6 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                                >
                                    No data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBasic>
                    <div className="flex justify-end">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePaginationChange}
                        />
                    </div>
                </div>
            </div>
        </div>

            <Modal isOpen={isOpen} onClose={closeOutletModal} className="max-w-[900px] m-4">
                <div className="flex max-h-[85vh] flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90">
                            Assigned Outlets - {selectedPartner?.name || "-"}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Member: {selectedPartner?.user?.user_name || "-"}
                        </p>
                    </div>
                    <div className="flex-1 min-h-0 p-6">
                        <div className="max-h-[60vh] overflow-auto custom-scrollbar">
                            <TableBasic header={["Outlet", "Start Date", "End Date"]} isSetMinW="none">
                                {isOutletLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-3 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                                            Memuat outlet...
                                        </TableCell>
                                    </TableRow>
                                ) : outletError ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-3 py-10 text-center text-theme-sm text-red-500">
                                            {outletError}
                                        </TableCell>
                                    </TableRow>
                                ) : outletRows.length > 0 ? (
                                    outletRows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <div className="font-medium text-gray-700 dark:text-gray-200">
                                                    {row.outlet?.name || "-"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {row.outlet_id}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {row.partner_start ? dayjs(row.partner_start).format("YYYY-MM-DD") : "-"}
                                            </TableCell>
                                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {row.partner_end ? dayjs(row.partner_end).format("YYYY-MM-DD") : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-3 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                                            Tidak ada outlet yang ter-assign.
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

export default Partner;
