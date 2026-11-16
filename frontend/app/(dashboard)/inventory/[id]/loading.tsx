import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return <PageSkeleton label="Loading item" title="Item detail" blocks={3} />;
}
