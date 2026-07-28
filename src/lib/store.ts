// Shared temp store — localStorage-backed, singleton, event bus.
// Seeded once from the demo `S` data. New records created via any dashboard
// (Add client, Create lead, Approve, Assign, etc.) show up live in every
// other role's dashboard through the subscribe() hook.

const KEY = "cp_store_v2";
const EVT = "cp:store";

export type LeadStatus =
  | "draft"
  | "pending_sales"
  | "rejected_sales"
  | "approved_ops"
  | "with_vendor"
  | "vendor_declined"
  | "assigned"
  | "in_delivery"
  | "completed"
  | "invoiced"
  | "approved_finance"
  | "escalated_finance"
  | "closed";

export interface StoreClient {
  id: string;
  name: string;
  city: string;
  industry: string;
  contact: string;
  partner: string;
  createdAt: string;
}

export interface StoreLead {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  line: string;
  value: number;
  partner: string;
  status: LeadStatus;
  assignee?: string;      // internal PM / consultant
  vendor?: string;        // routed vendor name
  invoiceId?: string;
  note?: string;
  createdAt: string;
}

export interface StoreInvoice {
  id: string;
  leadId?: string;
  clientName: string;
  amount: number;
  status: "pending_approval" | "escalated" | "approved" | "paid" | "rejected";
  createdAt: string;
}

export interface StoreTimeline {
  t: string;            // ISO
  actor: string;        // role label
  refId: string;        // lead / client / invoice id
  event: string;        // human message
  kind: "info" | "good" | "warn" | "bad";
}

export interface StoreState {
  clients: StoreClient[];
  leads: StoreLead[];
  invoices: StoreInvoice[];
  timeline: StoreTimeline[];
  seq: { client: number; lead: number; invoice: number };
}

const SEED: StoreState = {
  clients: [
    { id: "CLI-001", name: "Kohinoor Textiles", city: "Nashik", industry: "Manufacturing", contact: "cio@kohinoortextiles.in", partner: "Amit Deshpande", createdAt: "2026-06-04" },
    { id: "CLI-002", name: "Bluewave Logistics", city: "Mumbai", industry: "Logistics", contact: "it@bluewave.co", partner: "Amit Deshpande", createdAt: "2026-06-18" },
    { id: "CLI-003", name: "Sahyadri Hospitals", city: "Pune", industry: "Healthcare", contact: "ciso@sahyadri.health", partner: "Amit Deshpande", createdAt: "2026-05-30" },
  ],
  leads: [],
  invoices: [],
  timeline: [
    { t: new Date().toISOString(), actor: "System", refId: "—", event: "Workspace seeded with 3 demo clients", kind: "info" },
  ],
  seq: { client: 3, lead: 0, invoice: 0 },
};

function load(): StoreState {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as StoreState;
  } catch { return SEED; }
}

function persist(s: StoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(EVT));
}

let state: StoreState = load();

function mutate(fn: (s: StoreState) => void) {
  fn(state);
  persist(state);
}

