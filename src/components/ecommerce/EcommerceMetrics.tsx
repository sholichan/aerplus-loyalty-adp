"use client";
import { useOutlet } from "@/context/OutletContext";
import { BoxIconLine, GroupIcon } from "@/icons";
import { SalesOrderType, TotalUserType } from "@/utility/types";
import { useEffect, useState } from "react";


type Props = {
  startDate: string;
  endDate: string;
};

export const EcommerceMetrics = ({ startDate, endDate }: Props) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [tableSales, setTableSales] = useState<SalesOrderType>({
    "total_sales": 0,
    "total_orders": 0
  })
  const [tableUsers, setTableUsers] = useState<TotalUserType>()
  const [tableNewUsers, setTablenewUsers] = useState<TotalUserType>()
  const { selectedOutlet } = useOutlet();


  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch(`${API_URL}admin/stats/sales-order?outletId=${selectedOutlet}&startDate=${startDate}&endDate=${endDate}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setTableSales(res.data);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    const fetchMember = async () => {
      try {
        const response = await fetch(`${API_URL}admin/stats/total-user?outletId=${selectedOutlet}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setTableUsers(res.data);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    const fetchNewMember = async () => {
      try {
        const response = await fetch(`${API_URL}admin/stats/new-user-7d?outletId=${selectedOutlet}&startDate=${startDate}&endDate=${endDate}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setTablenewUsers(res.data);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchNewMember()
    fetchSales();
    fetchMember()
  }, [selectedOutlet, startDate, endDate, API_URL])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-[24px] dark:text-white/90">
              {tableNewUsers?.total_user}
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              New Members
            </span>
          </div>
          {/* <Badge color="success">
            7 day
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-[24px] dark:text-white/90">
              {tableUsers?.total_user}
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Members
            </span>
          </div>
          {/* <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-[24px] dark:text-white/90">
              {tableSales?.total_orders}
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
          </div>

          {/* <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            9.05%
          </Badge> */}
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

    </div>
  );
};
