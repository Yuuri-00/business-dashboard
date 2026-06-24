import type { Post } from "@/types/notion";
import { getPostBadgeStyle } from "./postBadge";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

interface WeekGridProps {
  weekStart: Date;
  posts: Post[];
}

export function WeekGrid({ weekStart, posts }: WeekGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayKey = toDateKey(new Date());

  const postsByDay = new Map<string, Post[]>();
  for (const post of posts) {
    if (!post.publishDate) continue;
    const key = toDateKey(new Date(post.publishDate));
    const list = postsByDay.get(key) ?? [];
    list.push(post);
    postsByDay.set(key, list);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] grid grid-cols-7">
      {days.map((day, i) => {
        const key = toDateKey(day);
        const dayPosts = postsByDay.get(key) ?? [];
        const isToday = key === todayKey;
        const isLastColumn = i === 6;

        return (
          <div
            key={key}
            className={[
              "min-h-80 p-2",
              isLastColumn ? "" : "border-r border-gray-100",
              isToday ? "bg-indigo-50" : "",
            ].join(" ")}
          >
            <div className="text-center mb-2">
              <div className="text-[10px] text-gray-400">
                {WEEKDAY_LABELS[day.getDay()]}
              </div>
              <div
                className={
                  isToday
                    ? "text-sm font-bold text-indigo-600"
                    : "text-sm text-gray-600"
                }
              >
                {day.getDate()}
              </div>
            </div>
            <div className="space-y-1">
              {dayPosts.map((post) => {
                const badge = getPostBadgeStyle(post);
                return (
                  <div
                    key={post.id}
                    className={`flex items-center gap-1 text-[10px] rounded px-1.5 py-1 ${badge.className}`}
                    style={badge.style}
                  >
                    {badge.icon}
                    <span className="truncate">{post.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
