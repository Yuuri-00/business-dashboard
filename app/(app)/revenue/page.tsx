import { getCachedClientProjects } from "@/lib/notion/clientProjects";
import { getCachedPosts } from "@/lib/notion/posts";
import { getCachedRevenue } from "@/lib/notion/revenue";
import { RevenueView, type RevenueRecordItem } from "@/components/revenue/RevenueView";

export default async function RevenuePage() {
  const [revenue, posts, clientProjects] = await Promise.all([
    getCachedRevenue(),
    getCachedPosts(),
    getCachedClientProjects(),
  ]);

  const records: RevenueRecordItem[] = revenue.map((r) => {
    if (r.relatedPostId) {
      const post = posts.find((p) => p.id === r.relatedPostId);
      if (post) return { revenue: r, linkedLabel: post.title };
    }
    if (r.relatedProjectId) {
      const project = clientProjects.find((p) => p.id === r.relatedProjectId);
      if (project) return { revenue: r, linkedLabel: project.name };
    }
    return { revenue: r, linkedLabel: null };
  });

  return <RevenueView records={records} />;
}
