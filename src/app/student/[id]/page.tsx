import { notFound } from "next/navigation";
import { getShared } from "@/lib/share-store";
import { StudentWorkspace } from "./StudentWorkspace";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getShared(id);
  if (!plan) notFound();
  return <StudentWorkspace plan={plan} shareId={id} />;
}
