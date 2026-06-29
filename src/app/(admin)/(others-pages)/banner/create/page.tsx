import { Metadata } from "next";
import CreateBanner from "./create-banner";

export const metadata: Metadata = {
  title:
    "Create Banner | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        < CreateBanner/>
      </div>
    </div>
  );
}
