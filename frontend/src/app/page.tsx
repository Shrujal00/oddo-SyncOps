import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-6 px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">SyncOps ERP</p>
        <h1 className="mt-3 text-4xl font-semibold">From Demand to Delivery</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Production-ready architecture scaffold for connected product, inventory, sales,
          purchase, manufacturing, procurement, audit, and dashboard workflows.
        </p>
      </div>
      <Link className="w-fit rounded-md bg-blue-600 px-4 py-2 text-white" href="/overview">
        Open dashboard shell
      </Link>
    </main>
  );
}
