"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import { useOutlet } from "@/context/OutletContext";
import { RootState } from "@/store";
import { UserType } from "@/utility/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearToken } from "@/store/slices/authSlices";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const Member: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<UserType[]>([]);
    const [tableDataToCsv, setTableDataToCsv] = useState<UserType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
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
            const fetchMember = async () => {
                try {
                    const response = await fetch(
                        `${API_URL}/admin/user/get-all?search=${search}&outletId=${selectedOutlet}&page=${currentPage}&limit=10`,
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
                        setTableData(res.data.users);
                        setTotalPages(res.data.totalPages);
                        setTotalItems(res.data.totalItems);
                    }
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
                setIsLoading(false);
            };
            fetchMember();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton, selectedOutlet]);

    useEffect(() => {
        const fetchMemberToCsv = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/admin/user/get-all?search=&outletId=${selectedOutlet}&page=1&limit=${totalItems}`,
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
                    setTableDataToCsv(res.data.users);
                }
            } catch (error) {
                console.error("Error fetching vouchers:", error);
            }
            setIsLoading(false);
        };
        fetchMemberToCsv();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOutlet, totalItems]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const header = ["No", "Name", "Phone", "Address", "Outlet", "Join date", "Point", "Status"];

    // === CSV EXPORT HANDLER ===
    const exportToCSV = () => {
        const rows = [
            header,
            ...tableDataToCsv.map((i, index) => [
                (currentPage - 1) * 10 + (index + 1),
                i.user_name,
                i.phone_number,
                i.address ? i.address : "-",
                i.outlet ? i.outlet.name : "-",
                i.created_at ? dateConvert(i.created_at) + " " + timeConvert(i.created_at) : "-",
                i.total_point ? i.total_point : 0,
                i.is_active ? "Active" : "Inactive",
            ]),
        ];

        // pakai ";" biar Excel auto split kolom
        const csvContent =
            "data:text/csv;charset=utf-8," +
            rows.map((e) => e.join(";")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.setAttribute("download", `members-${selectedOutlet !== "" ? tableDataToCsv[0]?.outlet?.name : "all"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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


    return isLoading ? (
        <PulseLoading />
    ) : (
        <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
            {/* Card Header */}
            <div className="px-6 py-5 md:flex justify-between space-y-4 md:space-y-0">
                <div className="relative w-full md:w-auto">
                    {/* search */}
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
                        placeholder="Search member"
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

                {/* Export Button */}
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 w-full md:w-fit rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                    Export CSV
                </button>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                <div className="space-y-6">
                    <TableBasic header={header}>
                        {tableData.map((i, index) => (
                            <TableRow key={i.id}>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {(currentPage - 1) * 10 + (index + 1)}
                                </TableCell>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {i.user_name}
                                </TableCell>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {i.phone_number}
                                </TableCell>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {i.address ? i.address : "-"}
                                </TableCell>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {i.outlet ? i.outlet.name : "-"}
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
                                    {i.total_point ? i.total_point : 0}
                                </TableCell>
                                <TableCell className="p-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {i.is_active ? "Active" : "Inactive"}
                                </TableCell>
                            </TableRow>
                        ))}
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
    );
};

export default Member;
