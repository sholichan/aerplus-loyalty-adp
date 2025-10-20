import { Metadata } from "next";
import Whatsapp from "./whatsapp";
import ComponentCard from "@/components/common/ComponentCard";

export const metadata: Metadata = {
    title: "Next.js Whatsapp | TailAdmin - Next.js Dashboard Template",
    description:
        "This is Next.js Whatsapp page for TailAdmin  Tailwind CSS Admin Dashboard Template",
    // other metadata
};
export default function page() {
    return (
        <div>
            <div className="space-y-6">
                <ComponentCard title="WhatsApp Session Management">
                    <Whatsapp />
                </ComponentCard>
            </div>
        </div>
    );
}
