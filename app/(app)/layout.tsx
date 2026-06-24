import { signOut } from "@/auth";
import { HeaderNav } from "@/components/nav/HeaderNav";

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
  const logoutSlot = (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit" className="text-gray-400 hover:text-gray-600">
        ログアウト
      </button>
    </form>
  );

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <HeaderNav navItems={NAV_ITEMS} logoutSlot={logoutSlot} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
