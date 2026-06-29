import { Metadata } from "next";
import UserOrderTable from "./member";

export const metadata: Metadata = {
  title:
    "Members | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <UserOrderTable />
      </div>
    </div>
  );
}
