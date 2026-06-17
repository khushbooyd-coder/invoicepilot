"use client";

export default function GoogleWorkspaceCard() {
  const workspace = {
    users: 42,
    licenses: 38,
    storage: "312 GB",
    groups: 12,
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-6">
        Google Workspace
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span className="text-zinc-400">👥 Users</span>
          <span className="font-bold">{workspace.users}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">📄 Licenses</span>
          <span className="font-bold">{workspace.licenses}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">💾 Storage</span>
          <span className="font-bold">{workspace.storage}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">👨‍👩‍👧‍👦 Groups</span>
          <span className="font-bold">{workspace.groups}</span>
        </div>

      </div>

    </div>
  );
}