import { Metadata } from "next";
import UpdateBanner from "./update-banner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title:
    "Update Banner | Aerplus Admin",
};

export default async function UpdateBannerPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <UpdateBanner id={id} />
    </div>
  );
}
