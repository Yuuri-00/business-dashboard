# 副業管理ツール 設計書

## 1. 概要

個人（自分専用）の副業管理Webアプリ。コンテンツ投稿（SNS/YouTube/ブログ等の複数アカウント運用）が主軸で、時々クライアントワーク（受託案件）が発生する働き方を前提に設計。

主要機能:
- ダッシュボード
- 投稿カレンダー（複数SNS/アカウントのまとめ表示・個別表示）
- 今日のTODO
- 収益管理

複数端末（PC・スマホ）からアクセスする想定のため、Googleログインによるアクセス制限を行う。

## 2. システム構成

```
[端末（PC/スマホ、複数）]
        ↕ HTTPS
[Next.js アプリ (Vercelにデプロイ)]
        ↕ Server Actions / Route Handler（APIキーはサーバー側のみ）
[Notion Workspace（データベース）]
   ├─ Accounts DB
   ├─ Posts DB
   ├─ Tasks DB
   ├─ ClientProjects DB
   └─ Revenue DB
```

- フロント・サーバーともにNext.js（App Router）で一体実装
- データの永続化はNotionを利用（Notion API経由）
- Notion APIキーやDB IDはサーバー側の環境変数として保持し、クライアントへは渡さない

## 3. 認証・アクセス制限

複数端末からアクセス可能にする＝アプリのURLが事実上インターネット上に公開されるため、Googleログインで本人のみに制限する。

- **NextAuth.js（Auth.js） + Google OAuth Provider** を使用
- ログイン処理自体はGoogleに委任（2段階認証等、Google側のセキュリティをそのまま活用）
- `callbacks.signIn` でログインしたメールアドレスが環境変数 `ALLOWED_EMAIL`（自分のGmail）と一致するかを検証し、不一致なら拒否
- セッションはJWT戦略（DBアダプタ不要）、Cookieは `httpOnly` / `secure` / `sameSite: lax`
- `proxy.ts`（Next.js 16、旧middleware.ts）で `/`, `/calendar`, `/todo`, `/revenue`, `/settings` を保護し、未ログイン時は `/login` にリダイレクト

### 認証関連の環境変数

| 変数名 | 用途 |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuthクライアント情報 |
| `NEXTAUTH_SECRET` | JWT/Cookie署名用ランダム文字列 |
| `NEXTAUTH_URL` | 本番URL（Vercel） |
| `ALLOWED_EMAIL` | ログインを許可する自分のGmailアドレス |

### データ関連の環境変数

| 変数名 | 用途 |
|---|---|
| `NOTION_API_KEY` | Notion Integration トークン |
| `NOTION_DB_ACCOUNTS` / `NOTION_DB_POSTS` / `NOTION_DB_TASKS` / `NOTION_DB_CLIENT_PROJECTS` / `NOTION_DB_REVENUE` | 各NotionデータベースのID |

## 4. データモデル（Notion DB構成）

### 4.1 全体のリレーション図

```
Accounts ──(relation)── Posts ──(relation)── Tasks
                          │                     │
                          └──(relation)── Revenue ──(relation)── ClientProjects
                                                                       │
                                                                    Tasks
```

### 4.2 各DBのプロパティ

**Accounts（複数SNS/アカウント管理用）**

| プロパティ | 型 | 内容 |
|---|---|---|
| アカウント名 | title | 表示名 |
| プラットフォーム | select | X / Instagram / YouTube / TikTok / ブログ・note 等 |
| カラー | select | カレンダー表示用の識別色 |
| ハンドル | text | アカウントID等 |
| 状態 | select | 運用中 / 休止中 |
| 週次投稿目標 | number | 投稿頻度の目標値（任意） |
| プロフィールURL | url | 実際のプロフィール・画面確認用リンク（任意） |
| ツールURL | url | 投稿作成ツールへのリンク（任意） |
| その他URL | url | その他参考リンク（任意） |

**Posts（投稿管理・カレンダー表示の元データ）**

