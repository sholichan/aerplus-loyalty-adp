import { Metadata } from "next";
import EditRole from "./edit-role";

export const metadata: Metadata = {
    title: "Edit Role | Aerplus Admin",
};

export default function page() {
    return (
        <div className="space-y-6">
            <EditRole />
        </div>
    );
}
