import { Metadata } from "next";
import Admin from "./admin";

export const metadata: Metadata = {
  title:
    "Admin | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Admin />
      </div>
    </div>
  );
}
