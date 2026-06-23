export const NOTION_DB_ID = {
  accounts: process.env.NOTION_DB_ACCOUNTS!,
  posts: process.env.NOTION_DB_POSTS!,
  tasks: process.env.NOTION_DB_TASKS!,
  clientProjects: process.env.NOTION_DB_CLIENT_PROJECTS!,
  revenue: process.env.NOTION_DB_REVENUE!,
} as const;

// プロパティ名は実際のNotionワークスペースのスキーマに合わせて調整する
export const ACCOUNTS_PROPERTIES = {
  name: "アカウント名",
  platform: "プラットフォーム",
  color: "カラー",
  handle: "ハンドル",
  status: "状態",
  weeklyGoal: "週次投稿目標",
  profileUrl: "プロフィールURL",
  toolUrl: "ツールURL",
  otherUrl: "その他URL",
} as const;

export const PLATFORM_OPTIONS = [
  "X",
  "Instagram",
  "YouTube",
  "TikTok",
  "ブログ・note",
] as const;

export const ACCOUNT_STATUS_OPTIONS = ["運用中", "休止中"] as const;

export const POSTS_PROPERTIES = {
  title: "タイトル",
  accountSelect: "アカウント（色）", // カレンダー色分け用のselect
  accountRelation: "アカウント", // 分析・rollup用のrelation（Accountsへ）
  status: "状態",
  publishDate: "公開日時",
  url: "URL",
} as const;

export const POST_STATUS_OPTIONS = [
  "企画中",
  "制作中",
  "予約済み",
  "公開済み",
] as const;

export const TASKS_PROPERTIES = {
  title: "タイトル",
  due: "期限",
  priority: "優先度",
  status: "状態",
  relatedPost: "関連Post",
  relatedProject: "関連案件",
} as const;

export const TASK_PRIORITY_OPTIONS = ["高", "中", "低"] as const;
export const TASK_STATUS_OPTIONS = ["未着手", "進行中", "完了"] as const;

export const CLIENT_PROJECTS_PROPERTIES = {
  name: "案件名",
  clientName: "クライアント名",
  status: "状態",
  deadline: "納期",
  amount: "金額",
} as const;

export const CLIENT_PROJECT_STATUS_OPTIONS = [
  "提案中",
  "進行中",
  "納品済み",
  "請求済み",
] as const;

export const REVENUE_PROPERTIES = {
  date: "日付",
  amount: "金額",
  category: "カテゴリ",
  paymentStatus: "入金状態",
  relatedPost: "関連Post",
  relatedProject: "関連案件",
} as const;

export const REVENUE_CATEGORY_OPTIONS = ["コンテンツ", "受託", "物販"] as const;
export const PAYMENT_STATUS_OPTIONS = ["未収", "入金済み"] as const;

// Notion select/multi-selectのcolorは固定パレットなので、実際のCSS色への変換はここで一元管理する
export const NOTION_SELECT_COLOR_HEX: Record<string, string> = {
  default: "#9CA3AF",
  gray: "#9CA3AF",
  brown: "#92400E",
  orange: "#F97316",
  yellow: "#EAB308",
  green: "#16A34A",
  blue: "#2563EB",
  purple: "#7C3AED",
  pink: "#DB2777",
  red: "#DC2626",
};
