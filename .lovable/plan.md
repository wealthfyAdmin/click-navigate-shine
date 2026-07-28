## Goal
Wire a real end-to-end flow across every role, backed by a shared in-browser store so records created in one dashboard show up live in the others. Add an "Add client" entry from the partner dashboard (top-right) plus the pages and buttons each role needs to move a lead through the pipeline.

## The flow (canonical)
```text
Partner            Sales             PM / Ops           Delivery         Accounts         Admin
──────             ─────             ────────           ────────         ────────         ─────
Add client   ─►  Verify lead  ─►  Assign team OR  ─►  Track work  ─►  Approve      ─►  Oversight
Create lead      (approve /       route to vendor    Log effort      invoice /       Full audit
                  reject)          (Ops decision)     Complete        payout →        + exceptions
                                                                       escalate for
                                                                       double-verify
```
Every step is a status transition on the same record; each dashboard filters that shared record set to its own queue.

## Shared temp store
- New `src/lib/store.ts`: singleton, `localStorage`-backed, with `getClients / addClient / getLeads / addLead / updateLead / getProjects / addProject / updateProject / getInvoices / updateInvoice` and a `subscribe()` event bus.
- Seed on first load from existing `S` data in `channel-data.ts` (so current demo screens keep their content), then let new records append.
- A tiny `useStore()` hook triggers re-render on any change → other role tabs/pages reflect updates immediately.

## New pages (one per action, all wired end-to-end)
| Route key | Role | Purpose |
|---|---|---|
| `p-add-client` | Partner | Form: client name, city, industry → writes client + creates draft lead |
| `p-new-lead` | Partner | Pick client + service line + value → status `pending_sales_verification` |
| `s-verify` | Sales | Queue of partner leads → **Approve** (→ Ops) / **Reject** (back to partner with note) |
| `o-assign` | Ops | Lead detail → **Assign internal PM/team** OR **Route to vendor** → creates project |
| `o-vendor-route` | Ops | Pick vendor from catalogue → status `with_vendor`, shows on vendor dashboard |
| `v-jobs` | Vendor | Inbox of routed jobs → **Accept** / **Decline** → status back to Ops on accept |
| `d-track` (rework of `d-assign`) | Delivery | Live status of assigned projects, quick **Log time** / **Mark complete** |
| `a-approve` | Accounts | Approval queue for invoices/payouts → **Approve** (→ Escalate) / **Reject** |
| `a-escalate` | Accounts | Double-verify step → **Confirm** finalises invoice/payout |
| `x-audit` | Admin | Full timeline of every record + status transitions across roles |

Existing pages (`p-dash`, `s-cov`, `o-board`, `a-inv`, etc.) get a new **"Live queue"** panel driven by the shared store, plus buttons routing into the pages above.

## Partner dashboard header
Top-right of partner topbar gets two primary CTAs: **+ Add client** → `/app/partner/p-add-client`, **+ New lead** → `/app/partner/p-new-lead`. Sidebar keeps the existing "Client view" quick-jump.

## Status model
Single enum on each lead/project: `draft → pending_sales → approved → assigned → in_delivery → completed → invoiced → approved_finance → escalated → closed` (plus `rejected`, `with_vendor`). Every action button transitions status and pushes an entry into a shared `timeline[]` the Admin audit page renders.

## Wire map update
`/wire` gets a new "Flow" tab that renders the canonical arrow diagram above with live counts pulled from the store (e.g. "Sales queue: 3 pending").

## Technical notes
- Pure client-side; no backend changes. `localStorage` key `cp_store_v1`, versioned so we can bump seed.
- All new screens render through the existing `renderScreen` switch in `channel-screens.ts` so routing (`/app/$role/$screen`) keeps working unchanged.
- Sidebar nav in `channel-data.ts` extended per role with the new screen keys so each dashboard only shows its own additions.
- Buttons use the existing `installActions` bridge; new action verbs added: `client:add`, `lead:create`, `lead:approve`, `lead:reject`, `lead:assign`, `lead:route-vendor`, `vendor:accept`, `vendor:decline`, `invoice:approve`, `invoice:escalate`, `invoice:confirm`.

## Out of scope
Real backend, auth, multi-tab sync beyond `storage` event, editing seed demo records (they stay read-only; new records are fully mutable).
