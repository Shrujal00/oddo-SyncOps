"use client";

interface Props {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onChange }: Props) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const firstPage = Math.max(1, Math.min(pages - 4, page - 2));

  return (
    <div className="flex items-center justify-between border-t border-border bg-bg px-4 py-3 text-sm">
      <span className="text-text-3">
        {start}-{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-border px-3 py-1.5 text-text-2 hover:bg-surface disabled:opacity-40"
        >
          Prev
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const p = firstPage + i;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`rounded-lg border px-3 py-1.5 ${
                p === page ? "border-accent bg-accent text-white" : "border-border text-text-2 hover:bg-surface"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="rounded-lg border border-border px-3 py-1.5 text-text-2 hover:bg-surface disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
