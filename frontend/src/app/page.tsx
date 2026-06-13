import Link from "next/link";
import { BrandLogo } from "../components/brand/logo";
import {
  ClipboardCheck,
  Factory,
  FileClock,
  Gauge,
  GitBranch,
  Package,
  PackageCheck,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Warehouse,
} from "lucide-react";

const journey = [
  {
    label: "Sales demand",
    detail: "Customer order confirms demand",
    icon: ShoppingCart,
  },
  {
    label: "Stock check",
    detail: "Free-to-use quantity is computed",
    icon: Warehouse,
  },
  {
    label: "Procurement",
    detail: "Shortage creates supply automatically",
    icon: GitBranch,
  },
  {
    label: "Manufacturing",
    detail: "BoM consumes parts and produces goods",
    icon: Factory,
  },
  {
    label: "Delivery",
    detail: "Sale movement updates inventory",
    icon: PackageCheck,
  },
];

const modules = [
  { name: "Products", text: "Prices, stock rules, MTO/MTS, vendors, and BoM links.", icon: Package },
  { name: "Sales", text: "Draft, confirm, partial delivery, delivery, and cancellation controls.", icon: ShoppingCart },
  { name: "Purchases", text: "Vendor orders, confirmations, receipts, and purchase stock movements.", icon: PackageCheck },
  { name: "Manufacturing", text: "Manufacturing orders, work steps, production, and component consumption.", icon: Factory },
  { name: "Inventory", text: "Ledger-style movements instead of manual stock edits.", icon: Warehouse },
  { name: "Audit", text: "Every important business action leaves a trace.", icon: ScrollText },
];

const automation = [
  "Sales confirmation reserves demand and checks available stock.",
  "Shortage triggers procurement based on product strategy.",
  "Buy items create purchase flow; make items create manufacturing flow.",
  "Receiving, consumption, production, and delivery write inventory movements.",
  "Dashboard and audit logs update from the same backend records.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-text-1">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-10 w-[170px]" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-text-2 md:flex">
            <a href="#journey" className="hover:text-text-1">Journey</a>
            <a href="#automation" className="hover:text-text-1">Automation</a>
            <a href="#modules" className="hover:text-text-1">Modules</a>
            <a href="#demo" className="hover:text-text-1">Demo</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-text-2 hover:text-text-1 sm:inline">
              Sign in
            </Link>
            <Link href="/login" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
              Open ERP
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="mx-auto flex min-h-[680px] max-w-7xl flex-col items-center px-6 pb-14 pt-16 text-center">
          <div className="mb-5 rounded-full border border-border bg-elevated px-4 py-2 text-sm font-medium text-text-2 shadow-sm">
            Mini ERP for demand, procurement, production, stock, and audit
          </div>

          <h1 className="max-w-6xl text-5xl font-semibold leading-[1.06] tracking-normal text-text-1 md:text-7xl">
            Every order moves from demand to delivery on one platform.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-2">
            SyncOps replaces spreadsheet handoffs with a connected ERP flow. Sales deman
            d checks stock,
            procurement creates supply, manufacturing produces goods, inventory movements update stock,
            and audit logs prove what happened.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover">
              Start live demo
            </Link>
            <a href="http://localhost:4000/health" className="rounded-lg border border-border bg-elevated px-6 py-3 text-sm font-semibold text-text-1 shadow-sm hover:bg-surface">
              Check backend
            </a>
          </div>

          <div className="mt-12 w-full rounded-[28px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-5" id="journey">
              {journey.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="relative rounded-xl border border-border bg-elevated p-4 text-left shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-accent">
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-semibold text-text-3">0{index + 1}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-text-1">{step.label}</h2>
                    <p className="mt-1 text-xs leading-5 text-text-2">{step.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-border bg-bg p-4 text-left">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-1">
                  <Gauge size={17} className="text-accent" />
                  Live operating board
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["Sales", "Confirmed"],
                    ["Procurement", "Auto-created"],
                    ["Manufacturing", "In progress"],
                    ["Inventory", "Movement posted"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-border bg-elevated p-3">
                      <p className="text-xs text-text-3">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-text-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-bg p-4 text-left">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-1">
                  <FileClock size={17} className="text-accent" />
                  No manual stock edits
                </div>
                <p className="text-sm leading-6 text-text-2">
                  Stock changes come from business events: purchase receipt, component consumption,
                  finished production, and customer delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="automation" className="border-b border-border bg-elevated py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Automation first</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-text-1 md:text-4xl">
              The user enters the business event. The ERP handles the chain reaction.
            </h2>
            <p className="mt-4 text-base leading-7 text-text-2">
              A single sales order moves through procurement, manufacturing, inventory,
              delivery, dashboard updates, and audit history.
            </p>
          </div>

          <div className="grid gap-3">
            {automation.map((item, index) => (
              <div key={item} className="flex items-start gap-4 rounded-lg border border-border bg-bg p-4 shadow-sm">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-text-1">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="border-b border-border bg-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">Module coverage</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-text-1 md:text-4xl">
                One backend, connected ERP modules.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-text-2">
              Each module uses authenticated APIs and shared database records, so the demo shows
              real state changes instead of disconnected screens.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.name} className="rounded-xl border border-border bg-elevated p-5 shadow-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-accent">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-text-1">{module.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-2">{module.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="demo" className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-border bg-elevated p-6 shadow-sm md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-white">
                  <ClipboardCheck size={20} />
                </div>
                <h2 className="text-3xl font-semibold tracking-normal text-text-1">
                  Show the whole journey live.
                </h2>
                <p className="mt-4 text-sm leading-6 text-text-2">
                  Run the guided demo script from PowerShell. It pauses at each business step so the UI can
                  be refreshed and shown while the backend creates the real records.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-1">
                  <ShieldCheck size={17} className="text-accent" />
                  Demo command
                </div>
                <pre className="overflow-x-auto rounded-lg bg-[#1f1f1f] p-4 text-xs leading-6 text-white">
{`cd C:\\Users\\SG\\Desktop\\Code\\Projects\\Hack\\Hackathons\\oddo\\syncops
powershell -ExecutionPolicy Bypass -File .\\scripts\\demo.ps1`}
                </pre>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/login" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
                    Login to ERP
                  </Link>
                  <Link href="/overview" className="rounded-lg border border-border bg-elevated px-4 py-2 text-sm font-semibold text-text-1 hover:bg-surface">
                    Open dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
