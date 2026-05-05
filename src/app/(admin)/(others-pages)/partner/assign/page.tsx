import { Metadata } from "next";
import AssignPartner from "./assign-partner";

export const metadata: Metadata = {
  title: "Assign Partner | Aerplus Admin",
};

export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <AssignPartner />
      </div>
    </div>
  );
}

