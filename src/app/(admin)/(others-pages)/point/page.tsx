import ComponentCard from "@/components/common/ComponentCard";
import { Metadata } from "next";
import Point from "./point";

export const metadata: Metadata = {
  title:
    "Point | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Point Management">
          <Point />
        </ComponentCard>
      </div>
    </div>
  );
}
