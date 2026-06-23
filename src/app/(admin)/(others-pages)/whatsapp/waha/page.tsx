import { Metadata } from "next";
import WahaSessionPage from "./waha";
import ComponentCard from "@/components/common/ComponentCard";

export const metadata: Metadata = {
    title: "WAHA | Aerplus Admin",
    description:
        "WAHA WhatsApp session management page for Aerplus Admin Dashboard",
};

export default function page() {
    return (
        <div>
            <div className="space-y-6">
                <ComponentCard title="WAHA Session Management">
                    <WahaSessionPage />
                </ComponentCard>
            </div>
        </div>
    );
}
