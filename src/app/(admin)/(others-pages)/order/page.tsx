import { Metadata } from "next";
import Order from "./order";

export const metadata: Metadata = {
  title:
    "Orders | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Order />
      </div>
    </div>
  );
}
