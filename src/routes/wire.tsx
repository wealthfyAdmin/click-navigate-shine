import { createFileRoute, Link } from "@tanstack/react-router";
import { ROLES, SCREEN_TITLES, type RoleKey } from "@/lib/channel-data";

export const Route = createFileRoute("/wire")({
  head: () => ({
    meta: [
      { title: "Wire Connections · Channel Platform" },
      { name: "description", content: "Every button in the platform, the page it opens, and the data source it reads from." },
      { property: "og:title", content: "Wire Connections Map" },
      { property: "og:description", content: "Trace any click to a page, any page to its data source." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WirePage,
});

/* ============================================================
   Master mapping — one row per major button in the platform.
   ============================================================ */
interface Wire {
  from: { role: RoleKey; screen: string; label: string };
  to: { kind: "route" | "action" | "modal"; role?: RoleKey; screen?: string; ctx?: string; label: string };
  data: string[]; // which S.* collections drive it
  trigger?: string;
}

const WIRES: Wire[] = [
  // Partner
  { from: { role: "partner", screen: "p-dash", label: "Open all deliveries" },
    to: { kind: "route", role: "partner", screen: "p-del", label: "/app/partner/p-del" },
    data: ["S.projects (filter by partner)"] },
  { from: { role: "partner", screen: "p-dash", label: "See earnings →" },
    to: { kind: "route", role: "partner", screen: "p-earn", label: "/app/partner/p-earn" },
    data: ["S.payout", "S.projects"] },
  { from: { role: "partner", screen: "p-dash", label: "Open credit ledger →" },
    to: { kind: "route", role: "accounts", screen: "a-cred", label: "/app/accounts/a-cred" },
    data: ["S.ledger", "S.credit"] },
  { from: { role: "partner", screen: "p-pipe", label: "Track (per deal row)" },
    to: { kind: "route", role: "partner", screen: "p-del", label: "/app/partner/p-del" },
    data: ["S.opps → S.projects"] },
  { from: { role: "partner", screen: "p-del", label: "Open detail (project card)" },
    to: { kind: "route", role: "ops", screen: "o-proj", ctx: "PRJ-XXXX", label: "/app/ops/o-proj?ctx=<id>" },
    data: ["S.projects[id]"] },
  { from: { role: "partner", screen: "p-del", label: "Escalate" },
    to: { kind: "action", label: "toast + open escalation" }, data: ["S.escal"], trigger: "window.__cp.escalate" },

  // Sales
  { from: { role: "sales", screen: "s-cov", label: "Track (Kohinoor row)" },
    to: { kind: "route", role: "ops", screen: "o-proj", ctx: "PRJ-2201", label: "/app/ops/o-proj?ctx=PRJ-2201" },
    data: ["S.projects"] },
  { from: { role: "sales", screen: "s-qual", label: "Suspend leads (Review band)" },
    to: { kind: "action", label: "toast: partner suspended" }, data: ["S.partners"], trigger: "window.__cp.suspend" },
  { from: { role: "sales", screen: "s-qual", label: "Assign coaching (Watch band)" },
    to: { kind: "action", label: "toast: coaching booked" }, data: ["S.partners"], trigger: "window.__cp.coach" },


  // Ops
  { from: { role: "ops", screen: "o-board", label: "Open (project row)" },
    to: { kind: "route", role: "ops", screen: "o-proj", ctx: "<id>", label: "/app/ops/o-proj?ctx=<id>" },
    data: ["S.projects"] },
  { from: { role: "ops", screen: "o-unalloc", label: "Create project" },
    to: { kind: "action", label: "S.projects[id].state = In progress + team assigned" },
    data: ["S.projects", "S.exceptions"], trigger: "window.__cp.allocate" },
  { from: { role: "ops", screen: "o-proj", label: "Mark testing complete" },
    to: { kind: "action", label: "state → Under review" }, data: ["S.projects[id]"], trigger: "window.__cp.submitReport" },
  { from: { role: "ops", screen: "o-proj", label: "Approve report & release" },
    to: { kind: "action", label: "state → Report delivered" }, data: ["S.projects[id]"], trigger: "window.__cp.approveReport" },
  { from: { role: "ops", screen: "o-esc", label: "Raise to L3" },
    to: { kind: "action", label: "toast: leadership notified" }, data: ["S.escal"], trigger: "window.__cp.raiseL3" },

  // Delivery
  { from: { role: "delivery", screen: "d-assign", label: "Log effort" },
    to: { kind: "route", role: "delivery", screen: "d-effort", label: "/app/delivery/d-effort" }, data: ["S.effort"] },
  { from: { role: "delivery", screen: "d-assign", label: "Open report" },
    to: { kind: "route", role: "delivery", screen: "d-report", label: "/app/delivery/d-report" }, data: ["S.projects[PRJ-2201]"] },
  { from: { role: "delivery", screen: "d-effort", label: "Log time" },
    to: { kind: "action", label: "S.effort.unshift(...)" }, data: ["S.effort"], trigger: "window.__cp.logEffort" },
  { from: { role: "delivery", screen: "d-report", label: "Submit for internal review" },
    to: { kind: "action", label: "state → Under review" }, data: ["S.projects[PRJ-2201]"], trigger: "window.__cp.submitReport" },

  // Accounts
  { from: { role: "accounts", screen: "a-inv", label: "Raise invoice" },
    to: { kind: "action", label: "S.invoices[id].st = Raised, project.invoiced = true" },
    data: ["S.invoices", "S.projects"], trigger: "window.__cp.raiseInv" },
  { from: { role: "accounts", screen: "a-inv", label: "Chase (Overdue)" },
    to: { kind: "action", label: "toast: reminder sent" }, data: ["S.invoices"], trigger: "window.__cp.chase" },
  { from: { role: "accounts", screen: "a-inv", label: "Project ref link" },
    to: { kind: "route", role: "ops", screen: "o-proj", ctx: "<id>", label: "/app/ops/o-proj?ctx=<id>" },
    data: ["S.projects"] },
  { from: { role: "accounts", screen: "a-pay", label: "Approve & release run" },
    to: { kind: "action", label: "S.payoutDone = true; S.payout.paid += approved" },
    data: ["S.payout"], trigger: "window.__cp.runPayout" },

  // Client
  { from: { role: "client", screen: "c-dash", label: "View my projects" },
    to: { kind: "route", role: "client", screen: "c-proj", label: "/app/client/c-proj" }, data: ["S.projects[PRJ-2201]"] },
  { from: { role: "client", screen: "c-proj", label: "Accept and sign off" },
    to: { kind: "action", label: "state → Signed off + invoice created" },
    data: ["S.projects[PRJ-2201]", "S.invoices"], trigger: "window.__cp.signOff" },

  // Admin
  { from: { role: "admin", screen: "x-exc", label: "Go to allocation" },
    to: { kind: "route", role: "ops", screen: "o-unalloc", label: "/app/ops/o-unalloc" },
    data: ["S.exceptions", "S.projects"] },
];

const DATA_SOURCES: { name: string; desc: string; drives: string[] }[] = [
  { name: "S.projects", desc: "Master project record — id, customer, milestones, RAG, dependencies, findings, invoiced flag",
    drives: ["p-del", "p-earn", "o-board", "o-proj", "o-unalloc", "d-assign", "d-report", "c-proj", "a-inv"] },
  { name: "S.opps", desc: "Registered leads/deals with AI score, stage, lock date",
    drives: ["p-dash", "p-pipe"] },
  { name: "S.credit + S.ledger", desc: "Partner credit wallet, running balance, all issued/consumed/reserved entries",
    drives: ["p-dash", "a-cred"] },
  { name: "S.invoices", desc: "Invoice queue with status, amounts, ageing",
    drives: ["a-inv", "p-earn"] },
  { name: "S.payout", desc: "Accrued / approved / paid amounts + payout run status",
    drives: ["p-dash", "p-earn", "a-pay"] },
  { name: "S.partners", desc: "Channel partner scorecard — score, band, revenue, credit utilisation",
    drives: ["p-score", "s-qual", "s-cov"] },
  { name: "S.people", desc: "Consultant utilisation matrix (5 weeks × 5 people)",
    drives: ["o-res", "o-board (charts)"] },
  { name: "S.escal", desc: "Escalation register with level, owner, open-since",
    drives: ["o-esc"] },
  { name: "S.effort", desc: "Per-consultant time log — feeds utilisation and true cost",
    drives: ["d-effort"] },
  { name: "S.catalog", desc: "Products/services + transfer price + MRP + credit eligibility",
    drives: ["v-cat"] },
  { name: "S.exceptions", desc: "System-generated queue of unresolvable states",
    drives: ["x-exc"] },
];

function WirePage() {
  return (
    <div style={{ background: "var(--canvas)", minHeight: "100vh" }}>
      <header style={{ padding: "18px 24px", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
        <div className="brandmark" style={{ padding: 0, border: 0, margin: 0 }}>
          <div className="logo" />
        </div>
        <div>
          <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 16 }}>Wire Connections Map</div>
          <div style={{ fontSize: 11, color: "#8DA0BB", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700 }}>
            Every button → every page → every data source
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Link to="/" className="btn-cp">← Home</Link>
        <Link to="/app/$role/$screen" params={{ role: "partner", screen: "p-dash" }} className="btn-cp pri">
          Enter workspace →
        </Link>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 22px 80px" }}>

        {/* Legend */}
        <div className="card-cp" style={{ marginBottom: 20 }}>
          <h3>How to read this map</h3>
          <div className="sub">
            The platform has 24 screens across 8 roles. Every clickable element on those screens is one row below.
            Each row shows: which button, where it takes you (or what it changes), and which piece of the shared data model it reads or writes.
          </div>
          <div className="legend" style={{ marginTop: 8 }}>
            <span><i style={{ background: "var(--brand)" }} />Route — real page redirect (URL changes)</span>
            <span><i style={{ background: "var(--warn)" }} />Action — mutates data + toast (in place)</span>
            <span><i style={{ background: "var(--gold)" }} />Data source — S.* record backing the row</span>
          </div>
        </div>

        {/* SVG connection canvas — the actual wire diagram with lines */}
        <div className="card-cp" style={{ marginBottom: 20 }}>
          <h3>Connection canvas</h3>
          <div className="sub">Roles on the left, screens in the middle, data sources on the right. Every line is a real wire in the app.</div>
          <ConnectionCanvas />
        </div>

        {/* Visual role → screen node graph */}
        <div className="card-cp" style={{ marginBottom: 20 }}>
          <h3>Role → Screen graph</h3>
          <div className="sub">Every screen the role can open from the sidebar</div>
          <RoleScreenGraph />
        </div>


        {/* Data source → screens */}
        <div className="card-cp" style={{ marginBottom: 20 }}>
          <h3>Data source → screens</h3>
          <div className="sub">Which S.* collection powers which screen. Change the source once, all rows update.</div>
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="cp" style={{ minWidth: 700 }}>
              <thead>
                <tr><th>Source</th><th>Description</th><th>Feeds screens</th></tr>
              </thead>
              <tbody>
                {DATA_SOURCES.map(d => (
                  <tr key={d.name}>
                    <td><span className="mono" style={{ color: "var(--brand-ink)" }}>{d.name}</span></td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{d.desc}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {d.drives.map(s => <ScreenChip key={s} id={s} />)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wire table */}
        <div className="card-cp">
          <h3>Button → destination → data</h3>
          <div className="sub">One row per meaningful click in the app. Click any destination chip to open that screen.</div>
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="cp" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>On screen</th>
                  <th>Button</th>
                  <th>→ Kind</th>
                  <th>→ Destination</th>
                  <th>Reads / writes</th>
                </tr>
              </thead>
              <tbody>
                {WIRES.map((w, i) => (
                  <tr key={i}>
                    <td><span className="pill p-info">{ROLES[w.from.role].label}</span></td>
                    <td><ScreenChip id={w.from.screen} /></td>
                    <td style={{ fontWeight: 600 }}>{w.from.label}</td>
                    <td>
                      <span className={`pill ${w.to.kind === "route" ? "p-info" : w.to.kind === "action" ? "p-warn" : "p-mute"}`}>
                        {w.to.kind}
                      </span>
                    </td>
                    <td>
                      {w.to.kind === "route" && w.to.role && w.to.screen
                        ? <ScreenChip id={w.to.screen} role={w.to.role} ctx={w.to.ctx} label={w.to.label} />
                        : <span className="mono" style={{ color: "var(--warn)" }}>{w.to.label}</span>}
                      {w.trigger && (
                        <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4 }}>
                          <span className="mono">{w.trigger}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {w.data.map(d => (
                          <span key={d} className="mono" style={{ fontSize: 10.5, background: "var(--gold-soft)", color: "#7A5410", padding: "2px 7px", borderRadius: 6 }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenChip({ id, role, ctx, label }: { id: string; role?: RoleKey; ctx?: string; label?: string }) {
  const title = SCREEN_TITLES[id] || id;
  // Guess role from screen prefix if not supplied.
  const r: RoleKey = role || (
    id.startsWith("p-") ? "partner" : id.startsWith("s-") ? "sales" :
    id.startsWith("o-") ? "ops" : id.startsWith("d-") ? "delivery" :
    id.startsWith("a-") ? "accounts" : id.startsWith("c-") ? "client" :
    id.startsWith("x-") ? "admin" : "vendor"
  );
  const href = `/app/${r}/${id}${ctx ? "?ctx=" + ctx : ""}`;
  return (
    <a href={href} className="mono"
      style={{ display: "inline-block", background: "var(--brand-soft)", color: "var(--brand-ink)",
        padding: "3px 9px", borderRadius: 6, fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>
      {label || title}
    </a>
  );
}

function RoleScreenGraph() {
  const roles = Object.keys(ROLES) as RoleKey[];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginTop: 12 }}>
      {roles.map(k => {
        const r = ROLES[k];
        return (
          <div key={k} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, background: "var(--surface-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#2B59FF,#6E7BFF)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 11 }}>
                {r.who[0]}
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13 }}>{r.label}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {r.nav.flatMap(([, items]) => items).map(([id, label]) => (
                <a key={id} href={`/app/${k}/${id}`}
                  style={{ fontSize: 12, color: "var(--text)", textDecoration: "none",
                    padding: "6px 9px", borderRadius: 7, background: "#fff", border: "1px solid var(--line)",
                    display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>{label}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>{id}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   ConnectionCanvas — three columns of nodes with SVG bezier
   lines wiring Role → Screen → Data source.
   ============================================================ */
function ConnectionCanvas() {
  const roles = Object.keys(ROLES) as RoleKey[];

  // Collect distinct screens in the same order roles present them.
  const screenSet: string[] = [];
  const roleToScreens: Record<string, string[]> = {};
  roles.forEach(r => {
    const list = ROLES[r].nav.flatMap(([, items]) => items.map(([id]) => id));
    roleToScreens[r] = list;
    list.forEach(s => { if (!screenSet.includes(s)) screenSet.push(s); });
  });

  // screen → data sources (invert DATA_SOURCES.drives)
  const screenToData: Record<string, string[]> = {};
  DATA_SOURCES.forEach(d => {
    d.drives.forEach(s => {
      const key = s.split(" ")[0]; // strip suffix like "(charts)"
      (screenToData[key] ||= []).push(d.name);
    });
  });

  // Layout
  const W = 1100;
  const rowH = 34;
  const gap = 8;
  const colX = { role: 20, screen: 460, data: 900 };
  const nodeW = { role: 180, screen: 260, data: 190 };
  const H = Math.max(roles.length, screenSet.length, DATA_SOURCES.length) * (rowH + gap) + 40;

  const roleY = (i: number) => 24 + i * (rowH + gap) + rowH / 2;
  const screenY = (i: number) => 24 + i * (rowH + gap) + rowH / 2;
  const dataY = (i: number) => 24 + i * (rowH + gap) + rowH / 2;

  const screenIdx: Record<string, number> = {};
  screenSet.forEach((s, i) => (screenIdx[s] = i));
  const dataIdx: Record<string, number> = {};
  DATA_SOURCES.forEach((d, i) => (dataIdx[d.name] = i));

  // Build lines
  const roleLines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  roles.forEach((r, ri) => {
    roleToScreens[r].forEach(s => {
      roleLines.push({
        x1: colX.role + nodeW.role, y1: roleY(ri),
        x2: colX.screen, y2: screenY(screenIdx[s]),
        key: `${r}-${s}`,
      });
    });
  });

  const dataLines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  screenSet.forEach(s => {
    (screenToData[s] || []).forEach(dn => {
      if (dataIdx[dn] === undefined) return;
      dataLines.push({
        x1: colX.screen + nodeW.screen, y1: screenY(screenIdx[s]),
        x2: colX.data, y2: dataY(dataIdx[dn]),
        key: `${s}-${dn}`,
      });
    });
  });

  const roleColor = (r: RoleKey) => ({
    partner: "#2B59FF", sales: "#6E7BFF", ops: "#12A46A", delivery: "#0EA5E9",
    accounts: "#D99A24", client: "#E88A0C", admin: "#E0483B", vendor: "#8B5CF6",
  } as Record<RoleKey, string>)[r];

  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = (x2 - x1) * 0.5;
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  };

  return (
    <div style={{ overflowX: "auto", marginTop: 14, background: "linear-gradient(180deg,#F7F9FC, #EEF2F7)", borderRadius: 12, padding: 12 }}>
      <svg width={W} height={H} style={{ display: "block", minWidth: W }}>
        <defs>
          <linearGradient id="wireA" x1="0" x2="1">
            <stop offset="0%" stopColor="#2B59FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6E7BFF" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="wireB" x1="0" x2="1">
            <stop offset="0%" stopColor="#D99A24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E88A0C" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* column headers */}
        <text x={colX.role} y={16} fontSize="10" fontWeight="700" fill="#5B6B7E" letterSpacing="1">ROLES</text>
        <text x={colX.screen} y={16} fontSize="10" fontWeight="700" fill="#5B6B7E" letterSpacing="1">SCREENS</text>
        <text x={colX.data} y={16} fontSize="10" fontWeight="700" fill="#5B6B7E" letterSpacing="1">DATA SOURCES</text>

        {/* wires first (behind nodes) */}
        {roleLines.map(l => (
          <path key={l.key} d={curve(l.x1, l.y1, l.x2, l.y2)} stroke="url(#wireA)" strokeWidth="1.5" fill="none" />
        ))}
        {dataLines.map(l => (
          <path key={l.key} d={curve(l.x1, l.y1, l.x2, l.y2)} stroke="url(#wireB)" strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
        ))}

        {/* role nodes */}
        {roles.map((r, i) => (
          <g key={r}>
            <rect x={colX.role} y={roleY(i) - rowH / 2} width={nodeW.role} height={rowH} rx={9}
              fill="#0B1A2E" stroke={roleColor(r)} strokeWidth="1.5" />
            <circle cx={colX.role + 16} cy={roleY(i)} r={6} fill={roleColor(r)} />
            <text x={colX.role + 30} y={roleY(i) + 4} fontSize="12" fontWeight="700" fill="#fff" fontFamily="Space Grotesk">
              {ROLES[r].label}
            </text>
            <text x={colX.role + nodeW.role - 10} y={roleY(i) + 4} fontSize="10" fill="#8DA0BB" textAnchor="end">
              {roleToScreens[r].length} screens
            </text>
          </g>
        ))}

        {/* screen nodes */}
        {screenSet.map((s, i) => {
          const owningRole = (Object.keys(roleToScreens) as RoleKey[]).find(r => roleToScreens[r].includes(s)) || "partner";
          return (
            <g key={s} style={{ cursor: "pointer" }} onClick={() => (window.location.href = `/app/${owningRole}/${s}`)}>
              <rect x={colX.screen} y={screenY(i) - rowH / 2} width={nodeW.screen} height={rowH} rx={9}
                fill="#fff" stroke="var(--line)" strokeWidth="1" />
              <rect x={colX.screen} y={screenY(i) - rowH / 2} width={4} height={rowH} rx={2} fill={roleColor(owningRole)} />
              <text x={colX.screen + 14} y={screenY(i) + 4} fontSize="11.5" fontWeight="600" fill="#0E1C2B">
                {SCREEN_TITLES[s] || s}
              </text>
              <text x={colX.screen + nodeW.screen - 10} y={screenY(i) + 4} fontSize="10" fill="#8A98A8" textAnchor="end" fontFamily="Space Grotesk">
                {s}
              </text>
            </g>
          );
        })}

        {/* data nodes */}
        {DATA_SOURCES.map((d, i) => (
          <g key={d.name}>
            <rect x={colX.data} y={dataY(i) - rowH / 2} width={nodeW.data} height={rowH} rx={9}
              fill="#FBF1DD" stroke="#D99A24" strokeWidth="1" />
            <text x={colX.data + 12} y={dataY(i) + 4} fontSize="11.5" fontWeight="700" fill="#7A5410" fontFamily="Space Grotesk">
              {d.name}
            </text>
          </g>
        ))}
      </svg>
      <div className="legend" style={{ marginTop: 10 }}>
        <span><i style={{ background: "#2B59FF" }} />Solid line — role opens screen from its sidebar</span>
        <span><i style={{ background: "#D99A24" }} />Dashed line — screen reads/writes this data source</span>
        <span className="faint">Click any screen node to open it</span>
      </div>
    </div>
  );
}
