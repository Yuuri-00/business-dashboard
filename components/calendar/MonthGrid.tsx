import type { Post } from "@/types/notion";
import { getPostBadgeStyle } from "./postBadge";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getMonthGridDays(year: number, month: number): Date[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  return Array.from(
    { length: totalCells },
    (_, i) => new Date(year, month, i - firstWeekday + 1)
  );
}

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  posts: Post[];
  onDayClick: (date: Date) => void;
  onPostClick: (post: Post) => void;
}

export function MonthGrid({ year, month, posts, onDayClick, onPostClick }: MonthGridProps) {
  const days = getMonthGridDays(year, month);
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
      <div className="min-w-[640px]">
      <div className="grid grid-cols-7 text-xs text-gray-400 border-b border-gray-100">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = day.getMonth() === month;
          const key = toDateKey(day);
          const dayPosts = inMonth ? postsByDay.get(key) ?? [] : [];
          const isToday = inMonth && key === todayKey;
          const isLastColumn = (i + 1) % 7 === 0;
          const isLastRow = i >= days.length - 7;

          return (
            <div
              key={key}
              onClick={() => inMonth && onDayClick(day)}
              className={[
                "h-24 p-1.5",
                isLastColumn ? "" : "border-r border-gray-100",
                isLastRow ? "" : "border-b border-gray-100",
                isToday ? "bg-indigo-50" : "",
                inMonth ? "cursor-pointer hover:bg-gray-50" : "",
              ].join(" ")}
            >
              {inMonth && (
                <>
                  <div
                    className={
                      isToday
                        ? "text-xs font-bold text-indigo-600 mb-1"
                        : "text-xs text-gray-400 mb-1"
                    }
                  >
                    {day.getDate()}
                  </div>
                  {dayPosts.length <= 2 ? (
                    <div className="space-y-0.5">
                      {dayPosts.map((post) => {
                        const badge = getPostBadgeStyle(post);
                        return (
                          <div
                            key={post.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPostClick(post);
                            }}
                            className={`flex items-center gap-1 text-[10px] rounded px-1 py-0.5 truncate cursor-pointer ${badge.className}`}
                            style={badge.style}
                          >
                            {badge.icon}
                            {post.title}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-1 mb-0.5">
                        {dayPosts.slice(0, 3).map((post) => (
                          <span
                            key={post.id}
                            className="w-2 h-2 rounded-full"
                            style={{ background: post.accountColor }}
                          />
                        ))}
                      </div>
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-gray-400">
                          +{dayPosts.length - 3}件
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
