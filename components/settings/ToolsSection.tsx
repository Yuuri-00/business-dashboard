"use client";

import { useState, useTransition } from "react";
import {
  archiveToolAction,
  createToolAction,
  updateToolAction,
} from "@/app/(app)/settings/actions";
import { PLATFORM_OPTIONS } from "@/lib/notion/constants";
import type { Tool } from "@/types/notion";

interface ToolFormProps {
  defaultValue?: Tool;
  onSubmit: (formData: FormData) => void;
  onCancel?: () => void;
  submitLabel: string;
  pending: boolean;
}

function ToolForm({
  defaultValue,
  onSubmit,
  onCancel,
  submitLabel,
  pending,
}: ToolFormProps) {
  const [platforms, setPlatforms] = useState<string[]>(defaultValue?.platforms ?? []);

  function togglePlatform(platform: string) {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  return (
    <form
      action={(formData) => {
        formData.set("platforms", platforms.join(","));
        onSubmit(formData);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">ツール名</label>
          <input
            name="name"
            type="text"
            defaultValue={defaultValue?.name}
            placeholder="例：wp-draft-tool"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">URL</label>
          <input
            name="url"
            type="url"
            defaultValue={defaultValue?.url ?? undefined}
            placeholder="https://...・/open"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            パラメータ名（アカウント特定用クエリパラメータのキー）
          </label>
          <input
            name="paramKey"
            type="text"
            defaultValue={defaultValue?.paramKey ?? undefined}
            placeholder="例：key"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 block mb-1.5">
            対応プラットフォーム（任意）
          </label>
          <div className="flex gap-3 flex-wrap">
            {PLATFORM_OPTIONS.map((p) => (
              <label key={p} className="flex items-center gap-1.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={platforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                />
                {p}
              </label>
            ))}
          </div>
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

export function ToolsSection({ tools }: { tools: Tool[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createToolAction(formData);
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      await updateToolAction(id, formData);
      setEditingId(null);
    });
  }

  function handleArchive(id: string) {
    if (!confirm("このツールを削除しますか？")) return;
    startTransition(async () => {
      await archiveToolAction(id);
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">ツール管理</h2>
        <span className="text-xs text-gray-400">
          アカウント管理の「使用ツール」欄から選択する連携先ツールをここで定義
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-400">
            <tr>
              <th className="text-left font-medium px-4 py-2">ツール名</th>
              <th className="text-left font-medium px-4 py-2">URL</th>
              <th className="text-left font-medium px-4 py-2">パラメータ名</th>
              <th className="text-left font-medium px-4 py-2">対応プラットフォーム</th>
              <th className="text-left font-medium px-4 py-2 w-28">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tools.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  ツールが登録されていません
                </td>
              </tr>
            )}
            {tools.map((tool) =>
              editingId === tool.id ? (
                <tr key={tool.id}>
                  <td colSpan={5} className="px-4 py-4 bg-indigo-50">
                    <ToolForm
                      defaultValue={tool}
                      onSubmit={(formData) => handleUpdate(tool.id, formData)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="保存"
                      pending={isPending}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={tool.id}>
                  <td className="px-4 py-2.5 text-gray-800 font-medium">{tool.name}</td>
                  <td className="px-4 py-2.5 text-gray-500 truncate max-w-xs">
                    {tool.url ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{tool.paramKey ?? "—"}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {tool.platforms.length > 0 ? tool.platforms.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditingId(tool.id)}
                      className="text-indigo-600 hover:underline mr-2"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchive(tool.id)}
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
        <h3 className="text-xs font-semibold text-indigo-600 mb-4">+ ツールを追加</h3>
        <ToolForm onSubmit={handleCreate} submitLabel="追加する" pending={isPending} />
      </div>
    </section>
  );
}
