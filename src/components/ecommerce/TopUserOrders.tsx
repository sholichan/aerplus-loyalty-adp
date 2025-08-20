"use client"

import { useEffect, useState } from "react";
import TableBasic from "../tables/Table";
import {
  TableCell,
  TableRow
} from "../ui/table";
import { OrderType, Outlet } from "@/utility/types";
import { useOutlet } from "@/context/OutletContext";

export type TopUsertytpe = {
  id: string,
  user_name: string,
  phone_number: string,
  outlet: Outlet,
  orders: OrderType[],
  order_count: number
}

export default function TopUserOrders() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [tableData, setTableData] = useState<TopUsertytpe[]>([])
  const { selectedOutlet } = useOutlet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}admin/stats/top-user?outletId=${selectedOutlet}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setTableData(res.data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOutlet])

  const header = ["No", "Name", "phone", "outlet", "orders"];

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
    >
      {/* Card Header */}
      <div className="px-6 py-5">
        <h4 className="font-semibold dark:text-white">Top 5 Member</h4>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">
          {tableData.length >= 1 ? <TableBasic header={header}>
            {tableData?.map((i: TopUsertytpe, index: number) => (
              <TableRow key={i.id}>
                <TableCell className="py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {index + 1}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {i.user_name}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {i.phone_number}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {i.outlet ? i.outlet.name : "-"}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {i.order_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBasic> :
            <div className="w-full text-center text-gray-500">
              Top users not found
            </div>}
        </div>
      </div>
    </div>
  );
}
