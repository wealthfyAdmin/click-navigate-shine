// Global action handlers exposed on window.__cp so ported HTML onclicks work.
import { S, prj } from "./channel-data";

type Notify = () => void;

function toast(title: string, sub?: string) {
  let root = document.getElementById("cp-toasts");
  if (!root) { root = document.createElement("div"); root.id = "cp-toasts"; document.body.appendChild(root); }
  const n = document.createElement("div");
  n.className = "cp-toast";
  n.innerHTML = `<b>${title}</b>${sub ? `<small>${sub}</small>` : ""}`;
  root.appendChild(n);
  setTimeout(() => { n.style.opacity = "0"; setTimeout(() => n.remove(), 300); }, 4200);
}

export function installActions(refresh: Notify) {
  const w = window as any;
  w.__cp = {
    toast,
    escalate: (cust: string) => toast("Escalation raised", `${cust} — routed to Operations with your note`),
    raiseL3: (id: string) => toast("Escalated to L3", `${id} — leadership notified, recovery plan due in 24 hours`),
    suspend: (n: string) => toast("Lead allocation suspended", `${n} — review conversation scheduled`),
    coach: (f: string) => toast("Coaching assigned", `${f} — 2 courses and a pipeline review booked`),
    chase: (c: string) => toast("Reminder sent", `${c} — copied to partner owner`),

    submitReport: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "Under review"; p.pct = Math.max(p.pct, 85);
      toast("Report submitted for review", "Rohit Kale has it. The customer sees nothing until it is approved."); refresh(); },
    approveReport: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "Report delivered"; p.pct = 92;
      toast("Report released", "Kohinoor Textiles and Amit Deshpande notified. Sign-off reminders at 3, 7 and 14 days.");
      refresh(); },
    signOff: (id: string) => { const p = prj(id); if (!p) return;
      p.state = "Signed off"; p.pct = 100;
      S.invoices.unshift({ id: "INV-4418", cust: "Kohinoor Textiles", prj: id, amt: 460000, st: "Ready to raise", age: "signed off today" });
      toast("Signed off", "Invoice INV-4418 has appeared in the Accounts queue."); refresh(); },
    raiseInv: (id: string) => { const i = S.invoices.find(x => x.id === id); if (!i) return;
      i.st = "Raised"; i.age = "due in 30 days";
      const p = prj(i.prj); if (p) p.invoiced = true;
      toast("Invoice raised", "GST-compliant invoice sent. Partner margin has moved to accrued."); refresh(); },
    runPayout: () => { S.payoutDone = true; S.payout.paid += S.payout.approved;
      toast("Payout released", "3 partners paid. Each sees their own line, traced to the invoices behind it."); refresh(); },
    resolveConf: (who: string) => { S.conflict.resolved = true;
      toast("Lead awarded to " + who, "Both partners notified. Decision stored for dispute defence."); refresh(); },
    logEffort: () => { S.effort.unshift({ d: "23 Jul", who: "Sneha Patil", t: "API authorisation testing", h: 6 });
      toast("6 hours booked", "Utilisation and project cost updated. Operations sees it on the board."); refresh(); },
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
      refresh(); },
  };
}
