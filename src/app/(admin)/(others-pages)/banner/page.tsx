import { Metadata } from "next";
import Banner from "./banner";

export const metadata: Metadata = {
  title:
    "Banners | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        < Banner/>
      </div>
    </div>
  );
}
