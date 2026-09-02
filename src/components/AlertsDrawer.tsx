import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Bell,
  BellOff,
  Radio,
  WifiOff,
  ShieldAlert,
  Info,
} from "lucide-react";
import clsx from "clsx";

const severityConfig = {
  critical: { color: "text-risk-red", bg: "bg-risk-red/10", border: "border-risk-red/30", icon: ShieldAlert },
  warning: { color: "text-risk-yellow", bg: "bg-risk-yellow/10", border: "border-risk-yellow/30", icon: AlertTriangle },
  info: { color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/30", icon: Info },
};

const typeConfig = {
  risk_escalation: { icon: AlertTriangle, label: "Risk Escalation" },
  reroute: { icon: Radio, label: "Mesh Reroute" },
  dead_man_switch: { icon: WifiOff, label: "Dead-Man Switch" },
  environment: { icon: AlertTriangle, label: "Environment" },
  system: { icon: Info, label: "System" },
};

export default function AlertsDrawer() {
  const [expanded, setExpanded] = useState(false);
  const alerts = useQuery(api.alerts.getRecent);
  const markRead = useMutation(api.alerts.markAllRead);

  const criticalAlerts =
    alerts?.filter((a) => a.severity === "critical" && !a.read) ?? [];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Collapsed bar */}
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && criticalAlerts.length > 0) {
            markRead();
          }
        }}
        className={clsx(
          "w-full flex items-center justify-between px-6 py-2.5 border-t transition-all",
          criticalAlerts.length > 0
            ? "bg-risk-red/10 border-risk-red/30"
            : "bg-bg-secondary border-border-subtle"
        )}
      >
        <div className="flex items-center gap-3">
          {criticalAlerts.length > 0 ? (
            <Bell className="w-4 h-4 text-risk-red animate-blink" />
          ) : (
            <BellOff className="w-4 h-4 text-text-muted" />
          )}
          <span className="text-xs font-medium text-text-primary">
            Alert Log
          </span>
          {criticalAlerts.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-risk-red text-white font-bold animate-pulse">
              {criticalAlerts.length} NEW
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-text-muted font-mono">
            {alerts?.length ?? 0} total entries
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="bg-bg-secondary border-t border-border-subtle max-h-64 overflow-y-auto animate-slide-in-right">
          {alerts && alerts.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {alerts.map((alert) => {
                const sev = severityConfig[alert.severity];
                const typ = typeConfig[alert.type];
                const Icon = sev.icon;

                return (
                  <div
                    key={alert._id}
                    className={clsx(
                      "flex items-start gap-3 px-6 py-3 transition-colors",
                      !alert.read && "bg-bg-elevated/50"
                    )}
                  >
                    <div
                      className={clsx(
                        "mt-0.5 p-1 rounded",
                        sev.bg,
                        sev.border,
                        "border"
                      )}
                    >
                      <Icon className={clsx("w-3 h-3", sev.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={clsx(
                            "text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider",
                            sev.bg,
                            sev.color
                          )}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[9px] text-text-muted uppercase tracking-wider">
                          {typ.label}
                        </span>
                        {!alert.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono whitespace-nowrap mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-text-muted">
              No alerts recorded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
