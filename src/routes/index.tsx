import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ROLES, type RoleKey } from "@/lib/channel-data";
import { firstScreenOf, getRole, signIn } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · Channel Platform" },
      { name: "description", content: "Sign in to the Channel Partner Platform. Pick your role — Partner, Sales, Ops, Delivery, Accounts, Client, Admin, or Vendor — and enter your workspace." },
      { property: "og:title", content: "Sign in · Channel Platform" },
      { property: "og:description", content: "Role-based sign-in for the Channel Partner Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const roles = Object.keys(ROLES) as RoleKey[];
  const nav = useNavigate();
  const [selected, setSelected] = useState<RoleKey | null>(null);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  // If already signed in, offer a fast-path chip; still show login so users can switch.
  const [existing, setExisting] = useState<RoleKey | null>(null);
  useEffect(() => { setExisting(getRole()); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { setErr("Pick a role to continue."); return; }
    if (pwd.trim().length < 3) { setErr("Enter any password (3+ chars) — this is a demo login."); return; }
    signIn(selected);
    nav({ to: "/app/$role/$screen", params: { role: selected, screen: firstScreenOf(selected) } });
  }

  return (
    <div className="hero-cp">
      <div style={{ maxWidth: 1080, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div className="brandmark" style={{ padding: 0, border: 0, margin: 0 }}>
            <div className="logo" />
          </div>
          <div>
            <div style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
              Channel Partner Platform
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 700 }}>
              Sign in · Volume II
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <Link to="/wire" className="btn-cp">◈ Wire connections</Link>
        </div>

        <h1 style={{ fontFamily: "Space Grotesk", fontSize: 42, letterSpacing: -1, lineHeight: 1.05, color: "var(--ink)", marginBottom: 10 }}>
          Sign in as your role
          <br /><span style={{ color: "var(--brand)" }}>You'll see only your workspace.</span>
        </h1>
        <p style={{ maxWidth: 640, fontSize: 14.5, color: "var(--muted)", lineHeight: 1.55, marginBottom: 22 }}>
          Each role sees the pages, actions and data that belong to their part of the Lead → Deal → PO → Delivery → Completion flow.
          {existing && <> · Currently signed in as <b>{ROLES[existing].label}</b> — <Link to="/app/$role/$screen" params={{ role: existing, screen: firstScreenOf(existing) }} style={{ color: "var(--brand)", fontWeight: 600 }}>resume workspace</Link>.</>}
        </p>

        <form onSubmit={submit} className="card-cp" style={{ padding: 20, maxWidth: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>
            Sign in
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Role</label>
          <select
            value={selected ?? ""}
            onChange={e => { setSelected((e.target.value || null) as RoleKey | null); setErr(""); }}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, marginBottom: 14, outline: "none", background: "#fff", cursor: "pointer" }}
          >
            <option value="">Select a role…</option>
            {roles.map(k => (
              <option key={k} value={k}>{ROLES[k].label} — {ROLES[k].who[1]}</option>
            ))}
          </select>

          {selected && (
            <div style={{ padding: "10px 12px", background: "var(--brand-soft)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 12, color: "var(--ink)", marginBottom: 14, lineHeight: 1.5 }}>
              <b>{ROLES[selected].who[1]}</b> · {ROLES[selected].who[2]}
            </div>
          )}

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(""); }}
            placeholder="any password (demo)"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13, marginBottom: 14, outline: "none" }}
          />
          {err && <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 10 }}>{err}</div>}
          <button type="submit" className="btn-cp pri" style={{ width: "100%", justifyContent: "center", display: "inline-flex" }}>
            Sign in →
          </button>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--faint)", lineHeight: 1.5 }}>
            Demo sign-in. Any 3+ character password is accepted. Your role stays only in this browser.
          </div>
        </form>
      </div>
    </div>
  );
}
