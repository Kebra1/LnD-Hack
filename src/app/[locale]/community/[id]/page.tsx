import { CommunityThread } from "@/features/community/community-screen";
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CommunityThread id={(await params).id} />;
}
