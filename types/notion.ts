import type {
  ACCOUNT_STATUS_OPTIONS,
  CLIENT_PROJECT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PLATFORM_OPTIONS,
  POST_STATUS_OPTIONS,
  REVENUE_CATEGORY_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/lib/notion/constants";

export type Platform = (typeof PLATFORM_OPTIONS)[number];
export type AccountStatus = (typeof ACCOUNT_STATUS_OPTIONS)[number];
export type PostStatus = (typeof POST_STATUS_OPTIONS)[number];
export type TaskPriority = (typeof TASK_PRIORITY_OPTIONS)[number];
export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number];
export type ClientProjectStatus = (typeof CLIENT_PROJECT_STATUS_OPTIONS)[number];
export type RevenueCategory = (typeof REVENUE_CATEGORY_OPTIONS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number];

export interface Account {
  id: string;
  name: string;
  platform: Platform | null;
  color: string; // 解決済みのCSS hex（Notion selectのcolor属性から変換）
  handle: string;
  status: AccountStatus | null;
  weeklyGoal: number | null;
  profileUrl: string | null;
  toolUrl: string | null;
  otherUrl: string | null;
}

export interface AccountInput {
  name: string;
  platform: Platform;
  color: string; // Notion側のselectオプション名（既存オプションを指定）
  handle: string;
  status: AccountStatus;
  weeklyGoal: number | null;
  profileUrl: string | null;
  toolUrl: string | null;
  otherUrl: string | null;
}

export interface Post {
  id: string;
  title: string;
  accountName: string | null; // カレンダー色分け用のselect値
  accountColor: string; // 解決済みのCSS hex（selectのcolor属性から変換）
  accountId: string | null; // 分析用のrelation（Accountsへ）
  status: PostStatus | null;
  publishDate: string | null; // ISO 8601
  url: string | null;
}

export interface PostInput {
  title: string;
  accountName: string; // Posts側のselectオプション名
  accountId: string; // Accountsへのrelation先ページID
  status: PostStatus;
  publishDate: string | null;
  url: string | null;
}

export interface Task {
  id: string;
  title: string;
  due: string | null; // ISO 8601
  priority: TaskPriority | null;
  status: TaskStatus | null;
  relatedPostId: string | null;
  relatedProjectId: string | null;
}

export interface TaskInput {
  title: string;
  due: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  relatedPostId: string | null;
  relatedProjectId: string | null;
}

export interface ClientProject {
  id: string;
  name: string;
  clientName: string;
  status: ClientProjectStatus | null;
  deadline: string | null; // ISO 8601
  amount: number | null;
}

export interface ClientProjectInput {
  name: string;
  clientName: string;
  status: ClientProjectStatus;
  deadline: string | null;
  amount: number | null;
}

export interface Revenue {
  id: string;
  date: string | null; // ISO 8601
  amount: number | null;
  category: RevenueCategory | null;
  paymentStatus: PaymentStatus | null;
  relatedPostId: string | null;
  relatedProjectId: string | null;
}

export interface RevenueInput {
  date: string;
  amount: number;
  category: RevenueCategory;
  paymentStatus: PaymentStatus;
  relatedPostId: string | null;
  relatedProjectId: string | null;
}
