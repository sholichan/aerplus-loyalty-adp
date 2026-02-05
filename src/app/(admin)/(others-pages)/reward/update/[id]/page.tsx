import { Metadata } from "next";
import UpdateReward from "./update-reward";

export const metadata: Metadata = {
    title:
        "Update Reward | Aerplus Admin",
};
export default function page() {
    return (
        <div>
            <div className="space-y-6">
                <UpdateReward />
            </div>
        </div>
    );
}
