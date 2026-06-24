import { getCachedClientProjects } from "@/lib/notion/clientProjects";
import { REVENUE_CATEGORY_OPTIONS } from "@/lib/notion/constants";
import { getCachedPosts } from "@/lib/notion/posts";
import { getCachedRevenue } from "@/lib/notion/revenue";
import { getCachedTasks } from "@/lib/notion/tasks";
import { formatYen } from "@/lib/format";
import {
  RevenueChart,
  type MonthlyRevenuePoint,
} from "@/components/dashboard/RevenueChart";
import type { ClientProject, Revenue } from "@/types/notion";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthlyRevenueChartData(
  revenue: Revenue[],
  now: Date
): MonthlyRevenuePoint[] {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: `${d.getMonth() + 1}月` };
  });

  return months.map(({ year, month, label }) => {
    const point: MonthlyRevenuePoint = { month: label };
    for (const category of REVENUE_CATEGORY_OPTIONS) {
      point[category] = revenue
        .filter((r) => {
          if (!r.date || r.category !== category) return false;
          const d = new Date(r.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, r) => sum + (r.amount ?? 0), 0);
    }
    return point;
  });
}

function projectDeadlineAlert(deadline: string | null, todayStart: Date) {
  if (!deadline) {
    return { text: "継続中", className: "bg-gray-100 text-gray-500" };
  }
  const days = Math.ceil(
    (startOfDay(new Date(deadline)).getTime() - todayStart.getTime()) / 86_400_000
  );
  if (days < 0) return { text: "期限切れ", className: "bg-red-100 text-red-600" };
  if (days <= 3) return { text: `納期まで${days}日`, className: "bg-red-100 text-red-600" };
  if (days <= 7) return { text: `納期まで${days}日`, className: "bg-amber-100 text-amber-600" };
  return { text: `納期まで${days}日`, className: "bg-gray-100 text-gray-500" };
}

export default async function DashboardPage() {
  const [revenue, tasks, posts, clientProjects] = await Promise.all([
    getCachedRevenue(),
    getCachedTasks(),
    getCachedPosts(),
    getCachedClientProjects(),
  ]);

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthRevenue = revenue.filter(
    (r) => r.date && new Date(r.date) >= monthStart
  );
  const revenueByCategory = Object.fromEntries(
    REVENUE_CATEGORY_OPTIONS.map((category) => [
      category,
      thisMonthRevenue
        .filter((r) => r.category === category)
        .reduce((sum, r) => sum + (r.amount ?? 0), 0),
    ])
  );
  const totalRevenueThisMonth = Object.values(revenueByCategory).reduce(
    (a, b) => a + b,
    0
  );

  const chartData = buildMonthlyRevenueChartData(revenue, now);

  const incompleteTasks = tasks.filter((t) => t.status !== "完了");
  const overdueCount = incompleteTasks.filter(
    (t) => t.due && new Date(t.due) < todayStart
  ).length;
  const todayCount = incompleteTasks.filter(
    (t) => t.due && isSameDay(new Date(t.due), todayStart)
  ).length;
  const thisWeekCount = incompleteTasks.filter(
    (t) => t.due && new Date(t.due) >= todayStart && new Date(t.due) < weekEnd
  ).length;

  const upcomingPosts = posts
    .filter((p) => p.publishDate && new Date(p.publishDate) >= todayStart)
    .sort(
      (a, b) =>
        new Date(a.publishDate as string).getTime() -
        new Date(b.publishDate as string).getTime()
    )
    .slice(0, 5);

  const ongoingProjects: ClientProject[] = clientProjects
    .filter((p) => p.status === "進行中")
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          今月の収益サマリ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {REVENUE_CATEGORY_OPTIONS.map((category) => (
            <div
              key={category}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <p className="text-xs text-gray-400">{category}収益</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatYen(revenueByCategory[category])}
              </p>
            </div>
          ))}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5 sm:col-span-3">
            <p className="text-xs text-indigo-500">合計</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              {formatYen(totalRevenueThisMonth)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            月別収益（直近6ヶ月）
          </h2>
          <RevenueChart data={chartData} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            タスク件数
          </h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">今日</span>
            <span className="text-lg font-bold text-gray-800">
              {todayCount}件
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-sm text-red-500 font-medium">期限切れ</span>
            <span className="text-lg font-bold text-red-500">
              {overdueCount}件
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">今週</span>
            <span className="text-lg font-bold text-gray-800">
              {thisWeekCount}件
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            直近の公開予定投稿
          </h2>
          {upcomingPosts.length === 0 ? (
            <p className="text-sm text-gray-400">公開予定の投稿はありません</p>
          ) : (
            <ul className="space-y-3">
              {upcomingPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: post.accountColor }}
                  />
                  <span className="text-xs text-gray-400 w-24">
                    {post.publishDate &&
                      new Date(post.publishDate).toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        weekday: "short",
                      })}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">
                    {post.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            進行中のクライアント案件
          </h2>
          {ongoingProjects.length === 0 ? (
            <p className="text-sm text-gray-400">進行中の案件はありません</p>
          ) : (
            <ul className="space-y-3">
              {ongoingProjects.map((project) => {
                const alert = projectDeadlineAlert(project.deadline, todayStart);
                return (
                  <li
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{project.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${alert.className}`}
                    >
                      {alert.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
