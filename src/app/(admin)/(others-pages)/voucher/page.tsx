import { Metadata } from "next";
import Voucher from "./voucher";

export const metadata: Metadata = {
  title: "Next.js Voucher | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Voucher page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Voucher />
      </div>
    </div>
  );
}
