import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, Thermometer, Droplets, Heart, ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import clsx from "clsx";

function getRiskColor(score: number) {
  if (score > 70) return "text-risk-red";
  if (score > 40) return "text-risk-yellow";
  return "text-risk-green";
}

function getRiskBg(score: number) {
  if (score > 70) return "bg-risk-red";
  if (score > 40) return "bg-risk-yellow";
  return "bg-risk-green";
}

function getRiskRingBg(score: number) {
  if (score > 70) return "from-risk-red to-risk-red/30";
  if (score > 40) return "from-risk-yellow to-risk-yellow/30";
  return "from-risk-green to-risk-green/30";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "critical":
      return { label: "Critical", cls: "bg-risk-red/20 text-risk-red border-risk-red/40" };
    case "elevated":
      return { label: "Elevated", cls: "bg-risk-yellow/20 text-risk-yellow border-risk-yellow/40" };
    case "offline":
      return { label: "Offline", cls: "bg-text-muted/20 text-text-muted border-text-muted/40" };
    default:
      return { label: "Normal", cls: "bg-risk-green/20 text-risk-green border-risk-green/40" };
  }
}

function getTrendIcon(history: number[]) {
  if (history.length < 10) return <Minus className="w-3 h-3" />;
  const recent = history.slice(-10);
  const older = history.slice(-20, -10);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
  if (recentAvg > olderAvg + 3) return <TrendingUp className="w-3 h-3 text-risk-red" />;
  if (recentAvg < olderAvg - 3) return <TrendingDown className="w-3 h-3 text-risk-green" />;
  return <Minus className="w-3 h-3 text-text-muted" />;
}

function PatientCard({ patch, onClick }: { patch: any; onClick: () => void }) {
  const badge = getStatusBadge(patch.status);
  const sparkData = patch.riskHistory.map((v: number, i: number) => ({ v, i }));

  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative bg-bg-card rounded-xl border border-border-subtle p-4 text-left transition-all hover:border-accent-blue/50 hover:bg-bg-elevated w-full group",
        patch.status === "critical" && "animate-critical-pulse border-risk-red/40",
        patch.status === "offline" && "opacity-60"
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={clsx("w-2 h-2 rounded-full", getRiskBg(patch.riskScore))} />
          <span className="text-sm font-semibold text-text-primary">
            {patch.patientId}
          </span>
        </div>
        <span
          className={clsx(
            "text-[10px] px-2 py-0.5 rounded-full border font-medium",
            badge.cls
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Risk score circle */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-bg-elevated" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              className={getRiskColor(patch.riskScore)}
              strokeWidth="4"
              strokeDasharray={`${(patch.riskScore / 100) * 175.9} 175.9`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={clsx("text-lg font-bold font-mono", getRiskColor(patch.riskScore))}>
              {patch.riskScore}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            {getTrendIcon(patch.riskHistory)}
            <span>Risk Trajectory</span>
          </div>
          <div className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={
                    patch.riskScore > 70
                      ? "#ef4444"
                      : patch.riskScore > 40
                      ? "#eab308"
                      : "#22c55e"
                  }
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vitals row */}
      <div className="grid grid-cols-4 gap-2 text-[11px]">
        <div className="flex items-center gap-1 text-text-muted">
          <Heart className="w-3 h-3 text-risk-red" />
          <span className="font-mono">{patch.heartRate > 0 ? patch.heartRate : "—"}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Activity className="w-3 h-3 text-accent-cyan" />
          <span className="font-mono">{patch.spo2 > 0 ? `${patch.spo2}` : "—"}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Thermometer className="w-3 h-3 text-risk-orange" />
          <span className="font-mono">{patch.skinTemp > 0 ? `${patch.skinTemp}` : "—"}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Droplets className="w-3 h-3 text-accent-purple" />
          <span className="font-mono">{patch.edaGsr > 0 ? `${patch.edaGsr}` : "—"}</span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] text-accent-blue font-mono">VIEW →</span>
      </div>
    </button>
  );
}

export default function WardOverview() {
  const navigate = useNavigate();
  const patches = useQuery(api.patches.getAll);
  const alerts = useQuery(api.alerts.getRecent);

  if (!patches) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading ward telemetry...</p>
        </div>
      </div>
    );
  }

  const avgRisk =
    patches.length > 0
      ? Math.round(patches.reduce((s, p) => s + p.riskScore, 0) / patches.length)
      : 0;

  const criticalCount = patches.filter((p) => p.status === "critical").length;
  const elevatedCount = patches.filter((p) => p.status === "elevated").length;
  const offlineCount = patches.filter((p) => p.status === "offline").length;
  const activeAlerts = alerts?.filter((a) => !a.read && a.severity === "critical").length ?? 0;

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Aggregate banner */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-accent-blue" />
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Aggregate Ward Risk</p>
              <p className={clsx("text-2xl font-bold font-mono", getRiskColor(avgRisk))}>
                {avgRisk}
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-red" />
              <span className="text-text-muted">Critical</span>
              <span className="font-mono font-bold text-risk-red">{criticalCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-yellow" />
              <span className="text-text-muted">Elevated</span>
              <span className="font-mono font-bold text-risk-yellow">{elevatedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-text-muted" />
              <span className="text-text-muted">Offline</span>
              <span className="font-mono font-bold text-text-muted">{offlineCount}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
            activeAlerts > 0
              ? "bg-risk-red/10 border-risk-red/30 text-risk-red"
              : "bg-risk-green/10 border-risk-green/30 text-risk-green"
          )}>
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-mono font-bold">{activeAlerts}</span>
            <span className="text-xs">Active Alerts</span>
          </div>
          <div className="text-right text-xs text-text-muted">
            <p>{patches.length} Patches Monitored</p>
            <p className="font-mono">Last update: {new Date().toLocaleTimeString("en-US", { hour12: false })}</p>
          </div>
        </div>
      </div>

      {/* Patient grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {patches.map((patch) => (
          <PatientCard
            key={patch._id}
            patch={patch}
            onClick={() => navigate(`/patch/${patch.patchId}`)}
          />
        ))}
      </div>
    </div>
  );
}
