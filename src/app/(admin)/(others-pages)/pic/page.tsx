import { Metadata } from "next";
import Pic from "./pic";

export const metadata: Metadata = {
  title: "PIC | Aerplus Admin",
};

export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Pic />
      </div>
    </div>
  );
}
