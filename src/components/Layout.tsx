import { Link, useLocation } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  LayoutDashboard,
  Thermometer,
  Wifi,
  ShieldAlert,
  Radio,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { path: "/", label: "Ward Overview", icon: LayoutDashboard },
  { path: "/environment", label: "Environment", icon: Thermometer },
  { path: "/mesh", label: "Mesh Network", icon: Wifi },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const patches = useQuery(api.patches.getAll);
  const unreadCount = useQuery(api.alerts.getUnreadCount);

  const avgRisk =
    patches && patches.length > 0
      ? Math.round(
          patches.reduce((sum, p) => sum + p.riskScore, 0) / patches.length
        )
      : 0;

  const criticalCount =
    patches?.filter((p) => p.status === "critical").length ?? 0;

  const riskColor =
    avgRisk > 70
      ? "text-risk-red"
      : avgRisk > 40
      ? "text-risk-yellow"
      : "text-risk-green";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-bg-secondary border-r border-border-subtle flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-accent-blue" />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-text-primary">
                PRANA-SHIELD
              </h1>
              <p className="text-[10px] text-text-muted tracking-widest uppercase">
                Control Center
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status footer */}
        <div className="p-3 border-t border-border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Ward Risk</span>
            <span className={`font-mono font-bold ${riskColor}`}>{avgRisk}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Critical</span>
            <span className="font-mono font-bold text-risk-red">
              {criticalCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Alerts</span>
            <span className="font-mono font-bold text-risk-yellow">
              {unreadCount ?? 0}
            </span>
          </div>
          <div className="mt-2 p-2 rounded bg-bg-elevated border border-border-subtle">
            <div className="flex items-center gap-1.5 text-[10px] text-accent-cyan">
              <Radio className="w-3 h-3 animate-glow" />
              <span className="font-mono tracking-wide">
                LoRa Mesh Only
              </span>
            </div>
            <p className="text-[9px] text-text-muted mt-0.5">
              Zero SIM · Zero WiFi · Zero Internet
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 flex-shrink-0 bg-bg-secondary border-b border-border-subtle flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <ShieldAlert className="w-4 h-4 text-accent-blue" />
            <span className="text-text-secondary">
              PRANA-SHIELD
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-primary font-medium">
              {location.pathname === "/"
                ? "Ward Overview"
                : location.pathname.startsWith("/patch")
                ? "Patch Detail"
                : location.pathname === "/environment"
                ? "Environmental Monitor"
                : "Mesh Network"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-risk-green animate-pulse" />
              <span className="text-text-muted font-mono">SYSTEM ONLINE</span>
            </div>
            <span className="text-text-muted font-mono">
              {new Date().toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
