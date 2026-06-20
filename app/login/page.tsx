import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-2">🗂️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">副業管理ツール</h1>
        <p className="text-sm text-gray-500 mb-8">
          コンテンツ投稿・タスク・収益をまとめて管理
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.5 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.5 35.1 26.9 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.7 39.6 16.3 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.2 5.4-6 6.9l6.5 5.3C39.6 37 44 31.1 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              Googleでログイン
            </span>
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6">
          許可された1アカウントのみログイン可能です
        </p>
      </div>
    </div>
  );
}
