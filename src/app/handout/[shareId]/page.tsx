import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getShared } from "@/lib/share-store";
import { HandoutClient } from "./HandoutClient";

export default async function HandoutPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const plan = await getShared(shareId);
  if (!plan) notFound();

  // Build the full URL so the QR resolves correctly regardless of deployment.
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/student/${shareId}`;

  return <HandoutClient plan={plan} url={url} shareId={shareId} />;
}
