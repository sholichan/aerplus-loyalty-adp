"use client";

import { useOutlet } from "@/context/OutletContext";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type Props = {
  startDate: string;
  endDate: string;
};

type RefillStatRow = {
  day: string;
  total_refill: string;
  total_orders: string;
};

export default function DailyRefillChart({ startDate, endDate }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { selectedOutlet } = useOutlet();
  const [rows, setRows] = useState<RefillStatRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_URL}admin/stats/daily-refill?outletId=${selectedOutlet}&startDate=${startDate}&endDate=${endDate}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const res = await response.json();
        if (res.statusCode === 200) {
          setRows(res.data || []);
        } else {
          setRows([]);
        }
      } catch (error) {
        console.error("Error fetching daily refill stats:", error);
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL, selectedOutlet, startDate, endDate]);

  const categories = useMemo(
    () =>
      rows.map((item) =>
        new Date(`${item.day}T00:00:00`).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        })
      ),
    [rows]
  );

  const refillSeries = useMemo(
    () => rows.map((item) => Number(item.total_refill || 0)),
    [rows]
  );

  const totalRefill = useMemo(
    () => refillSeries.reduce((sum, val) => sum + val, 0),
    [refillSeries]
  );

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      height: 350,
    },
    colors: ["#0ea5e9"],
    noData: {
      text: isLoading ? "Loading..." : "No refill data",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#888",
        fontSize: "14px",
        fontFamily: "Outfit, sans-serif",
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Total Refill" },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
    legend: { show: false },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Daily Refill Stats
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Refill: <span className="font-semibold text-gray-800 dark:text-white/90">{totalRefill}</span>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-4 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={[{ name: "Daily Refill", data: refillSeries }]}
            type="bar"
            height={360}
          />
        </div>
      </div>
    </div>
  );
}
