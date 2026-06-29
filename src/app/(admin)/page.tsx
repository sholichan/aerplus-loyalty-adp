import type { Metadata } from "next";
import Dashboard from "./(others-pages)/dashboard/page";

export const metadata: Metadata = {
  title:
    "Dashboard | Aerplus Admin",
};

export default function Ecommerce() {

  return (
    < div>
      <Dashboard />
    </div >
  );
}
