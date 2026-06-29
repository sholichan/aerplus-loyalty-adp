import { Metadata } from "next";
import Roles from "./roles";

export const metadata: Metadata = {
    title: "Roles | Aerplus Admin",
};

export default function page() {
    return (
        <div className="space-y-6">
            <Roles />
        </div>
    );
}
