import { Metadata } from "next";
import Outlet from "./outlet";

export const metadata: Metadata = {
  title:
    "Outlets | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Outlet />
      </div>
    </div>
  );
}
