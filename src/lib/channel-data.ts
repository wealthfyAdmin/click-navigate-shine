// Central mock data ported 1:1 from the wireframe.
// Consumed by all screen renderers and the /wire connection map.

export type Rag = "green" | "amber" | "red";

export interface Milestone { t: string; d: string; s: "done" | "now" | "plan" | "slip" }
export interface Dep { t: string; o: string; s: string }
export interface Project {
  id: string; cust: string; what: string; line: string; partner: string;
  pm: string | null; team: string[]; start: string; end: string;
  state: string; rag: Rag; pct: number; val: number | string;
  effort: string; trace?: boolean; ms: Milestone[]; dep: Dep[];
  find?: { crit: number; high: number; med: number; low: number };
  risk?: string; signed?: boolean; won?: string; invoiced?: boolean;
}

export const S: {
  me: any; credit: any; opps: any[]; projects: Project[]; people: any[];
  partners: any[]; invoices: any[]; ledger: any[]; payout: any;
  escal: any[]; effort: any[]; catalog: any[]; exceptions: any[]; conflict: any;
  payoutDone?: boolean;
} = {
  me: { name: "Amit Deshpande", firm: "Deshpande Technologies", city: "Nashik", tier: "Gold" },
  credit: { issued: 2000000, consumed: 1240000, reserved: 320000, avail: 440000, expires: "13 Nov 2026", invested: 200000 },
  opps: [
    { id: "OPP-1042", cust: "Kohinoor Textiles", what: "Network + Web VAPT & ISO 27001", val: 840000, stage: "Proposal sent", score: 82, lock: "12 Aug", age: "9d" },
    { id: "OPP-1051", cust: "Bluewave Logistics", what: "Asset Sync 250 nodes + implementation", val: 320000, stage: "Credit reserved", score: 74, lock: "28 Jul", age: "4d" },
    { id: "OPP-1063", cust: "Sahyadri Hospitals", what: "SOC onboarding + EDR 400 seats", val: 1150000, stage: "Effort sizing with Ops", score: 68, lock: "02 Aug", age: "2d" },
  ],
  projects: [
    { id: "PRJ-2201", cust: "Kohinoor Textiles", what: "Web & API VAPT", line: "Security services", partner: "Amit Deshpande",
      pm: "Rohit Kale", team: ["Sneha Patil", "Imran Qureshi"], start: "06 Jul", end: "31 Jul", state: "In progress", rag: "green",
      pct: 62, val: 460000, effort: "18 of 24 person-days", trace: true,
      ms: [
        { t: "Kickoff & scope freeze", d: "06 Jul", s: "done" },
        { t: "Credentials & access", d: "08 Jul", s: "done" },
        { t: "Web application testing", d: "17 Jul", s: "done" },
        { t: "API testing", d: "due 25 Jul", s: "now" },
        { t: "Draft report", d: "28 Jul", s: "plan" },
        { t: "Internal review", d: "30 Jul", s: "plan" },
        { t: "Retest", d: "07 Aug", s: "plan" },
      ],
      dep: [
        { t: "Staging environment credentials", o: "Customer", s: "closed" },
        { t: "Test accounts for role matrix", o: "Customer", s: "open, due 24 Jul" },
      ],
      find: { crit: 3, high: 7, med: 11, low: 6 } },
    { id: "PRJ-2204", cust: "Sahyadri Hospitals", what: "ISO 27001 implementation", line: "Compliance (purple)", partner: "Amit Deshpande",
      pm: "Rohit Kale", team: ["Priya Nair"], start: "01 Jun", end: "30 Sep", state: "At risk", rag: "red",
      pct: 34, val: 980000, effort: "31 of 74 person-days",
      ms: [
        { t: "Gap assessment", d: "12 Jun", s: "done" },
        { t: "Risk assessment", d: "26 Jun", s: "done" },
        { t: "Policy set drafted", d: "planned 30 Jun", s: "slip" },
        { t: "Statement of Applicability", d: "planned 10 Jul", s: "slip" },
        { t: "Internal audit", d: "25 Aug", s: "plan" },
        { t: "Stage 1 audit", d: "15 Sep", s: "plan" },
      ],
      dep: [
        { t: "Asset inventory from IT team", o: "Customer", s: "open 19 days — SLA paused" },
        { t: "Department head interviews", o: "Customer", s: "open, due 26 Jul" },
      ],
      risk: "Two milestones slipped. Asset inventory outstanding since 04 Jul; clock paused 19 days against customer. Escalation L2 open since 18 Jul." },
    { id: "PRJ-2198", cust: "Meridian Fintech", what: "Asset Sync deployment · 600 nodes", line: "Tool implementation", partner: "Amit Deshpande",
      pm: "Ajay Bhosale", team: ["Ajay Bhosale"], start: "02 Jun", end: "18 Jul", state: "Signed off", rag: "green",
      pct: 100, val: 560000, effort: "22 of 22 person-days",
      ms: [
        { t: "Discovery & sizing", d: "05 Jun", s: "done" },
        { t: "Agent rollout", d: "27 Jun", s: "done" },
        { t: "Integration & tuning", d: "11 Jul", s: "done" },
        { t: "Handover & training", d: "18 Jul", s: "done" },
        { t: "Customer sign-off", d: "21 Jul", s: "done" },
      ],
      dep: [], signed: true },
    { id: "PRJ-2210", cust: "Aurora Retail (Dubai)", what: "Cloud VAPT · AWS + M365", line: "Security services", partner: "Fatima Sheikh",
      pm: null, team: [], start: "—", end: "—", state: "Awaiting allocation", rag: "amber", pct: 0, val: "AED 78,000",
      effort: "estimate 16 person-days", won: "31 hours ago", ms: [], dep: [] },
  ],
  people: [
    { n: "Sneha Patil", sk: "Web · API · Mobile VAPT", u: [90, 95, 80, 60, 40] },
    { n: "Imran Qureshi", sk: "Network · Cloud VAPT", u: [75, 80, 55, 45, 30] },
    { n: "Priya Nair", sk: "ISO 27001 · DPDP · audit", u: [100, 105, 95, 90, 85] },
    { n: "Ajay Bhosale", sk: "Asset Sync · SI implementation", u: [45, 30, 55, 70, 60] },
    { n: "Kabir Shaikh", sk: "SOC · SIEM · EDR", u: [40, 35, 50, 65, 70] },
  ],
  partners: [
    { n: "Amit Deshpande", f: "Deshpande Technologies", c: "Nashik", t: "Gold", sc: 74, b: "Steady", leads: 14, won: 5, rev: 1240000, util: 62 },
    { n: "Fatima Sheikh", f: "Zenith Networks", c: "Dubai", t: "Platinum", sc: 81, b: "Growth", leads: 21, won: 9, rev: 3860000, util: 38 },
    { n: "Sanjana Kulkarni", f: "Orbit Consulting", c: "Mumbai", t: "Gold", sc: 66, b: "Steady", leads: 11, won: 3, rev: 720000, util: 44 },
    { n: "Rakesh Malviya", f: "Sunrise IT Solutions", c: "Pune", t: "Silver", sc: 48, b: "Watch", leads: 19, won: 2, rev: 180000, util: 11 },
    { n: "Vikram Rane", f: "Rane Infotech", c: "Nagpur", t: "Silver", sc: 21, b: "Review", leads: 22, won: 0, rev: 0, util: 8 },
  ],
  invoices: [
    { id: "INV-4412", cust: "Meridian Fintech", prj: "PRJ-2198", amt: 560000, st: "Ready to raise", age: "signed off 21 Jul" },
    { id: "INV-4388", cust: "Kohinoor Textiles", prj: "PRJ-2201", amt: 230000, st: "Raised", age: "due 01 Aug" },
    { id: "INV-4361", cust: "Bluewave Logistics", prj: "PRJ-2185", amt: 145000, st: "Overdue", age: "38 days" },
    { id: "INV-4402", cust: "Aurora Retail", prj: "PRJ-2190", amt: "AED 42,000", st: "Part paid", age: "60% received" },
  ],
  ledger: [
    { d: "14 May", t: "Issued", ref: "Gold tier · ₹2,00,000 paid", amt: 2000000, bal: 2000000 },
    { d: "12 Jun", t: "Consumed", ref: "PRJ-2201 Kohinoor · Web & API VAPT", amt: -460000, bal: 1540000 },
    { d: "26 Jun", t: "Consumed", ref: "PRJ-2198 Meridian · Asset Sync", amt: -560000, bal: 980000 },
    { d: "03 Jul", t: "Consumed", ref: "Licence bundle · Bluewave", amt: -220000, bal: 760000 },
    { d: "19 Jul", t: "Reserved", ref: "OPP-1051 Bluewave · in flight", amt: -320000, bal: 440000 },
  ],
  payout: { accrued: 186400, approved: 74000, paid: 342000 },
  escal: [
    { id: "ESC-118", prj: "PRJ-2204", lvl: "L2", what: "Two milestones slipped; customer dependency open 19 days", since: "18 Jul", own: "Operations head + Sales" },
    { id: "ESC-121", prj: "PRJ-2201", lvl: "L1", what: "Test accounts not provided; API testing at risk", since: "22 Jul", own: "Rohit Kale" },
  ],
  effort: [
    { d: "22 Jul", who: "Sneha Patil", t: "API authentication testing", h: 6.5 },
    { d: "22 Jul", who: "Imran Qureshi", t: "Network segment retest prep", h: 3 },
    { d: "21 Jul", who: "Sneha Patil", t: "Business logic testing", h: 7 },
  ],
  catalog: [
    { p: "Network VAPT", c: "Services · Red", tp: "₹1,400 / IP", mrp: "₹2,200 / IP", cr: "Yes", cert: "Required" },
    { p: "Web & API VAPT", c: "Services · Red", tp: "₹46,000 / app", mrp: "₹78,000 / app", cr: "Yes", cert: "Required" },
    { p: "ISO 27001 implementation", c: "Services · Purple", tp: "₹5,80,000", mrp: "₹9,80,000", cr: "Yes", cert: "Required" },
    { p: "Asset Sync (per 100 nodes)", c: "Tools · SI", tp: "₹68,000", mrp: "₹1,10,000", cr: "Yes", cert: "Optional" },
    { p: "Sudo Box", c: "Tools · SI", tp: "₹1,20,000", mrp: "₹1,95,000", cr: "Yes", cert: "Optional" },
    { p: "EDR licence (per seat, annual)", c: "Licence", tp: "₹960", mrp: "₹1,540", cr: "Yes", cert: "—" },
    { p: "Next-gen firewall (mid)", c: "Hardware", tp: "₹2,40,000", mrp: "₹3,35,000", cr: "Category-capped", cert: "—" },
    { p: "Security analyst (deployed, monthly)", c: "Staff aug", tp: "₹78,000", mrp: "₹1,25,000", cr: "No", cert: "—" },
  ],
  exceptions: [
    { k: "Win with no project after 24h", d: "PRJ-2210 · Aurora Retail · won 31 hours ago", sev: "bad", act: "allocate" },
    { k: "Consultant over-allocated", d: "Priya Nair at 105% for week of 27 Jul", sev: "warn" },
    { k: "Invoice overdue 38 days", d: "INV-4361 · Bluewave Logistics · ₹1,45,000", sev: "bad" },
    { k: "Credit expiring, barely used", d: "Vikram Rane · ₹9,20,000 lapses in 26 days · 8% used", sev: "warn" },
    { k: "SLA paused beyond tolerance", d: "PRJ-2204 · customer hold 19 days", sev: "warn" },
  ],
  conflict: { id: "LEAD-3391", cust: "Bluewave Logistics",
    a: { n: "Amit Deshpande", on: "12 Jul", ev: "2 meetings logged, scoping doc shared" },
    b: { n: "Rakesh Malviya", on: "15 Jul", ev: "No activity logged" }, resolved: false },
};

