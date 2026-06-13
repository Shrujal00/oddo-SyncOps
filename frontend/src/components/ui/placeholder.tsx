export function PlaceholderSurface({ title }: Readonly<{ title: string }>) {
  return <section className="rounded-md border p-4 text-sm text-slate-600">{title}</section>;
}