| プロパティ | 型 | 内容 |
|---|---|---|
| タイトル | title | 投稿タイトル |
| アカウント | select（+ Accountsへのrelationを併用） | カレンダーの色分け表示に使用。Selectで色を直接持たせ、relationは分析用 |
| 状態 | select | 企画中 / 制作中 / 予約済み / 公開済み |
| 公開日時 | date | カレンダー表示の基準日 |
| URL | url | 公開後のリンク |

**Tasks（今日のTODO用）**

| プロパティ | 型 | 内容 |
|---|---|---|
| タイトル | title | タスク名 |
| 期限 | date | 期日 |
| 優先度 | select | 高 / 中 / 低 |
| 状態 | select | 未着手 / 進行中 / 完了 |
| 関連Post | relation（Posts） | 投稿作業に紐づくタスク |
| 関連案件 | relation（ClientProjects） | 受託案件に紐づくタスク |

**ClientProjects（受託案件管理）**

| プロパティ | 型 | 内容 |
|---|---|---|
| 案件名 | title | 案件タイトル |
| クライアント名 | text | 取引先 |
| 状態 | select | 提案中 / 進行中 / 納品済み / 請求済み |
| 納期 | date | デッドライン |
| 金額 | number | 受託金額 |

**Revenue（収益管理用）**

| プロパティ | 型 | 内容 |
|---|---|---|
| 日付 | date | 発生日 |
| 金額 | number | 金額 |
| カテゴリ | select | コンテンツ / 受託 / 物販 等 |
| 入金状態 | select | 未収 / 入金済み |
| 関連Post | relation（Posts） | コンテンツ収益の発生元 |
| 関連案件 | relation（ClientProjects） | 受託収益の発生元 |

補足: アカウント別の収益集計をしたい場合、Posts側に「アカウント名（rollup from Accounts）」を追加し、それをRevenue側でさらにrollupする二段構成にすると実現可能。

## 5. 画面構成

```
/login     → Googleログイン画面
/          → ダッシュボード
/calendar  → 投稿カレンダー
/todo      → 今日のTODO
/revenue   → 収益管理
/settings  → アカウント管理・投稿目標・案件マスタ編集
```

### 5.1 ダッシュボード（`/`）

- 今月の収益サマリ（コンテンツ収益 / 受託収益のカテゴリ別）
- 月別収益グラフ（直近6ヶ月）
- 今日・今週のタスク件数（期限切れは強調表示）
- 直近の公開予定投稿（アカウントカラーでタグ付け、3〜5件）
- 進行中のクライアント案件と納期アラート

### 5.2 投稿カレンダー（`/calendar`）

- 上部にアカウントのフィルターチップ（トグル式、複数選択可）
  - 複数選択 → 選択アカウントの投稿をまとめて1つのカレンダーに表示
  - 1つだけ選択 → そのアカウント専用の個別カレンダーになる
  - 全選択／全解除ボタン
- 色分けルール（二軸表現）
  - 色 = アカウント固定（Accountsで設定した色）
  - 状態 = アイコン/枠線（企画中=点線、予約済=時計アイコン、公開済=実線+チェック）
- 同日に複数投稿がある場合は色付きドットを並べ、多い場合は「+N件」表記で展開
- 月表示/週表示の切り替え
- （将来拡張）アカウントごとのレーン表示、投稿頻度の達成率バー

### 5.3 今日のTODO（`/todo`）

- 期限が「今日」「期限切れ」のタスクを最上部に表示
- クイック追加（タイトルのみで即追加）
- チェックで即完了状態に更新（楽観的UI更新）
- 関連する投稿/案件名をタグ表示

### 5.4 収益管理（`/revenue`）

- 期間フィルタ（月次/四半期/年次）× カテゴリフィルタ
- 一覧テーブル（日付・金額・カテゴリ・紐付け先・入金状態）
- 未収（入金待ち）合計の強調表示
- コンテンツ系 vs 受託系の比率グラフ
- 年間カテゴリ別合計のCSV出力（確定申告対応、任意）

