import { Metadata } from "next";
import CreateRole from "./create-role";

export const metadata: Metadata = {
    title: "Create Role | Aerplus Admin",
};

export default function page() {
    return (
        <div className="space-y-6">
            <CreateRole />
        </div>
    );
}
