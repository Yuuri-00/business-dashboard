import type { CSSProperties } from "react";
import type { Post } from "@/types/notion";

export function getPostBadgeStyle(post: Post): {
  className: string;
  style: CSSProperties;
  icon: string;
} {
  switch (post.status) {
    case "企画中":
      return {
        className: "border-2 border-dashed bg-white",
        style: { borderColor: post.accountColor, color: post.accountColor },
        icon: "",
      };
    case "制作中":
      return {
        className: "border-2 bg-white",
        style: { borderColor: post.accountColor, color: post.accountColor },
        icon: "",
      };
    case "公開済み":
      return {
        className: "text-white",
        style: { background: post.accountColor },
        icon: "✓ ",
      };
    default:
      // 予約済み・その他
      return {
        className: "text-white",
        style: { background: post.accountColor },
        icon: "🕒 ",
      };
  }
}