function nowStamp() {
  const d = new Date();
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function log(actor: string, refId: string, event: string, kind: StoreTimeline["kind"] = "info") {
  state.timeline.unshift({ t: new Date().toISOString(), actor, refId, event, kind });
  if (state.timeline.length > 200) state.timeline.length = 200;
}

export const store = {
  // reads
  all: () => state,
  clients: () => state.clients,
  leads: () => state.leads,
  invoices: () => state.invoices,
  timeline: () => state.timeline,
  lead: (id: string) => state.leads.find(l => l.id === id),
  client: (id: string) => state.clients.find(c => c.id === id),
  invoice: (id: string) => state.invoices.find(i => i.id === id),

  // counters for badges/wire map
  counts: () => ({
    salesQueue: state.leads.filter(l => l.status === "pending_sales").length,
    opsQueue: state.leads.filter(l => l.status === "approved_ops").length,
    vendorQueue: state.leads.filter(l => l.status === "with_vendor").length,
    delivery: state.leads.filter(l => l.status === "assigned" || l.status === "in_delivery").length,
    finance: state.invoices.filter(i => i.status === "pending_approval").length,
    escalated: state.invoices.filter(i => i.status === "escalated").length,
  }),

  // mutations — each pushes a timeline entry so Admin audit shows the flow
  addClient(input: Omit<StoreClient, "id" | "createdAt">) {
    let created!: StoreClient;
    mutate(s => {
      s.seq.client += 1;
      created = { ...input, id: "CLI-" + String(s.seq.client).padStart(3, "0"), createdAt: nowStamp() };
      s.clients.unshift(created);
      log("Partner · " + input.partner, created.id, `Added client ${created.name} (${created.city})`, "good");
    });
    return created;
  },

  createLead(input: Omit<StoreLead, "id" | "status" | "createdAt">) {
    let created!: StoreLead;
    mutate(s => {
      s.seq.lead += 1;
      created = { ...input, id: "LEAD-" + String(9000 + s.seq.lead), status: "pending_sales", createdAt: nowStamp() };
      s.leads.unshift(created);
      log("Partner · " + input.partner, created.id, `Created lead ${created.service} for ${created.clientName} · ₹${created.value.toLocaleString("en-IN")}`, "info");
    });
    return created;
  },

  approveLead(id: string, by = "Sales") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "approved_ops";
      log(by, id, `Verified lead → routed to Ops`, "good");
    });
  },
  rejectLead(id: string, reason: string, by = "Sales") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "rejected_sales"; l.note = reason;
      log(by, id, `Rejected lead: ${reason}`, "bad");
    });
  },
  assignInternal(id: string, who: string, by = "Ops") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "assigned"; l.assignee = who; l.vendor = undefined;
      log(by, id, `Assigned to ${who} (internal team)`, "good");
    });
  },
  routeVendor(id: string, vendor: string, by = "Ops") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "with_vendor"; l.vendor = vendor;
      log(by, id, `Routed to vendor ${vendor}`, "info");
    });
  },
  vendorAccept(id: string, by = "Vendor") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "in_delivery"; l.assignee = l.vendor;
      log(by, id, `Vendor accepted job — in delivery`, "good");
    });
  },
  vendorDecline(id: string, by = "Vendor") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "approved_ops"; l.vendor = undefined;
      log(by, id, `Vendor declined — back to Ops queue`, "warn");
    });
  },
  markInDelivery(id: string, by = "Delivery") {
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "in_delivery";
      log(by, id, `Kickoff — status in delivery`, "info");
    });
  },
  markCompleted(id: string, by = "Delivery") {
    let inv!: StoreInvoice;
    mutate(s => {
      const l = s.leads.find(x => x.id === id); if (!l) return;
      l.status = "completed";
      s.seq.invoice += 1;
      inv = { id: "INV-" + String(9000 + s.seq.invoice), leadId: l.id, clientName: l.clientName, amount: l.value, status: "pending_approval", createdAt: nowStamp() };
      s.invoices.unshift(inv);
      l.invoiceId = inv.id;
      l.status = "invoiced";
      log(by, id, `Delivery completed → invoice ${inv.id} raised, sent to Accounts`, "good");
    });
    return inv;
  },
  approveInvoice(id: string, by = "Accounts") {
    mutate(s => {
      const i = s.invoices.find(x => x.id === id); if (!i) return;
      i.status = "escalated";
      log(by, id, `Invoice approved → sent to Admin for double-verification`, "info");
    });
  },
  rejectInvoice(id: string, reason: string, by = "Accounts") {
    mutate(s => {
      const i = s.invoices.find(x => x.id === id); if (!i) return;
      i.status = "rejected";
      log(by, id, `Invoice rejected: ${reason}`, "bad");
    });
  },
  confirmInvoice(id: string, by = "Admin") {
    mutate(s => {
      const i = s.invoices.find(x => x.id === id); if (!i) return;
      i.status = "approved";
      if (i.leadId) {
        const l = s.leads.find(x => x.id === i.leadId);
        if (l) l.status = "closed";
      }
      log(by, id, `Invoice double-verified & approved — flow closed`, "good");
    });
  },

  reset() {
    state = JSON.parse(JSON.stringify(SEED));
    persist(state);
  },

  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    const local = () => cb();
    const cross = (e: StorageEvent) => { if (e.key === KEY) { state = load(); cb(); } };
    window.addEventListener(EVT, local as any);
    window.addEventListener("storage", cross);
    return () => {
      window.removeEventListener(EVT, local as any);
      window.removeEventListener("storage", cross);
    };
  },
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  draft: "Draft",
  pending_sales: "Pending sales verify",
  rejected_sales: "Rejected by sales",
  approved_ops: "With Ops · to assign",
  with_vendor: "Routed to vendor",
  vendor_declined: "Vendor declined",
  assigned: "Assigned",
  in_delivery: "In delivery",
  completed: "Completed",
  invoiced: "Invoice raised",
  approved_finance: "Approved · finance",
  escalated_finance: "Escalated · finance",
  closed: "Closed",
};

export const STATUS_PILL: Record<LeadStatus, string> = {
  draft: "p-mute",
  pending_sales: "p-warn",
  rejected_sales: "p-bad",
  approved_ops: "p-info",
  with_vendor: "p-info",
  vendor_declined: "p-warn",
  assigned: "p-info",
  in_delivery: "p-info",
  completed: "p-good",
  invoiced: "p-good",
  approved_finance: "p-good",
  escalated_finance: "p-warn",
  closed: "p-mute",
};
