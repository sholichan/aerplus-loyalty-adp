import { Metadata } from "next";
import Member from "./member";

export const metadata: Metadata = {
  title:
    "Members | Aerplus Admin",
};
export default function page() {
  return (
    <div>
      <div className="space-y-6">
        <Member />
      </div>
    </div>
  );
}
