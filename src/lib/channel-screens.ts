// Screen renderers ported from the wireframe.
// Each returns an HTML string that gets injected via dangerouslySetInnerHTML.
// Nav happens via <Link> on the shell; in-page action buttons call window.__cp.* handlers.

import { S, ROLES, money, lakh, prj, type RoleKey } from "./channel-data";

const head = (t: string, s: string) =>
  `<div class="phead"><div><h1>${t}</h1><p>${s}</p></div><div class="sp"></div></div>`;
const kpi = (k: string, v: string, d: string) =>
  `<div class="card-cp kpi"><div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div></div>`;
const feed = (kind: string, t: string, s: string) => {
  const c: Record<string, string> = { good: "var(--good)", warn: "var(--warn)", bad: "var(--danger)", info: "var(--brand)" };
  return `<div class="row" style="align-items:flex-start;flex-wrap:nowrap"><span style="width:7px;height:7px;border-radius:50%;background:${c[kind]};margin-top:6px;flex:none"></span>
    <div><b style="font-size:12.5px">${t}</b><div class="faint">${s}</div></div></div>`;
};
const ragPill = (p: any) => p.state === "Signed off" ? '<span class="pill p-good">Signed off</span>'
  : p.state === "At risk" ? '<span class="pill p-bad">At risk</span>'
  : p.state === "Awaiting allocation" ? '<span class="pill p-warn">Awaiting allocation</span>'
  : p.state === "Under review" ? '<span class="pill p-info">Under review</span>'
  : p.state === "Report delivered" ? '<span class="pill p-info">Report delivered</span>'
  : '<span class="pill p-good">In progress</span>';

const table = (cols: string[], rows: (string | number)[][], mark?: string) =>
  `<table class="cp"><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>
  ${rows.map(r => {
    const t = mark && (String(r[0]).includes("PRJ-2201") || String(r[1]).includes("Kohinoor") || String(r[0]).includes("PRJ-2210"));
    return `<tr class="${t ? "trace" : ""}">${r.map(c => `<td>${c}</td>`).join("")}</tr>`;
  }).join("")}</tbody></table>`;

// Buttons that route: emit href-based anchors so they behave like real redirects.
const linkBtn = (role: RoleKey, screen: string, label: string, cls = "btn-cp sm", ctx?: string) =>
  `<a class="${cls}" href="/app/${role}/${screen}${ctx ? "?ctx=" + ctx : ""}">${label}</a>`;

// Action buttons: call global window handler (mutates S then re-renders route).
const actBtn = (fn: string, args: string, label: string, cls = "btn-cp sm") =>
  `<button class="${cls}" onclick="window.__cp.${fn}(${args})">${label}</button>`;

const projTable = (list: any[], _ctx: string) =>
  table(
    ["Project", "Customer", "Line", "Status", "Progress", "Owner", "Window", "Value", ""],
    list.map(p => [
      `<span class="mono">${p.id}</span>`,
      `<b>${p.cust}</b><div class="faint">${p.what}</div>`,
      p.line, ragPill(p),
      `<div class="bar ${p.rag}" style="width:80px"><span style="width:${p.pct}%"></span></div>`,
      p.pm || '<span class="pill p-warn">unassigned</span>',
      p.start + " → " + p.end,
      money(p.val),
      `<a class="btn-cp sm" href="/app/ops/o-proj?ctx=${p.id}">Open</a>`,
    ]),
    "trace"
  );

type Ctx = { role: RoleKey; ctx?: string };
type Renderer = (c: Ctx) => string;

