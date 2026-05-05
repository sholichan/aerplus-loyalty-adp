import { Metadata } from "next";
import Spv from "./spv";

export const metadata: Metadata = {
  title: "SPV | Aerplus Admin",
};

export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Spv />
      </div>
    </div>
  );
}
