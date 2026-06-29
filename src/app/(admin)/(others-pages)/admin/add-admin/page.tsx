import { Metadata } from "next";
import AddAdmin from "./add-admin";

export const metadata: Metadata = {
  title: "Add Admin | Aerplus Admin",
};

export default function Page() {
  return (
    <div>
      <div className="space-y-6">
        <AddAdmin />
      </div>
    </div>
  );
}