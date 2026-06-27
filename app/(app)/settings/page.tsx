import { getCachedAccountColorOptions, getCachedAccounts } from "@/lib/notion/accounts";
import { getCachedClientProjects } from "@/lib/notion/clientProjects";
import { getCachedTools } from "@/lib/notion/tools";
import { AccountsSection } from "@/components/settings/AccountsSection";
import { ClientProjectsSection } from "@/components/settings/ClientProjectsSection";
import { ToolsSection } from "@/components/settings/ToolsSection";

export default async function SettingsPage() {
  const [accounts, colorOptions, clientProjects, tools] = await Promise.all([
    getCachedAccounts(),
    getCachedAccountColorOptions(),
    getCachedClientProjects(),
    getCachedTools(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <AccountsSection accounts={accounts} colorOptions={colorOptions} tools={tools} />
      <ToolsSection tools={tools} />
      <ClientProjectsSection clientProjects={clientProjects} />
    </div>
  );
}
