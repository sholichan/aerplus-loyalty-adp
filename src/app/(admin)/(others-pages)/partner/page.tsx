import { Metadata } from "next";
import Partner from "./partner";

export const metadata: Metadata = {
  title: "Partners | Aerplus Admin",
};

export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Partner />
      </div>
    </div>
  );
}
