"use client";

import { useState, useTransition } from "react";
import {
  archiveAccountAction,
  createAccountAction,
  updateAccountAction,
} from "@/app/(app)/settings/actions";
import { ACCOUNT_STATUS_OPTIONS, PLATFORM_OPTIONS } from "@/lib/notion/constants";
import type { ColorOption } from "@/lib/notion/accounts";
import type { Account } from "@/types/notion";

interface AccountFormProps {
  defaultValue?: Account;
  colorOptions: ColorOption[];
  onSubmit: (formData: FormData) => void;
  onCancel?: () => void;
  submitLabel: string;
  pending: boolean;
}

function AccountForm({
  defaultValue,
  colorOptions,
  onSubmit,
  onCancel,
  submitLabel,
  pending,
}: AccountFormProps) {
  const [colorName, setColorName] = useState(
    colorOptions.find((o) => o.color === defaultValue?.color)?.name ??
      colorOptions[0]?.name ??
      ""
  );

  return (
    <form
      action={(formData) => {
        formData.set("color", colorName);
        onSubmit(formData);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            アカウント名（表示名）
          </label>
          <input
            name="name"
            type="text"
            defaultValue={defaultValue?.name}
            placeholder="例：サブX"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">プラットフォーム</label>
          <select
            name="platform"
            defaultValue={defaultValue?.platform ?? PLATFORM_OPTIONS[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">ハンドル</label>
          <input
            name="handle"
            type="text"
            defaultValue={defaultValue?.handle}
            placeholder="@handle"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            週次投稿目標（任意）
          </label>
          <input
            name="weeklyGoal"
            type="number"
            defaultValue={defaultValue?.weeklyGoal ?? undefined}
            placeholder="例：3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 block mb-1.5">
            カラー（カレンダー表示色）
          </label>
          {colorOptions.length === 0 ? (
            <p className="text-xs text-gray-400">
              Notion側の「カラー」プロパティにオプションがありません。Notionで先に追加してください。
            </p>
          ) : (
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setColorName(option.name)}
                  title={option.name}
                  className={
                    option.name === colorName
                      ? "w-7 h-7 rounded-full ring-2 ring-offset-2 ring-indigo-400"
                      : "w-7 h-7 rounded-full"
                  }
                  style={{ background: option.color }}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">状態</label>
          <select
            name="status"
            defaultValue={defaultValue?.status ?? ACCOUNT_STATUS_OPTIONS[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          >
            {ACCOUNT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            プロフィールURL（任意）
          </label>
          <input
            name="profileUrl"
            type="url"
            defaultValue={defaultValue?.profileUrl ?? undefined}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            ツールURL（任意）
          </label>
          <input
            name="toolUrl"
            type="url"
            defaultValue={defaultValue?.toolUrl ?? undefined}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            その他URL（任意）
          </label>
          <input
            name="otherUrl"
            type="url"
            defaultValue={defaultValue?.otherUrl ?? undefined}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function AccountsSection({
  accounts,
  colorOptions,
}: {
  accounts: Account[];
  colorOptions: ColorOption[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createAccountAction(formData);
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      await updateAccountAction(id, formData);
      setEditingId(null);
    });
  }

  function handleArchive(id: string) {
    if (!confirm("このアカウントを削除しますか？")) return;
    startTransition(async () => {
      await archiveAccountAction(id);
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">アカウント管理</h2>
        <span className="text-xs text-gray-400">
          投稿カレンダーの色分け・週次投稿目標もここで設定
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-400">
            <tr>
              <th className="text-left font-medium px-4 py-2 w-10" />
              <th className="text-left font-medium px-4 py-2">アカウント名</th>
              <th className="text-left font-medium px-4 py-2">プラットフォーム</th>
              <th className="text-left font-medium px-4 py-2">ハンドル</th>
              <th className="text-left font-medium px-4 py-2">週次投稿目標</th>
              <th className="text-left font-medium px-4 py-2">状態</th>
              <th className="text-left font-medium px-4 py-2">リンク</th>
              <th className="text-left font-medium px-4 py-2 w-28">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  アカウントが登録されていません
                </td>
              </tr>
            )}
            {accounts.map((account) =>
              editingId === account.id ? (
                <tr key={account.id}>
                  <td colSpan={8} className="px-4 py-4 bg-indigo-50">
                    <AccountForm
                      defaultValue={account}
                      colorOptions={colorOptions}
                      onSubmit={(formData) => handleUpdate(account.id, formData)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="保存"
                      pending={isPending}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={account.id}>
                  <td className="px-4 py-2.5">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ background: account.color }}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-gray-800 font-medium">
                    {account.name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{account.platform}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {account.handle || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {account.weeklyGoal != null ? `${account.weeklyGoal}件/週` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={
                        account.status === "運用中"
                          ? "text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-600 font-medium"
                          : "text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium"
                      }
                    >
                      {account.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs space-x-2">
                    {account.profileUrl && (
                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        プロフィール
                      </a>
                    )}
                    {account.toolUrl && (
                      <a
                        href={account.toolUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        ツール
                      </a>
                    )}
                    {account.otherUrl && (
                      <a
                        href={account.otherUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        その他
                      </a>
                    )}
                    {!account.profileUrl && !account.toolUrl && !account.otherUrl && (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditingId(account.id)}
                      className="text-indigo-600 hover:underline mr-2"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchive(account.id)}
                      className="text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-indigo-200 p-5">
        <h3 className="text-xs font-semibold text-indigo-600 mb-4">
          + アカウントを追加
        </h3>
        <AccountForm
          colorOptions={colorOptions}
          onSubmit={handleCreate}
          submitLabel="追加する"
          pending={isPending}
        />
      </div>
    </section>
  );
}
