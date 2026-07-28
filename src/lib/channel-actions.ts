// Global action handlers exposed on window.__cp so ported HTML onclicks work.
// Mutating actions redirect to the natural next screen after they run.
import { S, prj } from "./channel-data";
import { store } from "./store";

type Notify = () => void;
type Go = (href: string) => void;

function toast(title: string, sub?: string) {
  let root = document.getElementById("cp-toasts");
  if (!root) { root = document.createElement("div"); root.id = "cp-toasts"; document.body.appendChild(root); }
  const n = document.createElement("div");
  n.className = "cp-toast";
  n.innerHTML = `<b>${title}</b>${sub ? `<small>${sub}</small>` : ""}`;
  root.appendChild(n);
  setTimeout(() => { n.style.opacity = "0"; setTimeout(() => n.remove(), 300); }, 4200);
}

const val = (id: string): string => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value?.trim() ?? "";

export function installActions(refresh: Notify, go: Go) {
  const w = window as any;
  w.__cp = {
    toast,
    __go: go,

    // Existing flow --------------------------------------------------------
    escalate: (cust: string) => { toast("Escalation raised", `${cust} — routed to Operations`); go("/app/ops/o-esc"); },
    raiseL3: (id: string) => { toast("Escalated to L3", `${id} — leadership notified`); go("/app/ops/o-esc"); refresh(); },
    suspend: (n: string) => { toast("Lead allocation suspended", `${n} — review scheduled`); go("/app/sales/s-qual"); },
    coach: (f: string) => { toast("Coaching assigned", `${f} — 2 courses + pipeline review booked`); go("/app/sales/s-qual"); },
    chase: (c: string) => { toast("Reminder sent", `${c} — copied to partner owner`); go("/app/accounts/a-inv"); refresh(); },

    submitReport: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "Under review"; p.pct = Math.max(p.pct, 85);
      toast("Report submitted for review", "Rohit Kale has it. Customer sees nothing until approved.");
      refresh(); go(`/app/ops/o-proj?ctx=${id}`); },

    approveReport: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "Report delivered"; p.pct = 92;
      toast("Report released", "Customer + partner notified. Reminders at 3, 7, 14 days.");
      refresh(); go(`/app/ops/o-proj?ctx=${id}`); },

    signOff: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "Signed off"; p.pct = 100;
      if (!S.invoices.some(x => x.id === "INV-4418")) {
        S.invoices.unshift({ id: "INV-4418", cust: "Kohinoor Textiles", prj: id, amt: 460000, st: "Ready to raise", age: "signed off today" });
      }
      toast("Signed off", "Invoice INV-4418 now in the Accounts queue.");
      refresh(); go("/app/accounts/a-inv"); },

    raiseInv: (id: string) => { const i = S.invoices.find(x => x.id === id); if (!i) return;
      i.st = "Raised"; i.age = "due in 30 days";
      const p = prj(i.prj); if (p) p.invoiced = true;
      toast("Invoice raised", "GST-compliant invoice sent. Partner margin accrued.");
      refresh(); go("/app/accounts/a-inv"); },

    runPayout: () => { S.payoutDone = true; S.payout.paid += S.payout.approved;
      toast("Payout released", "3 partners paid. Each sees only their own line.");
      refresh(); go("/app/accounts/a-pay"); },

    logEffort: () => { S.effort.unshift({ d: "23 Jul", who: "Sneha Patil", t: "API authorisation testing", h: 6 });
      toast("6 hours booked", "Utilisation and project cost updated.");
      refresh(); go("/app/delivery/d-effort"); },

    allocate: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "In progress"; p.rag = "green"; p.pm = "Rohit Kale"; p.team = ["Imran Qureshi"];
      p.start = "28 Jul"; p.end = "14 Aug"; p.pct = 5;
      p.ms = [
        { t: "Kickoff & scope freeze", d: "28 Jul", s: "now" },
        { t: "Cloud configuration review", d: "04 Aug", s: "plan" },
        { t: "Testing complete", d: "11 Aug", s: "plan" },
        { t: "Report & handover", d: "14 Aug", s: "plan" },
      ];
      S.exceptions = S.exceptions.filter(e => e.act !== "allocate");
      toast("Project created and published", "Aurora Retail · Imran Qureshi · 28 Jul → 14 Aug.");
      refresh(); go(`/app/ops/o-proj?ctx=${id}`); },

    // ==========================================================
    // NEW END-TO-END STORE FLOW
    // ==========================================================
    addClient: () => {
      const name = val("cli-name"), city = val("cli-city"), industry = val("cli-ind") || "Other", contact = val("cli-mail");
      if (!name || !city) { toast("Missing fields", "Company name and city are required."); return; }
      const c = store.addClient({ name, city, industry, contact: contact || "contact@" + name.toLowerCase().replace(/\s+/g, "") + ".com", partner: "Amit Deshpande" });
      toast("Client added", `${c.name} · ${c.id} — visible to Sales and Admin now.`);
      go(`/app/partner/p-new-lead?ctx=${c.id}`);
    },

    createLead: () => {
      const clientId = val("ld-client"); const service = val("ld-service"); const line = val("ld-line");
      const value = parseInt(val("ld-val") || "0", 10);
      if (!clientId || !service || !value) { toast("Missing fields", "Client, service and value are required."); return; }
      const c = store.client(clientId); if (!c) return;
      const l = store.createLead({ clientId, clientName: c.name, service, line, value, partner: c.partner });
      toast("Lead submitted", `${l.id} → Sales verification queue`);
      go("/app/partner/p-clients");
    },

    approveLead: (id: string) => {
      store.approveLead(id, "Sales · Suresh Kadam");
      toast("Lead approved", "Routed to Ops for assignment.");
      go("/app/sales/s-verify");
    },
    rejectLead: (id: string) => {
      const reason = window.prompt("Reason for rejection?") || "Insufficient information";
      store.rejectLead(id, reason, "Sales · Suresh Kadam");
      toast("Lead rejected", reason);
      go("/app/sales/s-verify");
    },
    assignInternal: (id: string) => {
      const who = val("assign-who") || "Sneha Patil";
      store.assignInternal(id, who, "Ops · Rohit Kale");
      toast("Assigned", `${who} — appears on Delivery dashboard.`);
      go("/app/ops/o-assign");
    },
    routeVendor: (id: string) => {
      const v = val("assign-vendor") || "Lumiverse OEM · Red-team";
      store.routeVendor(id, v, "Ops · Rohit Kale");
      toast("Routed to vendor", `${v} — appears in Vendor inbox.`);
      go("/app/ops/o-assign");
    },
    vendorAccept: (id: string) => {
      store.vendorAccept(id);
      toast("Job accepted", "Now in delivery.");
      go("/app/vendor/v-jobs");
    },
    vendorDecline: (id: string) => {
      store.vendorDecline(id);
      toast("Job declined", "Sent back to Ops queue.");
      go("/app/vendor/v-jobs");
    },
    completeLead: (id: string) => {
      const inv = store.markCompleted(id, "Delivery · Sneha Patil");
      toast("Delivery complete", `Invoice ${inv.id} raised — Accounts notified.`);
      go("/app/delivery/d-track");
    },
    approveInvoice: (id: string) => {
      store.approveInvoice(id, "Accounts · Meera Joshi");
      toast("Approved", "Escalated to Admin for double-verification.");
      go("/app/accounts/a-approve");
    },
    rejectInvoice: (id: string) => {
      const reason = window.prompt("Reason for rejection?") || "Amount mismatch";
      store.rejectInvoice(id, reason, "Accounts · Meera Joshi");
      toast("Rejected", reason);
      go("/app/accounts/a-approve");
    },
    confirmInvoice: (id: string) => {
      store.confirmInvoice(id, "Admin · Platform");
      toast("Confirmed", "Invoice approved · flow closed.");
      go("/app/admin/x-verify");
    },
    resetStore: () => {
      if (!window.confirm("Reset the shared workspace store? Existing demo data is unaffected.")) return;
      store.reset();
      toast("Store reset", "Seed data restored.");
      go("/app/admin/x-audit");
    },
  };
}
