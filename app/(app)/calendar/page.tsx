import { getCachedAccounts } from "@/lib/notion/accounts";
import { getCachedPosts } from "@/lib/notion/posts";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const [accounts, posts] = await Promise.all([
    getCachedAccounts(),
    getCachedPosts(),
  ]);

  return <CalendarView accounts={accounts} posts={posts} />;
}
