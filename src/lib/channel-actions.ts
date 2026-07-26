// Global action handlers exposed on window.__cp so ported HTML onclicks work.
// Mutating actions redirect to the natural next screen after they run.
import { S, prj } from "./channel-data";

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

export function installActions(refresh: Notify, go: Go) {
  const w = window as any;
  w.__cp = {
    toast,
    __go: go,

    // Simple redirects to flow pages (kept for legacy call-sites)
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
  };
}
