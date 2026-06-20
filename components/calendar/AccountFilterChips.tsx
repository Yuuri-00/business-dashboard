import type { Account } from "@/types/notion";

interface AccountFilterChipsProps {
  accounts: Account[];
  selected: Set<string>;
  onToggle: (accountName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function AccountFilterChips({
  accounts,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: AccountFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {accounts.map((account) => {
        const isActive = selected.has(account.name);
        return (
          <button
            key={account.id}
            type="button"
            onClick={() => onToggle(account.name)}
            className={
              isActive
                ? "text-xs font-medium px-3 py-1.5 rounded-full text-white"
                : "text-xs font-medium px-3 py-1.5 rounded-full border-2 bg-white"
            }
            style={
              isActive
                ? { background: account.color }
                : { borderColor: account.color, color: account.color }
            }
          >
            ● {account.name}
          </button>
        );
      })}

      <span className="w-px h-5 bg-gray-200 mx-2" />
      <button
        type="button"
        onClick={onSelectAll}
        className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
      >
        全選択
      </button>
      <button
        type="button"
        onClick={onDeselectAll}
        className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
      >
        全解除
      </button>
    </div>
  );
}
