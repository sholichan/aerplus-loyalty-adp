import ComponentCard from "@/components/common/ComponentCard";
import { Metadata } from "next";
import Prifile from "./profile";

export const metadata: Metadata = {
  title:
    "Point | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Profile">
          <Prifile />
        </ComponentCard>
      </div>
    </div>
  );
}