export type RoleKey = "partner" | "sales" | "ops" | "delivery" | "accounts" | "client" | "admin" | "vendor";

export const ROLES: Record<RoleKey, { label: string; who: [string, string, string]; nav: [string, [string, string, number?][]][] }> = {
  partner: { label: "Partner", who: ["AD", "Amit Deshpande", "Deshpande Technologies · Gold"], nav: [
    ["Sell", [["p-dash", "Dashboard"], ["p-pipe", "Leads & pipeline"], ["p-add-client", "Add client", 1], ["p-new-lead", "Create lead", 1], ["p-clients", "My clients", 1]]],
    ["Deliver", [["p-del", "My deliveries", 1]]],
    ["Earn", [["p-earn", "Earnings & payouts", 1], ["p-score", "My scorecard", 1]]] ]},
  sales: { label: "Sales", who: ["SK", "Suresh Kadam", "Channel Sales · West"], nav: [
    ["Verify", [["s-verify", "Lead verification", 1]]],
    ["Coverage", [["s-cov", "Partner coverage"]]],
    ["Queues", [["s-qual", "Partner quality board", 1]]] ]},
  ops: { label: "Ops / PM", who: ["RK", "Rohit Kale", "Operations & delivery"], nav: [
    ["Assign", [["o-assign", "Lead assignment", 1]]],
    ["Delivery", [["o-board", "Delivery board", 1], ["o-unalloc", "Unallocated wins", 1], ["o-proj", "Project detail", 1]]],
    ["Capacity", [["o-res", "Resource calendar", 1], ["o-esc", "Escalations", 1]]] ]},
  delivery: { label: "Delivery", who: ["SP", "Sneha Patil", "Senior consultant · AppSec"], nav: [
    ["My work", [["d-assign", "My assignments", 1], ["d-track", "Live jobs", 1], ["d-effort", "Effort & evidence", 1], ["d-report", "Report workspace", 1]]] ]},
  accounts: { label: "Accounts", who: ["MJ", "Meera Joshi", "Finance & billing"], nav: [
    ["Approval", [["a-approve", "Invoice approvals", 1]]],
    ["Billing", [["a-inv", "Invoice queue", 1], ["a-cred", "Credit ledger", 1], ["a-pay", "Payout run", 1]]] ]},
  client: { label: "Client", who: ["KT", "Kohinoor Textiles", "Nashik · manufacturing"], nav: [
    ["My account", [["c-dash", "Overview"], ["c-proj", "My projects", 1]]] ]},
  admin: { label: "Admin", who: ["PW", "Platform admin", "Lumiverse Solutions"], nav: [
    ["Platform", [["x-over", "Platform overview"], ["x-audit", "Flow audit", 1], ["x-verify", "Finance verification", 1], ["x-exc", "Exceptions queue", 1]]] ]},
  vendor: { label: "Vendor", who: ["VN", "Vendor / OEM", "Catalogue owner"], nav: [
    ["Jobs", [["v-jobs", "Routed jobs", 1]]],
    ["Catalogue", [["v-cat", "Catalogue & pricing"]]] ]},
};

