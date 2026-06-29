"use client";
import { useOutlet } from "@/context/OutletContext";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type SeriesType = {
  name: string;
  data: number[];
};

type Props = {
  startDate: string;
  endDate: string;
};

export default function OrderChart({ startDate, endDate }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [chartSeries, setChartSeries] = useState<SeriesType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily"); // 🔑 state mode
  const { selectedOutlet } = useOutlet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}admin/stats/order-stats?outletId=${selectedOutlet}&startDate=${startDate}&endDate=${endDate}&mode=${mode}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const res = await response.json();

        if (res.statusCode === 200) {
          const data = res.data;

          const labelKey = mode === "daily" ? "day" : mode === "weekly" ? "week" : "month";

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const labels = data.map((item: any) => {
            if (mode === "daily") {
              return new Date(item[labelKey]).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              });
            } else if (mode === "weekly") {
              return `W${item[labelKey].split("-")[1]} (${item[labelKey].split("-")[0]})`;
            } else {
              return new Date(`${item[labelKey]}-01`).toLocaleString("default", {
                month: "short",
              });
            }
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const values = data.map((item: any) => Number(item.total_orders));

          setCategories(labels);
          setChartSeries([{ name: "Orders", data: values }]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchData();
  }, [selectedOutlet, startDate, endDate, mode, API_URL]);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    noData: {
      text: "📈 No data found in this period",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#888",
        fontSize: "32px",
        fontFamily: "Outfit-Bold, sans-serif",
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "10%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    legend: { show: true, position: "top", horizontalAlign: "left", fontFamily: "Outfit" },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: true },
      y: { formatter: (val: number) => `${val}` },
    },
  };


  // --- Dropdown More
  const [isOpen, setIsOpen] = useState(false);
  function toggleDropdown() { setIsOpen(!isOpen); }

  // --- Dropdown Mode
  const [isModeOpen, setIsModeOpen] = useState(false);
  function toggleModeDropdown() { setIsModeOpen(!isModeOpen); }
  function closeModeDropdown() { setIsModeOpen(false); }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "daily" ? "Daily" : mode === "weekly" ? "Weekly" : "Monthly"} Order Stats
        </h3>

        <div className="flex items-center gap-3">
          {/* Mode Selector */}
          <div className="relative inline-block">
            <button
              onClick={toggleModeDropdown}
              className="px-3 py-1 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
            <Dropdown isOpen={isModeOpen} onClose={closeModeDropdown} className="w-32 p-2">
              {["daily", "weekly", "monthly"].map((m) => (
                <DropdownItem
                  key={m}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onItemClick={() => { setMode(m as any); closeModeDropdown(); }}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* More Options */}
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={chartSeries} type="bar" height={400} />
        </div>
      </div>
    </div>
  );
}
