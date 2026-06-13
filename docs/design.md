# SyncOps Design System

Light theme. Odoo-inspired color palette. Clean, data-dense, minimal chrome.

## Excalidraw Alignment Notes

The mockup is fully matched by current schema and module structure.
No schema changes needed. UI must use dark forced mode (not toggle).

---

## Color Tokens (CSS variables in globals.css)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F8F7F5` | Page bg tint, input backgrounds |
| `--elevated` | `#FFFFFF` | Cards, sidebar, modals |
| `--border` | `#E5E7EB` | Dividers, input borders |
| `--muted` | `#D1D5DB` | Disabled, skeleton |
| `--text-1` | `#1F1F1F` | Primary text |
| `--text-2` | `#6B7280` | Secondary / labels |
| `--text-3` | `#9CA3AF` | Placeholder, hint |
| `--accent` | `#714B67` | Odoo plum — CTA buttons, active nav |
| `--accent-hover` | `#5A3A52` | Darker plum, hover state |
| `--accent-light` | `#F3EEF2` | Tinted bg for active nav item |

## Status Badge Colors

| Status | Background | Text |
|---|---|---|
| DRAFT | `#1F1F1F` | `#A3A3A3` |
| CONFIRMED | `#1E3A8A` | `#93C5FD` |
| IN_PROGRESS / PARTIALLY_* | `#78350F` | `#FCD34D` |
| COMPLETED / DELIVERED / RECEIVED | `#14532D` | `#86EFAC` |
| CANCELLED | `#7F1D1D` | `#FCA5A5` |

## Typography

- **Font:** Inter (system fallback: sans-serif)
- **Body:** `text-sm` (14px), `text-[--text-1]`
- **Table cell:** `text-sm`
- **Label:** `text-xs font-medium uppercase tracking-wide text-[--text-2]`
- **Heading (page):** `text-lg font-semibold text-[--text-1]`
- **Heading (section):** `text-sm font-semibold text-[--text-1]`

## Layout

```
┌──────────────────────────────────────┐
│  Sidebar (240px, bg-surface)         │  ← fixed, full height
│  ┌──────┐                            │
│  │ Logo │ SyncOps                    │
│  └──────┘                            │
│  Nav items                           │
│  ─────────────────────────────────   │
│  User info + logout                  │
├──────────────────────────────────────┤
│  Main content (flex-1, bg-bg)        │
│  ┌────────────────────────────────┐  │
│  │ Page header: title + actions   │  │
│  ├────────────────────────────────┤  │
│  │ Content (table / form / cards) │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Components

### Button
```
Primary:   bg-accent hover:bg-accent-hover text-white rounded-md px-3 py-1.5 text-sm font-medium
Secondary: bg-elevated border border-[--border] text-[--text-1] rounded-md px-3 py-1.5 text-sm
Danger:    bg-red-900/40 text-red-300 border border-red-800 rounded-md px-3 py-1.5 text-sm
Ghost:     text-[--text-2] hover:text-[--text-1] hover:bg-elevated rounded-md px-3 py-1.5 text-sm
```

### Input
```
bg-elevated border border-[--border] rounded-md px-3 py-2 text-sm text-[--text-1]
placeholder:text-[--text-3]
focus:outline-none focus:border-accent
```

### Table
- No outer border
- `border-b border-[--border]` on each row
- Header: `text-xs font-medium uppercase tracking-wide text-[--text-2] bg-surface`
- Row hover: `hover:bg-elevated`
- No zebra striping

### Status Badge
```tsx
// Use statusBadge() utility — returns className string
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    DRAFT:              "bg-[#1F1F1F] text-[#A3A3A3]",
    CONFIRMED:          "bg-[#1E3A8A] text-[#93C5FD]",
    IN_PROGRESS:        "bg-[#78350F] text-[#FCD34D]",
    PARTIALLY_DELIVERED:"bg-[#78350F] text-[#FCD34D]",
    PARTIALLY_RECEIVED: "bg-[#78350F] text-[#FCD34D]",
    COMPLETED:          "bg-[#14532D] text-[#86EFAC]",
    DELIVERED:          "bg-[#14532D] text-[#86EFAC]",
    RECEIVED:           "bg-[#14532D] text-[#86EFAC]",
    CANCELLED:          "bg-[#7F1D1D] text-[#FCA5A5]",
    PLANNED:            "bg-[#1F1F1F] text-[#A3A3A3]",
    RELEASED:           "bg-[#1E3A8A] text-[#93C5FD]",
  };
  return `inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-[#1F1F1F] text-[#A3A3A3]"}`;
};
```

### Card
```
bg-surface rounded-xl border border-[--border] p-4
```

### Sidebar Nav Item
```
Active:   bg-accent/10 text-accent rounded-md
Inactive: text-[--text-2] hover:text-[--text-1] hover:bg-elevated rounded-md
Both:     flex items-center gap-2.5 px-3 py-2 text-sm font-medium
```

## Login Page
- Centered on full screen (`min-h-screen flex items-center justify-center bg-[--bg]`)
- Card: `w-[360px] bg-surface border border-[--border] rounded-2xl p-8`
- Logo + "SyncOps" at top center
- Subtitle: "From Demand to Delivery" in `text-[--text-2]`
- Fields: email, password
- Submit: full-width primary button

## Rules

1. **No white backgrounds.** Everything dark.
2. **No heavy box shadows.** Use borders for separation.
3. **No gradient buttons.** Flat accent color only.
4. **No icons without labels** in nav (show text beside icon).
5. **Tables don't need card wrappers** — they ARE the content.
6. **One primary action per page header.** Secondary actions are ghost or dropdown.
7. **Empty states:** one icon + one line of text. No illustrations.
8. **Error states:** red text below field. No toast for field errors.
9. **Loading:** skeleton rows in tables. Spinner only for full-page loads.
10. **No modal for list operations.** Use slide-overs (drawer from right).
