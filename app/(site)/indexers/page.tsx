import { getIndexers } from "@/lib/indexers";

export const metadata = {
  title: "Indexers - ZcashNames",
  description: "Community-run ZNS indexers for resolving .zcash names.",
};

export default async function IndexersPage() {
  const indexers = await getIndexers();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-heading">Indexers</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Community-run ZNS indexers. Point your client at any of these to resolve .zcash names.
          </p>
        </div>
        <span
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold opacity-50 cursor-not-allowed"
          style={{
            background: "var(--leaders-card-bg)",
            border: "1px solid var(--leaders-card-border)",
            color: "var(--fg)",
          }}
        >
          Submit an Indexer (coming soon)
        </span>
      </div>

      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: "var(--leaders-card-bg)",
          borderColor: "var(--leaders-card-border)",
        }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-fg-muted"
              style={{ borderColor: "var(--leaders-card-border)" }}
            >
              <th className="px-4 py-3 sm:px-6">Endpoint</th>
              <th className="px-4 py-3 sm:px-6">Network</th>
              <th className="px-4 py-3 sm:px-6">Submitted by</th>
              <th className="px-4 py-3 sm:px-6">Added</th>
            </tr>
          </thead>
          <tbody>
            {indexers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-fg-muted">
                  No indexers registered yet.
                </td>
              </tr>
            ) : (
              indexers.map((indexer) => (
                <tr
                  key={indexer.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "var(--leaders-card-border)" }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-fg-heading sm:px-6">
                    {indexer.url}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className="rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-fg-muted"
                      style={{ background: "var(--market-stats-segment-active-bg)" }}
                    >
                      {indexer.network}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-fg-muted sm:px-6">
                    {indexer.submitted_by}
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted sm:px-6">
                    {new Date(indexer.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
