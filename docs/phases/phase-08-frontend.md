# Phase 08 — Frontend Polish

**Status:** DONE  
**Owner:** Shrujal00  
**Depends on:** Phases 03–07 (backend APIs must be live)  

## Goal
All ERP pages have real UI: tables, forms, modals, RBAC-aware navigation, loading/error states.

## Layout & Navigation

### FE-LAYOUT-01 · App shell
- Sidebar navigation with all module links
- Show/hide nav items based on user role (from Zustand store)
- User avatar + role badge in header
- Active route highlighting

### FE-LAYOUT-02 · Route protection
`frontend/src/middleware.ts`
- Redirect unauthenticated users to `/login`
- Redirect users to their default module on login (Sales User → `/erp/sales`, etc.)

## Per-Module UI

### Products
- Data table with sort + filter
- Create/edit slide-over panel with procurement config section
- Low stock badge on rows

### Sales
- Order list table with status color badges
- Create order: customer search, product line-item adder, price calculation
- Order detail drawer: items, delivery history, procurement actions triggered
- Deliver modal: per-item qty inputs with remaining qty shown

### Purchases
- PO list table
- Create PO: vendor search, product line-item adder
- Receive modal: per-item received qty with validation

### Manufacturing
- MO list with status pipeline visualization
- Create MO: product picker → BoM preview (components + operations)
- MO detail: work order steps as timeline, each step has status control
- Complete button with confirmation dialog

### Bill of Materials
- BoM list grouped by product
- BoM editor: component rows (product picker, qty, scrap %), operation rows (name, sequence, duration, work center)
- Version badge, active/inactive toggle

### Inventory
- Movement ledger table (filterable, paginated)
- Adjustment modal (Inventory Manager only)
- Product stock card (on-hand / reserved / free)

### Procurement
- Auto-triggered actions list
- Link to source sales order and created PO/MO

### Audit
- Event log with type color coding
- Filter sidebar

### Dashboard
- Stat cards grid
- Low stock products table

## Shared Components to Build

| Component | Used by |
|---|---|
| `DataTable` | All list pages |
| `StatusBadge` | Sales, Purchase, MO lists |
| `SlideOver / Modal` | Create/edit forms |
| `ProductPicker` | Sales, Purchase, MO, BoM |
| `CustomerPicker` | Sales |
| `VendorPicker` | Purchase |
| `ConfirmDialog` | Destructive actions |
| `LoadingSpinner` | All async fetches |
| `EmptyState` | Empty lists |
| `ErrorBoundary` | Page-level errors |

## API Client (complete wiring)
Each `features/*/index.ts` must export:
- Query hooks (`useProducts`, `useSalesOrders`, etc.)
- Mutation hooks (`useCreateProduct`, `useConfirmSalesOrder`, etc.)
- Type-safe response types

## Done Criteria
- [x] All ERP pages render real data from API
- [x] Forms validate before submit
- [x] Role-based nav hides modules the user can't access
- [x] Loading and error states shown on async calls
- [x] User management supports create/edit/activate/deactivate/delete/password reset
- [x] Role permission matrix is visible in the Users page
- [x] No production build TypeScript errors
