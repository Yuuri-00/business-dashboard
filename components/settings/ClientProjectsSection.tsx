"use client";

import { useState, useTransition } from "react";
import {
  archiveClientProjectAction,
  createClientProjectAction,
  updateClientProjectAction,
} from "@/app/(app)/settings/actions";
import { CLIENT_PROJECT_STATUS_OPTIONS } from "@/lib/notion/constants";
import { formatYen } from "@/lib/format";
import type { ClientProject } from "@/types/notion";

interface ClientProjectFormProps {
  defaultValue?: ClientProject;
  onSubmit: (formData: FormData) => void;
  onCancel?: () => void;
  submitLabel: string;
  pending: boolean;
}

function ClientProjectForm({
  defaultValue,
  onSubmit,
  onCancel,
  submitLabel,
  pending,
}: ClientProjectFormProps) {
  return (
    <form action={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">案件名</label>
          <input
            name="name"
            type="text"
            defaultValue={defaultValue?.name}
            placeholder="例：D社 採用LP制作"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">クライアント名</label>
          <input
            name="clientName"
            type="text"
            defaultValue={defaultValue?.clientName}
            placeholder="例：D社"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">状態</label>
          <select
            name="status"
            defaultValue={defaultValue?.status ?? CLIENT_PROJECT_STATUS_OPTIONS[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          >
            {CLIENT_PROJECT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">納期</label>
          <input
            name="deadline"
            type="date"
            defaultValue={defaultValue?.deadline ?? undefined}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">金額</label>
          <input
            name="amount"
            type="number"
            defaultValue={defaultValue?.amount ?? undefined}
            placeholder="例：150000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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

export function ClientProjectsSection({
  clientProjects,
}: {
  clientProjects: ClientProject[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createClientProjectAction(formData);
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      await updateClientProjectAction(id, formData);
      setEditingId(null);
    });
  }

  function handleArchive(id: string) {
    if (!confirm("この案件を削除しますか？")) return;
    startTransition(async () => {
      await archiveClientProjectAction(id);
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">
        案件マスタ（クライアントワーク）
      </h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-400">
            <tr>
              <th className="text-left font-medium px-4 py-2">案件名</th>
              <th className="text-left font-medium px-4 py-2">クライアント名</th>
              <th className="text-left font-medium px-4 py-2">状態</th>
              <th className="text-left font-medium px-4 py-2">納期</th>
              <th className="text-left font-medium px-4 py-2">金額</th>
              <th className="text-left font-medium px-4 py-2 w-28">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientProjects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  案件が登録されていません
                </td>
              </tr>
            )}
            {clientProjects.map((project) =>
              editingId === project.id ? (
                <tr key={project.id}>
                  <td colSpan={6} className="px-4 py-4 bg-indigo-50">
                    <ClientProjectForm
                      defaultValue={project}
                      onSubmit={(formData) => handleUpdate(project.id, formData)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="保存"
                      pending={isPending}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={project.id}>
                  <td className="px-4 py-2.5 text-gray-800 font-medium">
                    {project.name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{project.clientName}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium">
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {project.deadline ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {project.amount != null ? formatYen(project.amount) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditingId(project.id)}
                      className="text-indigo-600 hover:underline mr-2"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchive(project.id)}
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
        <h3 className="text-xs font-semibold text-indigo-600 mb-4">+ 案件を追加</h3>
        <ClientProjectForm
          onSubmit={handleCreate}
          submitLabel="追加する"
          pending={isPending}
        />
      </div>
    </section>
  );
}
