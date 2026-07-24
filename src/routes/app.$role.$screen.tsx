import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

import { ROLES, SCREEN_TITLES, S, type RoleKey } from "@/lib/channel-data";
import { renderScreen, renderSidebar, renderTopbar } from "@/lib/channel-screens";
import { installActions } from "@/lib/channel-actions";
import { firstScreenOf, getRole, signOut } from "@/lib/auth";

const searchSchema = z.object({ ctx: z.string().optional() });

export const Route = createFileRoute("/app/$role/$screen")({
  validateSearch: searchSchema,
  head: ({ params }) => {
    const title = SCREEN_TITLES[params.screen] ?? "Channel Platform";
    return {
      meta: [
        { title: `${title} · Channel Platform` },
        { name: "description", content: `${title} — live workspace view.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `${title} — Channel Platform MVP.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: AppScreen,
});

function AppScreen() {
  const { role, screen } = Route.useParams();
  const { ctx } = Route.useSearch();
  const router = useRouter();
  const nav = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const roleKey = (ROLES as any)[role] ? (role as RoleKey) : "partner";

  // Session gate: only the signed-in role can see its own pages.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const s = getRole();
    if (!s) { nav({ to: "/" }); return; }
    if (s !== roleKey) {
      nav({ to: "/app/$role/$screen", params: { role: s, screen: firstScreenOf(s) }, replace: true });
      return;
    }
    setReady(true);
  }, [roleKey, nav]);

  // Install action handlers once; refresh = re-run loader / re-render.
  useEffect(() => {
    installActions(() => router.invalidate());
    // Sign-out action wired to topbar button.
    (window as any).__cp = (window as any).__cp || {};
    (window as any).__cp.signOut = () => { signOut(); nav({ to: "/" }); };
  }, [router, nav]);

  const html = useMemo(() => renderScreen(screen, roleKey, ctx), [screen, roleKey, ctx]);
  const sidebar = useMemo(() => renderSidebar(roleKey, screen), [roleKey, screen]);
  const topbar = useMemo(() => renderTopbar(roleKey), [roleKey]);

  if (!ready) return null;

  return (
    <div className="cp-shell">
      <aside className="sidebar" dangerouslySetInnerHTML={{ __html: sidebar }} />
      <div className="main">
        <header className="topbar" dangerouslySetInnerHTML={{ __html: topbar }} />
        <div className="content" ref={contentRef}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
          <ScreenCharts screen={screen} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Charts layer — React/recharts alongside the ported HTML screens.
   ============================================================ */
function ScreenCharts({ screen }: { screen: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (screen === "p-dash") return <PartnerCharts />;
  if (screen === "o-board") return <OpsCharts />;
  if (screen === "a-cred") return <CreditCharts />;
  if (screen === "x-over") return <AdminCharts />;
  return null;
}

const COLORS = ["#2B59FF", "#12A46A", "#E88A0C", "#D99A24", "#E0483B", "#6E7BFF"];

function ChartCard({ title, sub, children, height = 240 }: { title: string; sub?: string; children: React.ReactNode; height?: number }) {
  return (
    <div className="card-cp" style={{ marginTop: 14 }}>
      <h3>{title}</h3>
      {sub && <div className="sub">{sub}</div>}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>{children as any}</ResponsiveContainer>
      </div>
    </div>
  );
}

function PartnerCharts() {
  const c = S.credit;
  const wallet = [
    { name: "Consumed", value: c.consumed },
    { name: "Reserved", value: c.reserved },
    { name: "Available", value: c.avail },
  ];
  const pipeline = S.opps.map(o => ({ name: o.id, value: o.val / 100000, score: o.score }));
  return (
    <div className="grid-cp g2" style={{ marginTop: 14 }}>
      <ChartCard title="Credit wallet composition" sub="Where your ₹20 L allocation actually sits">
        <PieChart>
          <Pie data={wallet} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} isAnimationActive={false} label>
            {wallet.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => "₹" + (v as number).toLocaleString("en-IN")} />
          <Legend />
        </PieChart>
      </ChartCard>
      <ChartCard title="Pipeline · value & AI score" sub="Deal size (₹ lakh) vs win-likelihood">
        <BarChart data={pipeline}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="name" fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="₹ Lakh" fill="#2B59FF" radius={[6, 6, 0, 0]} />
          <Bar dataKey="score" name="AI score" fill="#D99A24" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

function OpsCharts() {
  const util = ["27 Jul", "03 Aug", "10 Aug", "17 Aug", "24 Aug"].map((w, i) => {
    const row: any = { week: w };
    S.people.forEach(p => { row[p.n] = p.u[i]; });
    return row;
  });
  return (
    <ChartCard title="Team utilisation · next five weeks" sub="Anything above 100% is over-allocation" height={280}>
      <LineChart data={util}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="week" fontSize={11} />
        <YAxis fontSize={11} unit="%" />
        <Tooltip />
        <Legend />
        {S.people.map((p, i) => (
          <Line key={p.n} type="monotone" dataKey={p.n} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ChartCard>
  );
}

function CreditCharts() {
  const data = S.ledger.map(l => ({ d: l.d, balance: l.bal / 100000 }));
  return (
    <ChartCard title="Credit balance over time" sub="Every entry, running balance in ₹ Lakh">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="d" fontSize={11} />
        <YAxis fontSize={11} unit=" L" />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#2B59FF" strokeWidth={2.5} dot={{ r: 4 }} />
      </LineChart>
    </ChartCard>
  );
}

function AdminCharts() {
  const rev = [
    { line: "Services · red", revenue: 18.4, cost: 7.6 },
    { line: "Services · purple", revenue: 14.2, cost: 6.9 },
    { line: "Tools / SI", revenue: 11.2, cost: 3.1 },
    { line: "Licences", revenue: 6.8, cost: 4.7 },
    { line: "Staff aug", revenue: 9.4, cost: 6.2 },
  ];
  const delay = [
    { stage: "Win → Project", days: 0.4 },
    { stage: "Kickoff → Milestone 1", days: 3 },
    { stage: "Delivery → Sign-off", days: 6 },
    { stage: "Sign-off → Invoice", days: 4.2 },
    { stage: "Invoice → Cash", days: 28 },
  ];
  return (
    <div className="grid-cp g2" style={{ marginTop: 14 }}>
      <ChartCard title="Revenue vs delivery cost · by line" sub="₹ Lakh per revenue line">
        <BarChart data={rev}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis dataKey="line" fontSize={10} />
          <YAxis fontSize={11} unit=" L" />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#2B59FF" radius={[6, 6, 0, 0]} />
          <Bar dataKey="cost" name="Delivery cost" fill="#E88A0C" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
      <ChartCard title="Where days go missing" sub="Median days between each hand-off">
        <BarChart data={delay} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis type="number" fontSize={11} unit="d" />
          <YAxis type="category" dataKey="stage" fontSize={11} width={150} />
          <Tooltip />
          <Bar dataKey="days" fill="#D99A24" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}
