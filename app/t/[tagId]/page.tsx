import { TagLanding } from "./TagLanding";

export default function TagPage({ params }: { params: { tagId: string } }) {
  return <TagLanding tagId={decodeURIComponent(params.tagId).toLowerCase()} />;
}
