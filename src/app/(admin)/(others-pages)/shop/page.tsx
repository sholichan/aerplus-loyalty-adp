import { Metadata } from "next";
import Shop from "./shop";

export const metadata: Metadata = {
  title: "Shop | Aerplus Admin",
};

export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Shop />
      </div>
    </div>
  );
}
