import { Metadata } from "next";
import CreateReward from "./create-reward";

export const metadata: Metadata = {
    title:
        "Create Reward | Aerplus Admin",
};
export default function page() {
    return (
        <div>
            <div className="space-y-6">
                <CreateReward />
            </div>
        </div>
    );
}
