import { getCachedAccountColorOptions, getCachedAccounts } from "@/lib/notion/accounts";
import { getCachedClientProjects } from "@/lib/notion/clientProjects";
import { AccountsSection } from "@/components/settings/AccountsSection";
import { ClientProjectsSection } from "@/components/settings/ClientProjectsSection";

export default async function SettingsPage() {
  const [accounts, colorOptions, clientProjects] = await Promise.all([
    getCachedAccounts(),
    getCachedAccountColorOptions(),
    getCachedClientProjects(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <AccountsSection accounts={accounts} colorOptions={colorOptions} />
      <ClientProjectsSection clientProjects={clientProjects} />
    </div>
  );
}