export const TRACE: Record<RoleKey, string> = {
  partner: "p-del", sales: "s-cov", ops: "o-proj", delivery: "d-assign",
  accounts: "a-inv", client: "c-proj", admin: "x-exc", vendor: "v-cat",
};

export const SCREEN_TITLES: Record<string, string> = {
  "p-dash": "Partner · Dashboard", "p-pipe": "Partner · Pipeline", "p-del": "Partner · Deliveries",
  "p-earn": "Partner · Earnings", "p-score": "Partner · Scorecard",
  "p-escalate": "Partner · Raise escalation",
  "p-add-client": "Partner · Add client", "p-new-lead": "Partner · Create lead", "p-clients": "Partner · My clients",
  "s-cov": "Sales · Coverage", "s-qual": "Sales · Quality board",
  "s-suspend": "Sales · Suspend allocation", "s-coach": "Sales · Assign coaching",
  "s-verify": "Sales · Lead verification", "s-verify-detail": "Sales · Verify lead",
  "o-board": "Ops · Delivery board", "o-unalloc": "Ops · Unallocated wins", "o-proj": "Ops · Project detail",
  "o-res": "Ops · Resources", "o-esc": "Ops · Escalations", "o-raise-l3": "Ops · Raise to L3",
  "o-assign": "Ops · Lead assignment", "o-assign-detail": "Ops · Assign lead",
  "d-assign": "Delivery · Assignments", "d-effort": "Delivery · Effort", "d-report": "Delivery · Report",
  "d-track": "Delivery · Live jobs",
  "a-inv": "Accounts · Invoices", "a-cred": "Accounts · Credit ledger", "a-pay": "Accounts · Payout run",
  "a-chase": "Accounts · Chase overdue", "a-raise": "Accounts · Raise invoice", "a-invdetail": "Accounts · Invoice detail",
  "a-approve": "Accounts · Invoice approvals", "a-approve-detail": "Accounts · Verify invoice",
  "d-log": "Delivery · Log time", "d-complete": "Delivery · Request report",
  "c-dash": "Client · Overview", "c-proj": "Client · Projects", "c-enquire": "Client · Enquire",
  "x-over": "Admin · Platform overview", "x-exc": "Admin · Exceptions",
  "x-audit": "Admin · Flow audit", "x-verify": "Admin · Finance verification",
  "v-cat": "Vendor · Catalogue", "v-jobs": "Vendor · Routed jobs", "v-job-detail": "Vendor · Job detail",
  "p-track": "Partner · Track deal",
  "n-inbox": "Notifications",
};

export const money = (n: number | string) => typeof n === "string" ? n : "₹" + n.toLocaleString("en-IN");
export const lakh = (n: number | string) => typeof n === "string" ? n : "₹" + (n / 100000).toFixed((n as number) % 100000 ? 2 : 0) + " L";
export const prj = (id: string) => S.projects.find(p => p.id === id);
