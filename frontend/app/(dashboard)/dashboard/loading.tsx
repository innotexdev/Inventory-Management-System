import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return <PageSkeleton label="Loading dashboard" title="Dashboard" blocks={2} />;
}
