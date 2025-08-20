"use client"
import { PulseLoading } from "@/components/common/loading";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyOrderChart from "@/components/ecommerce/MonthlyOrderChart";
import TopUserOrders from "@/components/ecommerce/TopUserOrders";
import DatePicker from "@/components/form/date-picker";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const auth = useSelector((state: RootState) => state.auth);
    const router = useRouter()

    useEffect(() => {
        if (auth.user?.role.name !== "super admin") {
            router.push("/signin")
        } else {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.token, router])

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const formatDate = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
            ).padStart(2, "0")}`;

        setStartDate(formatDate(firstDay));
        setEndDate(formatDate(lastDay));
    }, [auth.token, router]);

    return (
        isLoading ?
            <PulseLoading /> :
            < div className="grid grid-cols-12 gap-4 md:gap-6" >
                <div className="col-span-12 rounded-2xl px-6 pt-10 pb-5 md:flex justify-between space-y-6 md:space-y-0 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="w-full md:flex md:space-x-6 space-y-6 md:space-y-0 space-x-0">

                        <div className="relative w-full">
                            <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500"
                            >
                                Start
                            </div>
                            <DatePicker
                                id="start_date"
                                placeholder="Start Date"
                                mode="single"
                                onChange={(selectedDates: Date[], dateStr: string) => {
                                    // setIsLoading(true)
                                    setStartDate(dateStr)
                                }}
                                defaultDate={new Date(startDate)}
                            />
                        </div>
                        <div className="relative w-full">
                            <div className="absolute left-2.5 -top-[10px] inline-flex -translate-y-1/2 items-center text-xs text-gray-500"
                            >
                                End
                            </div>
                            <DatePicker
                                id="end_date"
                                placeholder="End Date"
                                mode="single"
                                onChange={(selectedDates: Date[], dateStr: string) => {
                                    // setIsLoading(true)
                                    setEndDate(dateStr)
                                }}
                                defaultDate={endDate ? new Date(endDate) : undefined}
                                minDate={startDate ? new Date(startDate) : undefined}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-12">
                    <TopUserOrders />
                </div>

                <div className="col-span-12">
                    <EcommerceMetrics startDate={startDate} endDate={endDate} />
                </div>

                <div className="col-span-12">
                    <MonthlyOrderChart startDate={startDate} endDate={endDate} />
                </div>


                <div className="col-span-12">
                    {/* <StatisticsChart /> */}
                </div>

                {/* <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div> */}

            </div >
    );
}

