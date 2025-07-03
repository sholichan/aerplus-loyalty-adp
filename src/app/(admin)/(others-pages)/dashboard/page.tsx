"use client"
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyOrderChart from "@/components/ecommerce/MonthlyOrderChart";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Dashboard() {
    const auth = useSelector((state: RootState) => state.auth);
    const router = useRouter()

    useEffect(() => {
        if (!auth.token) {
            router.push("/signin")
        }
    }, [auth.token, router])

    return (
        < div className="grid grid-cols-12 gap-4 md:gap-6" >

            <div className="col-span-12">
                <EcommerceMetrics />
            </div>

            <div className="col-span-12">
                <MonthlySalesChart />
            </div>

            <div className="col-span-12">
                <MonthlyOrderChart />
            </div>

            <div className="col-span-12">
                <RecentOrders />
            </div>

            {/* <div className="col-span-12">
        <StatisticsChart />
      </div> */}

            {/* <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div> */}

        </div >
    );
}
