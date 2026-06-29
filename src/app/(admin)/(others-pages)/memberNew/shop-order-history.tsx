"use client";

import dayjs from "dayjs";
import React, { useState } from "react";
import TableBasic from "@/components/tables/Table";
import { Modal } from "@/components/ui/modal";
import { TableCell, TableRow } from "@/components/ui/table";
import { useModal } from "@/hooks/useModal";
import { paymentLabel, paymentStyles, statusLabel, statusStyles } from "@/utility/enum";
import { ShopOrderType } from "@/utility/types";

interface UserShopOrderHistoryProps {
    shopOrders: ShopOrderType[];
}

export const UserShopOrderHistory: React.FC<UserShopOrderHistoryProps> = ({ shopOrders }) => {
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedData, setSelectedData] = useState<ShopOrderType | null>(null);

    const dateConvert = (isoString?: string | null) => {
        if (!isoString) return "-";
        return dayjs(isoString).format("YYYY-MM-DD");
    };

    const timeConvert = (isoString?: string | null) => {
        if (!isoString) return "-";
        return dayjs(isoString).format("HH:mm:ss");
    };

    const openDetail = (item: ShopOrderType) => {
        setSelectedData(item);
        openModal();
    };

    return (
        <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shop Order History
            </h4>
            {(shopOrders?.length > 0) && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {[
                                    "No",
                                    "Outlet Name",
                                    "Nomor Pesanan",
                                    "Metode Pembayaran",
                                    "Price/Point",
                                    "Status",
                                    "Tanggal Pesan",
                                    "Tanggal Pembayaran",
                                    "Tanggal Pengambilan",
                                    "Action",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {shopOrders.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={"hover:bg-gray-50 dark:hover:bg-gray-900"}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-400">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-400">
                                        {item.outlet_name || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.order_number || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStyles[item.payment_method] || "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {paymentLabel[item.payment_method] || item.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.payment_unit === "point"
                                            ? `${Number(item.price_or_point || 0).toLocaleString("id-ID")} Poin`
                                            : `Rp ${Number(item.price_or_point || 0).toLocaleString("id-ID")}`}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[item.status] || "bg-gray-100 text-gray-600"
                                            }`}>
                                            {statusLabel[item.status] || item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="rounded-sm">
                                            <span className="block text-theme-sm">{dateConvert(item.order_date)}</span>
                                            <span className="block text-theme-xs">{timeConvert(item.order_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="rounded-sm">
                                            <span className="block text-theme-sm">{dateConvert(item.payment_date)}</span>
                                            <span className="block text-theme-xs">{timeConvert(item.payment_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="rounded-sm">
                                            <span className="block text-theme-sm">{dateConvert(item.pickup_date)}</span>
                                            <span className="block text-theme-xs">{timeConvert(item.pickup_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        <button
                                            type="button"
                                            onClick={() => openDetail(item)}
                                            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {(shopOrders?.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No shop order history
                </div>
            )}

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[900px] m-4">
                <div className="flex max-h-[85vh] flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90">
                            Detail Shop - {selectedData?.order_number || "-"}
                        </h4>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm shrink-0">
                            <div><span className="text-gray-500">Outlet:</span> {selectedData?.outlet_name || "-"}</div>
                            <div>
                                <span className="text-gray-500">Metode Pembayaran:</span>{" "}
                                {paymentLabel[selectedData?.payment_method || ""] || selectedData?.payment_method || "-"}
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>{" "}
                                {statusLabel[selectedData?.status || ""] || selectedData?.status || "-"}
                            </div>
                            <div>
                                <span className="text-gray-500">Price/Point:</span>{" "}
                                {selectedData?.payment_unit === "point"
                                    ? `${Number(selectedData?.price_or_point || 0).toLocaleString("id-ID")} Poin`
                                    : `Rp ${Number(selectedData?.price_or_point || 0).toLocaleString("id-ID")}`}
                            </div>
                        </div>

                        <div className="mt-4 max-h-[60vh] overflow-auto custom-scrollbar">
                            <TableBasic header={["Product Name", "Qty", "Subtotal (Price/Point)"]} isSetMinW="none">
                                {(selectedData?.items || []).map((detailItem, index) => (
                                    <TableRow key={`${detailItem.product_name}-${index}`}>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {detailItem.product_name}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {detailItem.qty}
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {selectedData?.payment_unit === "point"
                                                ? `${Number(detailItem.subtotal_point || 0).toLocaleString("id-ID")} Poin`
                                                : `Rp ${Number(detailItem.subtotal_price || detailItem.subtotal || 0).toLocaleString("id-ID")}`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBasic>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
