import ComponentCard from "@/components/common/ComponentCard";
import { Metadata } from "next";
import Benefit from "./benefit";

export const metadata: Metadata = {
  title:
    "Benefit | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Benefit Management">
          <Benefit />
        </ComponentCard>
      </div>
    </div>
  );
}
