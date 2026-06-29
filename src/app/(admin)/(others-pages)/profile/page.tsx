import ComponentCard from "@/components/common/ComponentCard";
import { Metadata } from "next";
import Profile from "./profile";

export const metadata: Metadata = {
  title:
    "Point | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Profile">
          <Profile />
        </ComponentCard>
      </div>
    </div>
  );
}
