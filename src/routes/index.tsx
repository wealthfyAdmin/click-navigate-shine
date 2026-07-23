import { createFileRoute, Link } from "@tanstack/react-router";
import { ROLES, type RoleKey } from "@/lib/channel-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Channel Platform — Lead to Delivery, One Screen" },
      { name: "description", content: "A single system connecting Admin, Sales, Channel Partners, Clients, Delivery, Operations and Accounts on one transparent workflow." },
      { property: "og:title", content: "Channel Platform — Lead to Delivery" },
      { property: "og:description", content: "One record, eight roles. From lead to sign-off, everyone sees the same truth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const roles = Object.keys(ROLES) as RoleKey[];
  return (
    <div className="hero-cp">
      <div style={{ maxWidth: 1080, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <div className="brandmark" style={{ padding: 0, border: 0, margin: 0 }}>
            <div className="logo" />
          </div>
          <div>
            <div style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
              Channel Partner Platform
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 700 }}>
              MVP · Volume II
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <Link to="/wire" className="btn-cp">◈ Wire connections</Link>
        </div>

        <h1 style={{ fontFamily: "Space Grotesk", fontSize: 46, letterSpacing: -1, lineHeight: 1.05, color: "var(--ink)", marginBottom: 12 }}>
          One record.<br />Eight roles.<br />
          <span style={{ color: "var(--brand)" }}>Zero silos.</span>
        </h1>
        <p style={{ maxWidth: 620, fontSize: 15, color: "var(--muted)", lineHeight: 1.55, marginBottom: 28 }}>
          Lead → Deal → PO → Delivery → Completion — with every stakeholder watching the same live status.
          Pick a role below to enter the workspace as that user.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {roles.map(k => {
            const r = ROLES[k];
            const first = r.nav[0][1][0][0];
            return (
              <Link
                key={k}
                to="/app/$role/$screen"
                params={{ role: k, screen: first }}
                style={{ textDecoration: "none" }}
              >
                <div className="card-cp" style={{ transition: "all .15s", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="av" style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2B59FF,#6E7BFF)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 12 }}>
                      {r.who[0]}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "var(--faint)" }}>{r.who[1]}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
                    {r.who[2]}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