export const V: Record<string, Renderer> = {

  // ---- PARTNER ----
  "p-dash": () => {
    const c = S.credit;
    return head("Good morning, Amit", "Everything you sold, everything being delivered, everything you have earned — on one screen.") + `
    <div class="grid-cp g4">
      ${kpi("Credit available", lakh(c.avail), `of ${lakh(c.issued)} issued · expires ${c.expires}`)}
      ${kpi("Open pipeline", lakh(S.opps.reduce((a, o) => a + o.val, 0)), "3 deals in flight")}
      ${kpi("In delivery", lakh(1440000), "2 live projects · 1 at risk")}
      ${kpi("Earnings pending", lakh(S.payout.accrued), "accrued, awaiting payout run")}
    </div>
    <div class="grid-cp g21" style="margin-top:14px">
      <div class="card-cp"><h3>Credit wallet</h3><div class="sub">₹2,00,000 invested · 10× multiplier · six-month validity</div>
        <div class="bar" style="height:11px"><span style="width:62%"></span></div>
        <div class="split" style="margin-top:9px;font-size:12px">
          <span>Consumed <b>${lakh(c.consumed)}</b></span><span class="muted">Reserved ${lakh(c.reserved)}</span>
          <span class="muted">Available <b style="color:var(--good)">${lakh(c.avail)}</b></span>
        </div>
        <div class="note" style="margin-top:12px">113 days left on validity. At your current burn you will finish the tier with about ₹1.2 L unused — top up or push the Sahyadri deal to consume it.</div>
        <div class="row" style="margin-top:12px">
          ${linkBtn("partner", "p-earn", "See earnings →")}
          ${linkBtn("accounts", "a-cred", "Open credit ledger →")}
        </div>
      </div>
      <div class="card-cp"><h3>Today</h3><div class="sub">Pushed to you, not requested</div>
        <div class="stack" style="font-size:12.5px">
          ${feed("bad", "PRJ-2204 is at risk", "Sahyadri ISO — asset inventory outstanding 19 days")}
          ${feed("warn", "Sign-off pending", "Meridian Fintech — 2 days since report handover")}
          ${feed("good", "Report delivered", "Kohinoor web testing complete, API in progress")}
          ${feed("info", "Credit reserved", "₹3.20 L held against OPP-1051")}
        </div></div>
    </div>
    <div class="card-cp" style="margin-top:14px"><div class="split"><h3>Live deliveries for my customers</h3>
      ${linkBtn("partner", "p-del", "Open all", "btn-cp pri sm")}</div>
      <div class="sub">The screen that did not exist before — sales stopped here, the customer did not.</div>
      ${projTable(S.projects.filter(p => p.partner === "Amit Deshpande"), "partner")}
    </div>
    <div id="cp-chart-slot-partner"></div>`;
  },

  "p-pipe": () => head("Leads & pipeline", "Registered, locked to you, and scored.") + `
    <div class="card-cp">${table(
      ["Deal", "Customer", "What", "Value", "Stage", "AI score", "Lock expires", ""],
      S.opps.map(o => [
        `<span class="mono">${o.id}</span>`, `<b>${o.cust}</b>`, o.what, money(o.val),
        `<span class="pill p-info">${o.stage}</span>`, `<b>${o.score}</b>`, o.lock,
        linkBtn("partner", "p-del", "Track"),
      ])
    )}
    <div class="note" style="margin-top:12px">OPP-1063 is with Operations for effort sizing. You will get a person-day estimate and the earliest realistic start date before you quote — so you never sell a date delivery cannot hold.</div>
    </div>`,

  "p-del": () => {
    const mine = S.projects.filter(p => p.partner === "Amit Deshpande");
    return head("My deliveries", "Live status on every deal you closed. No phone call needed.") + `
    <div class="grid-cp g3">${mine.map(p => `
      <div class="card-cp" style="border-left:4px solid ${p.rag === "red" ? "var(--danger)" : p.rag === "amber" ? "var(--warn)" : "var(--good)"}${p.trace ? ";box-shadow:0 0 0 2px var(--gold)" : ""}">
        <div class="split"><span class="mono">${p.id}</span>${ragPill(p)}</div>
        <h3 style="margin-top:8px">${p.cust}</h3><div class="sub">${p.what}</div>
        <div class="bar ${p.rag}"><span style="width:${p.pct}%"></span></div>
        <div class="split muted" style="margin-top:7px;font-size:11.5px">
          <span class="muted">${p.pct}% complete</span><span class="muted">${p.start} → ${p.end}</span></div>
        <div class="note" style="margin-top:11px">${p.risk ? p.risk : (p.signed ? "Signed off by customer. Invoice is with Accounts." : "Next milestone: " + ((p.ms.find(m => m.s === "now") || { t: "—" }).t))}</div>
        <div class="row" style="margin-top:11px">
          <a class="btn-cp pri sm" href="/app/ops/o-proj?ctx=${p.id}">Open detail</a>
          ${actBtn("escalate", `'${p.cust}'`, "Escalate")}
        </div>
      </div>`).join("")}</div>
    <div class="note" style="margin-top:14px">Escalations you raise here enter the same matrix Operations works from — customer → partner → OEM, with the SLA clock visible to both sides.</div>`;
  },

  "p-earn": () => head("Earnings & payouts", "Margin, commission and what has actually reached your bank.") + `
    <div class="grid-cp g3">
      ${kpi("Accrued", money(S.payout.accrued), "delivered, not yet invoiced or realised")}
      ${kpi("Approved", money(S.payout.approved), "in the next payout run")}
      ${kpi("Paid this year", money(S.payout.paid), "across 5 closed deals")}
    </div>
    <div class="card-cp" style="margin-top:14px"><h3>Traced to source</h3>
      <div class="sub">Every number here clicks through to a ledger entry or an invoice. Disputes end when both sides read the same record.</div>
      ${table(["Deal", "Customer", "Order value", "Your margin", "Status", "Trigger", ""], [
        ['<span class="mono">PRJ-2198</span>', "Meridian Fintech", money(560000), money(84000),
          S.projects.find(p => p.id === "PRJ-2198")!.invoiced ? '<span class="pill p-info">Invoice raised</span>' : '<span class="pill p-warn">Awaiting invoice</span>',
          "Sign-off complete", linkBtn("accounts", "a-inv", "See invoice")],
        ['<span class="mono">PRJ-2201</span>', "Kohinoor Textiles", money(460000), money(69000), '<span class="pill p-mute">In delivery</span>', "On sign-off",
          `<a class="btn-cp sm" href="/app/ops/o-proj?ctx=PRJ-2201">Track</a>`],
        ['<span class="mono">PRJ-2185</span>', "Bluewave Logistics", money(145000), money(21750), '<span class="pill p-bad">Payment overdue</span>', "On realisation",
          linkBtn("accounts", "a-inv", "Chase")],
      ])}
    </div>`,

  "p-score": () => {
    const m = S.partners[0];
    return head("My scorecard", "You can see exactly why you are where you are. A hidden score would build the mistrust this platform exists to remove.") + `
    <div class="grid-cp g21"><div class="card-cp">
      <div class="split"><div><div class="k faint">Quality score</div><div class="big" style="font-size:38px">${m.sc}</div></div>
        <span class="pill p-good" style="font-size:12px;padding:6px 14px">${m.b}</span></div>
      <div class="bar green" style="margin-top:10px"><span style="width:${m.sc}%"></span></div>
      <div class="legend"><span><i style="background:var(--good)"></i>Growth 75+</span><span><i style="background:var(--brand)"></i>Steady 55–74</span>
        <span><i style="background:var(--warn)"></i>Watch 35–54</span><span><i style="background:var(--danger)"></i>Review below 35</span></div>
    </div>
    <div class="card-cp"><h3>To reach Growth</h3><div class="sub">Two things, both in your control</div>
      <div class="stack" style="font-size:12.5px">
        ${feed("warn", "Credit utilisation 62%", "Network median is 74% at this point in the tier")}
        ${feed("warn", "Asset Sync course incomplete", "You are quoting a line you are not certified on")}
      </div></div></div>
    <div class="card-cp" style="margin-top:14px"><h3>Signals</h3>
    ${table(["Signal", "You", "Network median", "Reading"], [
      ["Lead conversion", "36%", "29%", '<span class="pill p-good">Above</span>'],
      ["Proposal to close", "44%", "41%", '<span class="pill p-good">Above</span>'],
      ["Credit utilisation", "62%", "74%", '<span class="pill p-warn">Below</span>'],
      ["Revenue per lead consumed", money(88571), money(64000), '<span class="pill p-good">Above</span>'],
      ["Certification currency", "4 of 6 lines", "5 of 6", '<span class="pill p-warn">Below</span>'],
      ["Delivery cooperation", "1 blocker unresolved", "0.6", '<span class="pill p-warn">Watch</span>'],
      ["Receivables ageing", "38 days on one invoice", "21 days", '<span class="pill p-bad">Below</span>'],
    ])}</div>`;
  },

  // ---- SALES ----
  "s-cov": () => head("Partner coverage", "Who owns which customer, and who sits under whom.") + `
    <div class="card-cp"><h3>Hierarchy</h3><div class="sub">Margin cascades down; visibility rolls up. Sub-partners never see the layer above.</div>
    <div style="font-size:12.5px;line-height:2">
      <div><b>Lumiverse (vendor)</b></div>
      <div style="padding-left:22px">└ <b>Zenith Networks</b> · Master distributor · Dubai <span class="pill p-info">Platinum</span></div>
      <div style="padding-left:48px">└ Gulf Cyber LLC · reseller <span class="pill p-mute">Silver</span></div>
      <div style="padding-left:22px">└ <b>Deshpande Technologies</b> · Nashik <span class="pill p-info">Gold</span> <span class="pill p-good">traced</span></div>
      <div style="padding-left:48px">└ Godavari Systems · sub-reseller <span class="pill p-mute">Silver</span></div>
      <div style="padding-left:22px">└ Orbit Consulting · Mumbai <span class="pill p-info">Gold</span></div>
      <div style="padding-left:22px">└ Sunrise IT Solutions · Pune <span class="pill p-warn">Watch</span></div>
      <div style="padding-left:22px">└ Rane Infotech · Nagpur <span class="pill p-bad">Review</span></div>
    </div></div>
    <div class="card-cp" style="margin-top:14px"><h3>Kohinoor Textiles — ownership</h3>
    <div class="sub">The traced record, from the sales side</div>
    ${table(["Customer", "Owned by", "Registered", "Lock", "Active work", "Expansion in flight", ""],
      [["<b>Kohinoor Textiles</b>", "Amit Deshpande · Deshpande Technologies", "04 Jun 2026", "Held to 12 Aug",
        '<span class="mono">PRJ-2201</span> Web & API VAPT', '<span class="mono">OPP-1042</span> ISO 27001 · ₹8.40 L',
        linkBtn("ops", "o-proj", "Track", "btn-cp pri sm", "PRJ-2201")]], "trace")}
    </div>`,




  "s-qual": () => head("Partner quality board", "Stop investing pipeline in partners who will not convert it.") + `
    <div class="card-cp">${table(
      ["Partner", "City", "Tier", "Leads", "Won", "Revenue", "Credit used", "Score", "Band", "Action"],
      S.partners.map(p => [
        `<b>${p.f}</b><div class="faint">${p.n}</div>`, p.c, p.t, p.leads, p.won, lakh(p.rev), p.util + "%",
        `<b>${p.sc}</b>`,
        `<span class="pill ${p.b === "Growth" ? "p-good" : p.b === "Steady" ? "p-info" : p.b === "Watch" ? "p-warn" : "p-bad"}">${p.b}</span>`,
        p.b === "Review" ? actBtn("suspend", `'${p.n}'`, "Suspend leads", "btn-cp danger sm")
          : p.b === "Watch" ? actBtn("coach", `'${p.f}'`, "Assign coaching")
          : '<span class="faint">—</span>',
      ])
    )}
    <div class="note" style="margin-top:12px"><b>Rane Infotech:</b> 22 leads consumed, nothing won, 8% of credit used with 26 days left on validity. This is the pattern the score exists to surface — leads going in, nothing coming out.</div></div>`,

  // ---- OPS ----
  "o-board": () => head("Delivery board", "Every project, every state, one screen.") + `
    <div class="grid-cp g4">
      ${kpi("Live projects", String(S.projects.filter(p => ["In progress", "At risk", "Under review", "Report delivered"].includes(p.state)).length), "across 4 customers")}
      ${kpi("At risk", "1", "PRJ-2204 · escalated L2")}
      ${kpi("Awaiting allocation", String(S.projects.filter(p => p.state === "Awaiting allocation").length), "oldest 31 hours — breaches the 24h rule")}
      ${kpi("On-time milestones", "78%", "target 90%")}
    </div>
    <div class="card-cp" style="margin-top:14px">${projTable(S.projects, "ops")}</div>
    <div id="cp-chart-slot-ops"></div>`,

  "o-unalloc": () => {
    const u = S.projects.filter(p => p.state === "Awaiting allocation");
    return head("Unallocated wins", "A win that has not become a project is an exception, not a to-do.") +
    (u.length
      ? `<div class="card-cp">${table(
          ["Order", "Customer", "Line", "Value", "Won", "Age", "Action"],
          u.map(p => [
            `<span class="mono">${p.id}</span>`, `<b>${p.cust}</b>`, p.line, p.val, p.won || "—",
            '<span class="pill p-bad">31h — breach</span>',
            actBtn("allocate", `'${p.id}'`, "Create project", "btn-cp pri sm"),
          ])
        )}
        <div class="note" style="margin-top:12px">Stages 07 → 08 → 09 are a single automated chain. This queue only ever holds work the system could not allocate on its own.</div></div>`
      : `<div class="card-cp"><h3>Nothing waiting</h3><div class="sub">Every won order has a project, an owner and a date.</div></div>`);
  },

  "o-proj": ({ ctx }) => {
    const p = prj(ctx || "PRJ-2201") || S.projects[0];
    return head(p.cust + " · " + p.what, `${p.id} · ${p.line} · partner ${p.partner}`) + `
    <div class="row" style="margin-bottom:14px">
      ${S.projects.filter(x => x.ms.length).map(x =>
        `<a class="btn-cp sm ${x.id === p.id ? "pri" : ""}" href="/app/ops/o-proj?ctx=${x.id}">${x.id}</a>`).join("")}
    </div>
    <div class="grid-cp g21"><div class="card-cp">
      <div class="split"><h3>Milestones</h3>${ragPill(p)}</div>
      <div class="bar ${p.rag}" style="margin:9px 0 13px"><span style="width:${p.pct}%"></span></div>
      <div class="ms">${p.ms.map(m => `<div class="it ${m.s === "done" ? "done" : m.s === "now" ? "now" : m.s === "slip" ? "slip" : ""}">
        <span class="dot"></span><div><b>${m.t}</b><small>${m.d}</small></div><span class="sp"></span>
        <span class="pill ${m.s === "done" ? "p-good" : m.s === "now" ? "p-info" : m.s === "slip" ? "p-bad" : "p-mute"}">${m.s === "done" ? "Complete" : m.s === "now" ? "In progress" : m.s === "slip" ? "Slipped" : "Planned"}</span></div>`).join("")}</div>
      ${p.state === "In progress" || p.state === "At risk" ? `<div class="row" style="margin-top:13px">
        ${linkBtn("delivery", "d-complete", "Mark testing complete &amp; request report", "btn-cp pri", p.id)}</div>` : ""}
      ${p.state === "Under review" ? `<div class="row" style="margin-top:13px">
        ${actBtn("approveReport", `'${p.id}'`, "Approve report &amp; release to customer", "btn-cp pri")}
        ${actBtn("toast", `'Sent back','Review comments recorded on v0.3'`, "Send back")}
      </div>` : ""}
      ${p.state === "Report delivered" ? `<div class="note" style="margin-top:13px">Report released. Waiting on customer sign-off — reminders at 3, 7 and 14 days. Sign-off is what releases the invoice.</div>` : ""}
    </div>
    <div class="stack">
      <div class="card-cp"><h3>Team &amp; effort</h3><div class="sub">${p.effort}</div>
        <div style="font-size:12.5px">${p.pm ? `<div class="split"><span class="muted">Project manager</span><b>${p.pm}</b></div>` : ""}
        ${p.team.map(t => `<div class="split"><span class="muted">Consultant</span><b>${t}</b></div>`).join("")}
        <div class="split"><span class="muted">Window</span><b>${p.start} → ${p.end}</b></div>
        <div class="split"><span class="muted">Order value</span><b>${money(p.val)}</b></div></div></div>
      <div class="card-cp"><h3>Customer dependencies</h3><div class="sub">Delay recorded against whoever caused it</div>
        ${p.dep.length ? p.dep.map(d => `<div class="split" style="font-size:12.5px;padding:5px 0"><span>${d.t}</span>
          <span class="pill ${d.s === "closed" ? "p-good" : "p-warn"}">${d.s}</span></div>`).join("") : '<div class="faint">None outstanding</div>'}
        ${p.risk ? `<div class="note" style="margin-top:10px;border-color:var(--danger);color:#B32D22">${p.risk}</div>` : ""}</div>
      ${p.find ? `<div class="card-cp"><h3>Findings register</h3><div class="row" style="gap:16px;margin-top:6px">
        <div><div class="big" style="color:var(--danger)">${p.find.crit}</div><div class="faint">Critical</div></div>
        <div><div class="big" style="color:var(--warn)">${p.find.high}</div><div class="faint">High</div></div>
        <div><div class="big">${p.find.med}</div><div class="faint">Medium</div></div>
        <div><div class="big" style="color:var(--faint)">${p.find.low}</div><div class="faint">Low</div></div></div></div>` : ""}
    </div></div>`;
  },

  "o-res": () => head("Resource calendar", "Allocation is a booking against a calendar, not a note in a spreadsheet.") + `
    <div class="card-cp"><h3>Utilisation · next five weeks</h3><div class="sub">Over-allocation is impossible to do by accident</div>
    <div class="heat" style="margin-top:12px">
      <div></div>${["27 Jul", "03 Aug", "10 Aug", "17 Aug", "24 Aug"].map(w => `<div class="hdr">${w}</div>`).join("")}
      ${S.people.map(p => `<div><b style="font-size:12px">${p.n}</b><div class="faint">${p.sk}</div></div>
        ${p.u.map((u: number) => `<div class="cell" style="background:${u > 100 ? "#E0483B" : u > 85 ? "#E88A0C" : u > 55 ? "#2B59FF" : "#9BB4D8"}">${u}%</div>`).join("")}`).join("")}
    </div>
    <div class="legend"><span><i style="background:#9BB4D8"></i>Available</span><span><i style="background:#2B59FF"></i>Healthy</span>
      <span><i style="background:#E88A0C"></i>Tight</span><span><i style="background:#E0483B"></i>Over-allocated</span></div>
    <div class="note" style="margin-top:12px">Priya Nair is at 105% for week of 27 Jul. Sahyadri ISO cannot recover on the current plan without a second compliance consultant — this is a hiring signal, not a scheduling problem.</div></div>`,

  "o-esc": () => head("Escalations", "Customer → partner → OEM, with the clock visible to everyone.") + `
    <div class="card-cp">${table(
      ["Ref", "Project", "Level", "Reason", "Open since", "Owner", "Action"],
      S.escal.map(e => [
        `<span class="mono">${e.id}</span>`,
        `<a class="mono" href="/app/ops/o-proj?ctx=${e.prj}">${e.prj}</a>`,
        `<span class="pill ${e.lvl === "L2" ? "p-bad" : "p-warn"}">${e.lvl}</span>`,
        e.what, e.since, e.own,
        actBtn("raiseL3", `'${e.prj}'`, "Raise to L3", "btn-cp danger sm"),
      ])
    )}
    <div class="note" style="margin-top:12px">L1 delay · L2 at risk · L3 critical. Only internal holds count against our SLA; the 19 days on Sahyadri sit against the customer and are recorded as such.</div></div>`,

  // ---- DELIVERY ----
  "d-assign": () => head("My assignments", "Scope, dates and a customer contact. No commercials — they are not your problem.") + `
    <div class="grid-cp g2">
      <div class="card-cp" style="box-shadow:0 0 0 2px var(--gold)"><div class="split"><span class="mono">PRJ-2201</span>${ragPill(prj("PRJ-2201"))}</div>
        <h3 style="margin-top:8px">Kohinoor Textiles</h3><div class="sub">Web &amp; API VAPT · 4 applications, 2 API sets</div>
        <div class="ms">${prj("PRJ-2201")!.ms.slice(2, 5).map(m => `<div class="it ${m.s === "done" ? "done" : m.s === "now" ? "now" : ""}">
          <span class="dot"></span><div><b>${m.t}</b><small>${m.d}</small></div></div>`).join("")}</div>
        <div class="note" style="margin-top:11px">Blocked item: test accounts for the role matrix have not arrived. Logged against the customer — your clock is not running on it.</div>
        <div class="row" style="margin-top:11px">
          ${linkBtn("delivery", "d-effort", "Log effort", "btn-cp pri sm")}
          ${linkBtn("delivery", "d-report", "Open report")}
        </div></div>
      <div class="card-cp"><div class="split"><span class="mono">PRJ-2214</span><span class="pill p-mute">Scheduled</span></div>
        <h3 style="margin-top:8px">Meridian Fintech</h3><div class="sub">Mobile app VAPT · starts 04 Aug</div>
        <div class="note" style="margin-top:11px">Prerequisites open: signed build, test device, staging API key. Kickoff call booked 01 Aug.</div></div>
    </div>`,

  "d-effort": () => head("Effort & evidence", "Time booked against tasks. This is what utilisation and true project cost are built from.") + `
    <div class="card-cp"><div class="split"><h3>Effort log · PRJ-2201</h3>
      ${linkBtn("delivery", "d-log", "Log time", "btn-cp pri sm", "PRJ-2201")}</div>
      ${table(["Date", "Consultant", "Task", "Hours"], S.effort.map(e => [e.d, e.who, e.t, e.h]))}
      <div class="split" style="margin-top:10px;font-size:12.5px"><span class="muted">Booked to date</span>
        <b>${S.effort.reduce((a, e) => a + e.h, 0) + 128} hours · 18 of 24 person-days</b></div></div>
    <div class="card-cp" style="margin-top:14px"><h3>Evidence</h3><div class="sub">Attached to findings, versioned, never emailed</div>
    ${table(["Item", "Finding", "Uploaded"], [
      ["auth-bypass-poc.png", "SQLi on /api/v2/orders — Critical", "22 Jul"],
      ["jwt-none-alg.har", "JWT algorithm confusion — Critical", "21 Jul"],
      ["idor-sequence.mp4", "IDOR on invoice export — High", "21 Jul"],
    ])}</div>`,

  "d-report": () => {
    const p = prj("PRJ-2201")!;
    return head("Report workspace", "Draft, internal review, then the customer. Never the other way round.") + `
    <div class="card-cp"><div class="split"><h3>Kohinoor Textiles — Web &amp; API VAPT</h3>
      <span class="pill ${p.state === "Under review" ? "p-info" : p.state === "Report delivered" ? "p-good" : "p-mute"}">${p.state === "In progress" ? "Draft v0.3" : p.state}</span></div>
    <div class="sub">27 findings · 3 critical, 7 high, 11 medium, 6 low</div>
    ${table(["Version", "Author", "Change", "Date"], [
      ["v0.3", "Sneha Patil", "API findings added, executive summary drafted", "22 Jul"],
      ["v0.2", "Sneha Patil", "Web application findings complete", "18 Jul"],
      ["v0.1", "Sneha Patil", "Template and scope section", "07 Jul"],
    ])}
    <div class="row" style="margin-top:13px">
      ${p.state === "In progress" || p.state === "At risk" ? actBtn("submitReport", `'PRJ-2201'`, "Submit for internal review", "btn-cp pri") : ""}
      ${p.state === "Under review" ? `<span class="note" style="flex:1">With Rohit Kale for review. You will get comments or a release notification.</span>` : ""}
      ${p.state === "Report delivered" || p.state === "Signed off" ? `<span class="note" style="flex:1">Released to the customer through the partner. Retest scheduled 07 Aug.</span>` : ""}
    </div></div>`;
  },

  // ---- ACCOUNTS ----
  "a-inv": () => head("Invoice queue", "Sign-off is the trigger. Nothing gets invoiced from memory.") + `
    <div class="grid-cp g4">
      ${kpi("Ready to raise", money(S.invoices.filter(i => i.st === "Ready to raise").reduce((a, i) => a + (typeof i.amt === "number" ? i.amt : 0), 0)), "released by customer sign-off")}
      ${kpi("Outstanding", money(375000), "across 3 invoices")}
      ${kpi("Overdue", money(145000), "38 days · INV-4361")}
      ${kpi("Credit liability", lakh(3120000), "issued and unconsumed, all partners")}
    </div>
    <div class="card-cp" style="margin-top:14px">${table(
      ["Invoice", "Customer", "Project", "Amount", "Status", "Note", "Action"],
      S.invoices.map(i => [
        `<span class="mono">${i.id}</span>`, `<b>${i.cust}</b>`,
        `<a class="mono" href="/app/ops/o-proj?ctx=${i.prj}">${i.prj}</a>`,
        money(i.amt),
        `<span class="pill ${i.st === "Ready to raise" ? "p-warn" : i.st === "Overdue" ? "p-bad" : i.st === "Raised" ? "p-info" : "p-mute"}">${i.st}</span>`, i.age,
        i.st === "Ready to raise" ? linkBtn("accounts", "a-raise", "Raise invoice", "btn-cp pri sm", i.id)
          : i.st === "Overdue" ? linkBtn("accounts", "a-chase", "Chase", "btn-cp danger sm", i.id)
          : '<span class="faint">—</span>',
      ])
    )}</div>`,

  "a-cred": () => head("Credit ledger", "Every entry carries a timestamp, an actor and a running balance.") + `
    <div class="card-cp"><div class="split"><h3>Amit Deshpande · Deshpande Technologies</h3>
      <span class="pill p-info">Gold · 10× · valid to 13 Nov 2026</span></div>
    ${table(["Date", "Entry", "Reference", "Amount", "Balance"], S.ledger.map(l => [
      l.d,
      `<span class="pill ${l.t === "Issued" ? "p-good" : l.t === "Reserved" ? "p-warn" : "p-mute"}">${l.t}</span>`, l.ref,
      `<b style="color:${l.amt < 0 ? "var(--danger)" : "var(--good)"}">${l.amt < 0 ? "−" : "+"}${money(Math.abs(l.amt))}</b>`,
      money(l.bal),
    ]))}
    <div class="note" style="margin-top:12px">Partial redemption and split billing (credit plus cash) are ordinary entries here, not exceptions. Reversals are admin-only and carry a reason code.</div></div>
    <div class="card-cp" style="margin-top:14px"><h3>Expiring soon</h3>
    ${table(["Partner", "Issued", "Used", "Lapses in", "Flag"], [
      ["Vikram Rane · Rane Infotech", lakh(1000000), "8%", "26 days", '<span class="pill p-bad">Review band</span>'],
      ["Rakesh Malviya · Sunrise IT", lakh(1000000), "11%", "41 days", '<span class="pill p-warn">Watch band</span>'],
      ["Amit Deshpande", lakh(2000000), "62%", "113 days", '<span class="pill p-good">On track</span>'],
    ])}</div>
    <div id="cp-chart-slot-cred"></div>`,

  "a-pay": () => head("Payout run", "Calculated from the incentive rules, not from a spreadsheet.") + `
    <div class="card-cp"><div class="split"><h3>Run for 31 July 2026</h3>
      ${actBtn("runPayout", "", "Approve &amp; release run", "btn-cp pri sm")}</div>
    ${table(["Partner", "Basis", "Deals", "Amount", "Status"], [
      ["Amit Deshpande", "Margin on realised invoices", "2", money(S.payout.approved),
        S.payoutDone ? '<span class="pill p-good">Released</span>' : '<span class="pill p-warn">Approved, pending release</span>'],
      ["Fatima Sheikh", "Margin + distributor layer", "5", "₹2,14,000",
        S.payoutDone ? '<span class="pill p-good">Released</span>' : '<span class="pill p-warn">Approved, pending release</span>'],
      ["Sanjana Kulkarni", "Referral commission", "1", "₹18,500",
        S.payoutDone ? '<span class="pill p-good">Released</span>' : '<span class="pill p-warn">Approved, pending release</span>'],
    ])}
    <div class="note" style="margin-top:12px"><b>Open decision:</b> this run releases margin on <i>realised</i> invoices. Releasing on invoice raised is far more attractive to partners and materially riskier for us — section 17 of the document.</div></div>`,

  // ---- CLIENT ----
  "c-dash": () => head("Kohinoor Textiles", "Everything about you. Nothing about the channel behind you.") + `
    <div class="grid-cp g4">
      ${kpi("Health score", "62", "up from 54 at last assessment")}
      ${kpi("Active projects", "1", "Web & API VAPT")}
      ${kpi("Renewals in 90 days", "2", "EDR licences, AMC")}
      ${kpi("Open invoices", money(230000), "due 01 Aug")}
    </div>
    <div class="card-cp" style="margin-top:14px"><h3>Recommended next</h3>
    <div class="sub">Based on your industry, size and current findings — presented by your partner</div>
    ${table(["Service", "Why", "Indicative"], [
      ["ISO 27001 implementation", "Compliance gaps flagged in this assessment", "₹9.80 L"],
      ["SIEM (managed)", "No central log monitoring detected", "₹4.20 L / year"],
      ["Email security", "Phishing exposure on 3 of 4 tested domains", "₹1.10 L / year"],
    ])}
    <div class="row" style="margin-top:12px">${linkBtn("client", "c-proj", "View my projects", "btn-cp pri sm")}</div></div>`,

  "c-proj": () => {
    const p = prj("PRJ-2201")!;
    return head("My projects", "Milestone progress, and what you owe us before we can move.") + `
    <div class="card-cp" style="box-shadow:0 0 0 2px var(--gold)"><div class="split"><h3>Web &amp; API VAPT</h3>${ragPill(p)}</div>
    <div class="sub">Delivered by Deshpande Technologies · ${p.start} → ${p.end}</div>
    <div class="bar ${p.rag}" style="margin:10px 0"><span style="width:${p.pct}%"></span></div>
    <div class="ms" style="margin-top:8px">${p.ms.map(m => `<div class="it ${m.s === "done" ? "done" : m.s === "now" ? "now" : ""}">
      <span class="dot"></span><div><b>${m.t}</b><small>${m.d}</small></div></div>`).join("")}</div>
    </div>
    <div class="card-cp" style="margin-top:14px"><h3>Waiting on you</h3>
    <div class="sub">Two open items. Each one pauses the schedule.</div>
    ${table(["Item", "Requested", "Due", "Status"], [
      ["Test accounts for the role matrix", "18 Jul", "24 Jul", '<span class="pill p-warn">Open</span>'],
      ["Staging environment credentials", "06 Jul", "08 Jul", '<span class="pill p-good">Provided</span>'],
    ])}</div>
    ${p.state === "Report delivered" ? `<div class="card-cp" style="margin-top:14px;border-left:4px solid var(--good)">
      <h3>Report ready for sign-off</h3><div class="sub">27 findings · retest included</div>
      ${actBtn("signOff", `'PRJ-2201'`, "Accept and sign off", "btn-cp pri")}</div>` : ""}
    <div class="card-cp" style="margin-top:14px"><div class="split"><h3>Asset Sync deployment</h3>
      ${prj("PRJ-2198")!.invoiced ? '<span class="pill p-info">Invoiced</span>' : '<span class="pill p-good">Signed off</span>'}</div>
      <div class="sub">Completed 18 Jul · signed off 21 Jul</div></div>`;
  },

  // ---- ADMIN / VENDOR ----
  "x-over": () => head("Platform overview", "The whole ecosystem, one altitude up.") + `
    <div class="grid-cp g4">
      ${kpi("ARR", lakh(48600000), "+18% quarter on quarter")}
      ${kpi("Active partners", "37", "of 52 onboarded")}
      ${kpi("Credit liability", lakh(3120000), "issued and unconsumed")}
      ${kpi("Delivery load", "14", "live projects · 78% on-time")}
    </div>
    <div class="grid-cp g2" style="margin-top:14px">
      <div class="card-cp"><h3>Margin by revenue line</h3>
      ${table(["Line", "Revenue", "Delivery cost", "Margin"], [
        ["Services · red", lakh(1840000), lakh(760000), "59%"],
        ["Services · purple", lakh(1420000), lakh(690000), "51%"],
        ["Tools / SI", lakh(1120000), lakh(310000), "72%"],
        ["Licences", lakh(680000), lakh(0), "31%"],
        ["Staff aug", lakh(940000), lakh(620000), "34%"],
      ])}</div>
      <div class="card-cp"><h3>Where deals stall</h3>
      <div class="stack" style="margin-top:8px">
        ${feed("warn", "Win → project creation", "Median 9 hours. One breach open right now.")}
        ${feed("bad", "Sign-off → invoice", "Median 4.2 days. Target is same day.")}
        ${feed("warn", "Customer dependencies", "31% of all delay days sit with customers, not us.")}
        ${feed("good", "Effort estimate turnaround", "1.4 days against a 2-day target.")}
      </div></div>
    </div>
    <div id="cp-chart-slot-admin"></div>`,

  "x-exc": () => head("Exceptions queue", "The things the system could not resolve on its own.") + `
    <div class="card-cp">${table(
      ["Exception", "Detail", "Severity", "Action"],
      S.exceptions.map(e => [
        `<b>${e.k}</b>`, e.d,
        `<span class="pill ${e.sev === "bad" ? "p-bad" : "p-warn"}">${e.sev === "bad" ? "Breach" : "Warning"}</span>`,
        e.act === "allocate" ? linkBtn("ops", "o-unalloc", "Go to allocation", "btn-cp pri sm") : '<span class="faint">Monitored</span>',
      ])
    )}
    <div class="note" style="margin-top:12px">An exception is a state, not a report. It clears when the underlying record changes — allocate PRJ-2210 in Operations and the top row disappears from here.</div></div>`,

  "v-cat": () => head("Catalogue & pricing", "Transfer price and MRP, and what credit may be spent on.") + `
    <div class="card-cp">${table(
      ["Product / service", "Category", "Transfer price", "Customer MRP", "Credit-eligible", "Certification"],
      S.catalog.map(c => [
        `<b>${c.p}</b>`, c.c, c.tp, c.mrp,
        `<span class="pill ${c.cr === "Yes" ? "p-good" : c.cr === "No" ? "p-mute" : "p-warn"}">${c.cr}</span>`, c.cert,
      ])
    )}
    <div class="note" style="margin-top:12px">Partners never see the layer above their own transfer price. Certification-gated lines cannot be added to a proposal until the partner's learning path is complete.</div></div>`,
};

