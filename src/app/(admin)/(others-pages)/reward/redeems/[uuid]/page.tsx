"use client";

import { PulseLoading } from "@/components/common/loading";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import { TableCell, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { RootState } from "@/store";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearToken } from "@/store/slices/authSlices";
import { toast } from "react-toastify";
import dayjs from "dayjs";

type RedeemItem = {
    uuid: string;
    user_name: string;
    phone_number: string;
    redeem_code: string;
    redeemed_at: string;
};

const RedeemListPage: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();
    const uuid = params.uuid as string;
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<RedeemItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [rewardName, setRewardName] = useState<string>("");
    const [isExporting, setIsExporting] = useState<boolean>(false);

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
     * FETCH REDEEM LIST
     */
    useEffect(() => {
        if (!auth.token) return;

        const fetchRedeems = async () => {
            setIsLoading(true);

            try {
                const response = await fetch(
                    `${API_URL}/admin/redeem/list/reward/${uuid}?page=${currentPage}&limit=10`,
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
                    setTableData(res.data.redeems);
                    setTotalPages(res.data.totalPages);
                    setTotalItems(res.data.totalItems);
                    setRewardName(res.data.reward_name);
                }
            } catch (error) {
                console.error("Error fetching redeems:", error);
            }

            setIsLoading(false);
        };

        fetchRedeems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, uuid]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const resp = await fetch(`${API_URL}/admin/redeem/export/reward/${uuid}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!resp.ok) throw new Error("export failed");
            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `redeems-${uuid}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            toast.error("Gagal export Excel");
        } finally {
            setIsExporting(false);
        }
    };

    const header = ["No", "User", "Kode Redeem", "Tgl Redeem"];

    const dateConvert = (isoString: string) =>
        dayjs(isoString).format("YYYY-MM-DD");

    const timeConvert = (isoString: string) =>
        dayjs(isoString).format("HH:mm:ss");

    return isLoading ? (
        <PulseLoading />
    ) : (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header */}
            <div className="px-6 py-5 md:flex justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/reward")}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                    >
                        ← Kembali
                    </button>
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        Daftar Redeem — {rewardName}
                    </h2>
                    <span className="text-sm text-gray-400">({totalItems} total)</span>
                </div>

                <Button
                    size="sm"
                    variant="primary"
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? "Exporting..." : "Export Excel"}
                </Button>
            </div>

            {/* Table */}
            <div className="p-4 border-t sm:p-6">
                <TableBasic header={header} isSetMinW="none">
                    {tableData.map((r, index) => (
                        <TableRow key={r.uuid}>
                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {(currentPage - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell className="p-3 text-start text-theme-sm">
                                <span className="block font-semibold text-gray-800 dark:text-white/90">
                                    {r.user_name}
                                </span>
                                <span className="block text-theme-xs text-gray-400">
                                    {r.phone_number}
                                </span>
                            </TableCell>
                            <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {r.redeem_code}
                            </TableCell>
                            <TableCell className="p-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                <div className="rounded-sm">
                                    <span className="block text-theme-sm">
                                        {dateConvert(r.redeemed_at)}
                                    </span>
                                    <span className="block text-theme-xs">
                                        {timeConvert(r.redeemed_at)}
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
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

export default RedeemListPage;
