import { signOut } from "@/auth";
import { NavLink } from "@/components/nav/NavLink";

// 認証必須かつNotionの最新データに依存するため、静的プリレンダリングの対象にしない
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/", label: "ダッシュボード" },
  { href: "/calendar", label: "投稿カレンダー" },
  { href: "/todo", label: "今日のTODO" },
  { href: "/revenue", label: "収益管理" },
  { href: "/settings", label: "設定" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6 text-sm">
          <span className="font-bold text-gray-800 mr-4">🗂️ 副業管理ツール</span>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="ml-auto"
          >
            <button type="submit" className="text-gray-400 hover:text-gray-600">
              ログアウト
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
