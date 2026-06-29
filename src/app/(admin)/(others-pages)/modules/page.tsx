import { Metadata } from "next";
import Modules from "./modules";

export const metadata: Metadata = {
    title: "Modules | Aerplus Admin",
};

export default function page() {
    return (
        <div className="space-y-6">
            <Modules />
        </div>
    );
}
