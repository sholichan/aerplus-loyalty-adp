"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearToken } from "@/store/slices/authSlices";
import { toast } from "react-toastify";
import { CiEdit } from "react-icons/ci";
import dayjs from "dayjs";
import { getRewardTypeBadge } from "@/utility/mapper"

type RewardType = {
    id: number;
    uuid: string;
    name: string;
    type: string;
    point_eligibility: number;
    status: string;
    image   : string;
    created_at: string;
};

const RewardPage: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<RewardType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState<string>("");
    const [searchButton, setSearchButton] = useState<boolean>(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    /**
     * AUTH GUARD
     */
    useEffect(() => {
        const now = Date.now() / 1000;
        let exp = false;

        if (auth.user?.exp !== undefined) {
            exp = now > auth.user?.exp;
        }

        if (!auth.token || exp) {
            localStorage.clear();
            dispatch(clearToken());
            router.push("/signin");
            toast.warn("Your session has expired, please login!");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token]);

    /**
     * FETCH REWARD LIST
     */
    useEffect(() => {
        if (!auth.token) return;

        const fetchRewards = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(
                    `${API_URL}/admin/reward/get-all?search=${search}&page=${currentPage}&limit=10`,
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
                    setTableData(res.data.rewards);
                    setTotalPages(res.data.totalPages);
                    setTotalItems(res.data.totalItems);
                }
            } catch (error) {
                console.error("Error fetching rewards:", error);
            }

            setIsLoading(false);
        };

        fetchRewards();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchButton]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const header = ["No", "Name", "Type", "Point", "Status", "Created At", "Action"];

    const dateConvert = (isoString: string) =>
        dayjs(isoString).format("YYYY-MM-DD");

    const timeConvert = (isoString: string) =>
        dayjs(isoString).format("HH:mm:ss");

    return isLoading ? (
        <PulseLoading />
    ) : (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header */}
            <div className="px-6 py-5 md:flex justify-between space-y-4 md:space-y-0">
                {/* Search */}
                <div className="relative w-full md:w-auto">
                    <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                        🔍
                    </span>

                    <Input
                        type="text"
                        placeholder="Search reward"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setCurrentPage(1);
                                setSearchButton(!searchButton);
                            }
                        }}
                        className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm"
                    />

                    <button
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg border px-3 py-1 text-xs"
                        onClick={() => {
                            setCurrentPage(1);
                            setSearchButton(!searchButton);
                        }}
                    >
                        Search
                    </button>
                </div>

                {/* Create Button */}
                <button
                    onClick={() => router.push("/reward/create")}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                    + Create Reward
                </button>
            </div>

            {/* Table */}
            <div className="p-4 border-t sm:p-6">
                <TableBasic header={header} isSetMinW="none">
                    {
                    tableData.map((r, index) => {
                        const badge = getRewardTypeBadge(r.type);

                        return (
                            <TableRow key={r.uuid}>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    {(currentPage - 1) * 10 + (index + 1)}
                                </TableCell>
                                <TableCell className="p-3 text-blue-500 text-start text-theme-sm dark:text-blue-400">
                                    <a href={API_URL?.replaceAll('/api/', '') + r.image} target="_blank">{r.name}</a>
                                </TableCell>
                                <TableCell className={`p-3 ${badge.color} text-start text-theme-sm dark:text-gray-400`}>{badge.label}</TableCell>
                                <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"><b>{r.point_eligibility}</b></TableCell>
                                <TableCell className={r.status === 'active' ? "p-3 text-green-500 text-start text-theme-sm dark:text-green-400" : "p-3 text-red-500 text-start text-theme-sm dark:text-green-400"}>
                                    {r.status === "active" ? "Active" : "Inactive"}
                                </TableCell>
                                <TableCell className="p-3 text-theme-sm  text-gray-500 dark:text-gray-400">
                                    <div className="rounded-sm">
                                        <span className="block text-theme-sm">
                                            {dateConvert(r.created_at)}
                                        </span>
                                        <span className="block text-theme-xs">
                                            {timeConvert(r.created_at)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="p-3 text-theme-sm  text-gray-500 dark:text-gray-400">
                                    <Button size="sm" onClick={() => router.push(`/reward/update/${r.uuid}`)} variant="primary">
                                        <CiEdit />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                }
                
                </TableBasic>

                <div className="flex justify-end mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePaginationChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default RewardPage;