export function renderScreen(screen: string, role: RoleKey, ctx?: string): string {
  const r = V[screen];
  if (!r) return head("Screen not found", `${screen} is not in this build.`);
  return r({ role, ctx });
}

// Sidebar/topbar HTML (rendered by layout, but Links overridden via anchor tags for hydration simplicity)
export function renderSidebar(role: RoleKey, screen: string): string {
  const r = ROLES[role];
  const roles = (Object.keys(ROLES) as RoleKey[])
    .map(k => `<a class="${k === role ? "on" : ""}" href="/app/${k}/${ROLES[k].nav[0][1][0][0]}">${ROLES[k].label}</a>`).join("");
  const nav = r.nav.map(([g, items]) =>
    `<div class="grp">${g}</div>` + items.map(([id, label, isNew]) =>
      `<a class="${id === screen ? "active" : ""}" href="/app/${role}/${id}">${label}${isNew ? '<span class="new">NEW</span>' : ""}</a>`).join("")
  ).join("");
  const w = r.who;
  return `
    <div class="brandmark">
      <div class="logo"></div>
      <div><b>Channel Platform</b><small>MVP · Volume II</small></div>
    </div>
    <div class="rolelabel">Sign in as</div>
    <div class="roles">${roles}</div>
    <nav class="nav">${nav}</nav>
    <div style="margin-top:10px"><a class="nav" href="/wire" style="display:block;padding:9px 10px;color:#F0C878;background:rgba(217,154,36,.1);border:1px solid rgba(217,154,36,.25);border-radius:9px;font-size:12px;font-weight:600;text-decoration:none;text-align:center">◈ Wire connections map</a></div>
    <div class="who"><div class="whocard"><div class="av">${w[0]}</div><div><b>${w[1]}</b><small>${w[2]}</small></div></div></div>
  `;
}

export function renderTopbar(role: RoleKey): string {
  const dots = (Object.keys(ROLES) as RoleKey[]).map(k =>
    `<a class="${k === role ? "on" : ""}" title="See this record as ${ROLES[k].label}" href="/app/${k}/${(k === "ops" ? "o-proj?ctx=PRJ-2201" : (k === "partner" ? "p-del" : k === "sales" ? "s-cov" : k === "delivery" ? "d-assign" : k === "accounts" ? "a-inv" : k === "client" ? "c-proj" : k === "admin" ? "x-exc" : "v-cat"))}">${ROLES[k].label.slice(0, 2)}</a>`
  ).join("");
  return `
    <div class="lens">
      <div>
        <div class="lbl">Tracing one record</div>
        <div class="rec">Kohinoor Textiles · Web &amp; API VAPT</div>
      </div>
      <div class="dots">${dots}</div>
    </div>
    <div class="sp"></div>
    <button class="ibtn" title="Notifications" onclick="window.__cp.toast('4 unread','Project at risk · Sign-off pending · Invoice overdue · Credit expiring')">🔔<span class="ping">4</span></button>
    <a class="ibtn" title="Wire connections" href="/wire">◈</a>
  `;
}
