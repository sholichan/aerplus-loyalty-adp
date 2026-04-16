import { Metadata } from "next";
import Refill from "./refill";

export const metadata: Metadata = {
  title: "Refill | Aerplus Admin",
};

export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Refill />
      </div>
    </div>
  );
}