## 6. 技術スタック

| 項目 | 採用技術 | 理由 |
|---|---|---|
| フレームワーク | Next.js（App Router）+ TypeScript | Server Actions/Route Handlerが標準装備でNotion API連携・認証導入がしやすい |
| 認証 | NextAuth.js（Auth.js）+ Google OAuth | 複数端末からの安全なアクセス制限を無料で実現 |
| データソース | Notion API（`@notionhq/client`） | 既存決定。リレーショナルなDB構造を流用 |
| UI | Tailwind CSS | 個人ツールとして開発速度優先 |
| グラフ | Recharts | 収益グラフ・進捗バー |
| カレンダーUI | 自作（Notion Calendar viewはアプリに直接埋め込めないためデータのみ取得し独自実装） | アカウントフィルター等の独自UIが必要なため |
| デプロイ | Vercel | Server Actions対応、HTTPS自動、個人利用に十分な無料枠 |

## 7. ディレクトリ構成（案）

```
app/
 ├─ login/page.tsx
 ├─ api/auth/[...nextauth]/route.ts
 └─ (app)/                    # 認証必須ルートグループ
     ├─ layout.tsx
     ├─ page.tsx               # ダッシュボード
     ├─ calendar/page.tsx
     ├─ todo/
     │   ├─ page.tsx
     │   └─ actions.ts         # Server Actions
     ├─ revenue/page.tsx
     └─ settings/
         ├─ page.tsx
         └─ actions.ts         # Server Actions
proxy.ts                       # 認証ガード（Next.js 16、旧middleware.ts）
lib/
 ├─ format.ts                  # 日付・金額等の表示整形ヘルパー
 └─ notion/
     ├─ client.ts              # Notionクライアント初期化
     ├─ utils.ts                # Notionページ⇔型のマッピング共通処理
     ├─ accounts.ts
     ├─ posts.ts
     ├─ tasks.ts
     ├─ clientProjects.ts
     ├─ revenue.ts
     └─ constants.ts           # プロパティ名等を一元管理
components/
 ├─ dashboard/                 # RevenueChart 等
 ├─ calendar/                  # アカウントフィルターチップ、月/週カレンダー本体
 ├─ nav/                       # ナビゲーションリンク
 ├─ todo/
 ├─ revenue/                   # RevenueView、RevenueRatioChart
 └─ settings/                  # Accounts/ClientProjects設定セクション
types/
 └─ notion.ts                  # アプリ内で使う整形済み型定義
```

## 8. 非機能要件

- **HTTPS**: Vercelデプロイにより自動対応
- **APIキー管理**: `NOTION_API_KEY`等はサーバー側のみで使用。`.env.local`は`.gitignore`済み、本番値はVercelの環境変数機能に登録
- **Notion APIレート制限対策**: 1秒あたり約3リクエストが目安。複数DB取得時は`Promise.all`で並列化しつつ、`unstable_cache`/`fetch revalidate`でキャッシュ（閲覧中心ページは長め、TODOのような書き込み頻度が高いページは短め）
- **書き込みの反映**: タスク完了・投稿ステータス変更等はServer Actionで即時Notion APIに反映し、楽観的UI更新で操作感を担保。書き込み後は`revalidatePath`でキャッシュ更新
- **障害時のフォールバック**: Notion API障害時はキャッシュ済みデータを表示しつつエラー表示
- **型の同期**: Notionのプロパティ名・select選択肢変更時の影響を抑えるため、プロパティ名は`lib/notion/constants.ts`で一元管理

## 9. 今後の拡張ポイント（任意・フェーズ2以降）

- 投稿カレンダーのアカウント別レーン表示
- アカウントごとの投稿頻度目標と達成率バー
- 確定申告向けの収益CSV出力
- 経費記録を追加して損益（収益−経費）を計算
