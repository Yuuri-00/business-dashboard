import { getCachedAccounts } from "@/lib/notion/accounts";
import { getCachedClientProjects } from "@/lib/notion/clientProjects";
import { getCachedPosts } from "@/lib/notion/posts";
import { getCachedTasks } from "@/lib/notion/tasks";
import { QuickAddForm } from "@/components/todo/QuickAddForm";
import { TodoList, type TodoItem } from "@/components/todo/TodoList";

export default async function TodoPage() {
  const [tasks, posts, clientProjects, accounts] = await Promise.all([
    getCachedTasks(),
    getCachedPosts(),
    getCachedClientProjects(),
    getCachedAccounts(),
  ]);

  const items: TodoItem[] = tasks.map((task) => {
    if (task.relatedPostId) {
      const post = posts.find((p) => p.id === task.relatedPostId);
      if (post) {
        return { task, relatedLabel: post.title, relatedColor: post.accountColor };
      }
    }
    if (task.relatedProjectId) {
      const project = clientProjects.find((p) => p.id === task.relatedProjectId);
      if (project) {
        return { task, relatedLabel: project.name, relatedColor: null };
      }
    }
    if (task.relatedAccountId) {
      const account = accounts.find((a) => a.id === task.relatedAccountId);
      if (account) {
        return { task, relatedLabel: account.name, relatedColor: account.color };
      }
    }
    return { task, relatedLabel: null, relatedColor: null };
  });

  items.sort((a, b) => {
    if (!a.task.due && !b.task.due) return 0;
    if (!a.task.due) return 1;
    if (!b.task.due) return -1;
    return new Date(a.task.due).getTime() - new Date(b.task.due).getTime();
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <QuickAddForm posts={posts} clientProjects={clientProjects} accounts={accounts} />
      <TodoList
        items={items}
        posts={posts}
        clientProjects={clientProjects}
        accounts={accounts}
      />
    </div>
  );
}
