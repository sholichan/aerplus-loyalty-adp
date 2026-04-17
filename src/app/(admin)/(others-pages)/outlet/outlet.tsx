"use client";

import { PulseLoading } from "@/components/common/loading";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import TableBasic from "@/components/tables/Table";
import Button from "@/components/ui/button/Button";
import { TableCell, TableRow } from "@/components/ui/table";
import { RootState } from "@/store";
import { OutletType } from "@/utility/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { clearToken } from "@/store/slices/authSlices";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { BiQr } from "react-icons/bi";
import { QRCodeCanvas } from "qrcode.react";


const Outlet: React.FC = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const auth = useSelector((state: RootState) => state.auth);

    const [tableData, setTableData] = useState<OutletType[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10);
    const [search, setSearch] = useState<string>("")
    const [searchButton, setSearchButton] = useState<boolean>(false)
    const [selectedOutlet, setSelectedOutlet] = useState<OutletType | null>(null)
    const qrContainerRef = useRef<HTMLDivElement>(null)
    const { isOpen, openModal, closeModal } = useModal();


    const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
            const fetchOutlet = async () => {
                try {
                    const response = await fetch(`${API_URL}/admin/outlet/get-all?search=${search}&page=${currentPage}&limit=10`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${auth.token}`,
                        },
                    });
                    const res = await response.json();

                    if (res.statusCode === 200) {
                        setTableData(res.data.outlets);
                        setTotalPages(res.data.totalPages);
                    }
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
                setIsLoading(false)
            };
            fetchOutlet();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, currentPage, searchButton]);

    const handlePaginationChange = (page: number) => {
        setIsLoading(true);
        setCurrentPage(page);
    };

    const handleOpenQrModal = (outlet: OutletType) => {
        setSelectedOutlet(outlet)
        openModal()
    }

    const handleCloseQrModal = () => {
        closeModal()
        setSelectedOutlet(null)
    }

    const handleDownloadQr = () => {
        if (!selectedOutlet) return

        const qrCanvas = qrContainerRef.current?.querySelector("canvas")
        if (!qrCanvas) {
            toast.warn("QR code belum siap untuk diunduh")
            return
        }

        const horizontalPadding = 40
        const sideMargin = 24
        const topPadding = 24
        const lineOneParts = `Depot ${selectedOutlet.name}`
            .split(" ")
            .reduce<string[][]>((acc, word, i) => {
                if (i % 2 === 0) {
                    acc.push([word])
                } else {
                    const currentLine = acc[acc.length - 1]
                    if (currentLine) {
                        currentLine.push(word)
                    }
                }
                return acc
            }, [])
            .map((line) => line.join(" "))
            .slice(0, 2)

        const exportCanvas = document.createElement("canvas")
        exportCanvas.width = qrCanvas.width + (horizontalPadding * 2)
        exportCanvas.height = qrCanvas.height + 190 + topPadding

        const ctx = exportCanvas.getContext("2d")
        if (!ctx) {
            toast.warn("Gagal membuat file download")
            return
        }

        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

        ctx.textAlign = "center"
        ctx.fillStyle = "#111827"
        ctx.font = "500 20px Arial"
        ctx.fillText(
            lineOneParts[0] || "",
            exportCanvas.width / 2,
            36 + topPadding,
            exportCanvas.width - (sideMargin * 2)
        )

        ctx.font = "700 28px Arial"
        ctx.fillText(
            lineOneParts[1] || "",
            exportCanvas.width / 2,
            72 + topPadding,
            exportCanvas.width - (sideMargin * 2)
        )

        ctx.drawImage(qrCanvas, (exportCanvas.width - qrCanvas.width) / 2, 118 + topPadding)

        const link = document.createElement("a")
        link.href = exportCanvas.toDataURL("image/png")
        link.download = `outlet-${selectedOutlet.id}-qrcode.png`
        link.click()
    }

    const syncOutletHandle = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/outlet/sync-outlet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.token}`,
                },
            });
            const res = await response.json();

            if (res.statusCode === 200) {
                toast.success("Outlets successfully syncronized")
            } else {
                toast.warn(`Outlets syncronizing failed!`)
            }
        } catch (error) {
            toast.warn(`Outlets syncronizing failed! with error: ${error}`)
            console.error("Error fetching vouchers:", error);
        }
        setRefresh(!refresh)

    }

    function camelCaseWithSpaces(str: string) {
        let result = '';
        let capitalizeNext = true;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            if (char === ' ') {
                result += char;
                capitalizeNext = true;
            } else {
                if (capitalizeNext) {
                    result += char.toUpperCase();
                    capitalizeNext = false;
                } else {
                    result += char.toLowerCase();
                }
            }
        }
        setSearch(result)
    }


    const header = ["No", "outlet", "phone", "address", "action"];

    return (
        isLoading ?
            <PulseLoading /> :
            <div
                className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
            >
                {/* Card Header */}
                <div className="px-6 py-5 space-y-5 md:space-y-0 md:flex justify-between">
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
                            placeholder="Search outlet"
                            value={search}
                            onChange={(e) => {
                                camelCaseWithSpaces(e.target.value)
                            }}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === "Enter") {
                                    setCurrentPage(1)
                                    setIsLoading(!isLoading);
                                    setSearchButton(!searchButton);
                                }
                            }}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                        />

                        <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                            type="submit"

                            onClick={() => {
                                setCurrentPage(1)
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
                        onClick={syncOutletHandle}>
                        Sync Outlet
                    </Button>
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
                                        {i.name}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {i.phone}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {i.address ? i.address : "-"}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <Button size="xs" onClick={() => {
                                            handleOpenQrModal(i)
                                        }} variant="primary"><BiQr /></Button>
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
                <Modal isOpen={isOpen} onClose={handleCloseQrModal} className="max-w-[700px] m-4">
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 text-center">
                            <h4 className="mb-2 text-[26px] font-semibold text-gray-800 dark:text-white/90">
                                QR Code Outlet
                            </h4>
                            <p className="text-[16px] text-gray-500 dark:text-gray-400">
                                {selectedOutlet
                                    ? `Depot ${selectedOutlet.name}`
                                    : "Outlet tidak ditemukan"}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center px-2">
                            {selectedOutlet && (
                                <div ref={qrContainerRef} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <QRCodeCanvas
                                        value={String(selectedOutlet.id)}
                                        size={240}
                                        level="H"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex justify-center px-2">
                            <Button size="sm" onClick={handleDownloadQr}>
                                Download QR Code
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
    );
};

export default Outlet;
