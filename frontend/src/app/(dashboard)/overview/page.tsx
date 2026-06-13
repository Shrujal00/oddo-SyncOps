export default function OverviewPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-1">Overview</h1>
        <p className="text-sm text-text-2 mt-0.5">Business at a glance</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["Sales Orders", "Pending Deliveries", "Manufacturing", "Low Stock"].map((label) => (
          <div key={label} className="bg-surface border border-[rgb(var(--border))] rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-2">{label}</p>
            <p className="text-2xl font-semibold text-text-1 mt-2">—</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-text-3">Live data wires in Phase 07.</p>
    </div>
  );
}
