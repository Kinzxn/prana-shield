import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

function getRiskColor(score: number) {
  if (score > 70) return "#ef4444";
  if (score > 40) return "#eab308";
  return "#22c55e";
}

function getStatusLabel(status: string) {
  switch (status) {
    case "critical":
      return { label: "CRITICAL", cls: "bg-risk-red/20 text-risk-red border-risk-red/40 animate-blink" };
    case "elevated":
      return { label: "ELEVATED", cls: "bg-risk-yellow/20 text-risk-yellow border-risk-yellow/40" };
    case "offline":
      return { label: "OFFLINE", cls: "bg-text-muted/20 text-text-muted border-text-muted/40" };
    default:
      return { label: "NORMAL", cls: "bg-risk-green/20 text-risk-green border-risk-green/40" };
  }
}

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  value: number;
  unit: string;
  baseline: { min: number; max: number };
  color: string;
  outOfRange: boolean;
  history: number[];
}

function MetricCard({ title, icon, value, unit, baseline, color, outOfRange, history }: MetricCardProps) {
  const chartData = history.map((v, i) => ({ v, i }));

  return (
    <div
      className={clsx(
        "bg-bg-card rounded-xl border p-4 transition-all",
        outOfRange ? "border-risk-red/40" : "border-border-subtle"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-text-primary">{title}</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold font-mono" style={{ color }}>
            {value}
          </span>
          <span className="text-xs text-text-muted ml-1">{unit}</span>
        </div>
      </div>

      {/* Baseline range indicator */}
      <div className="flex items-center gap-2 mb-3 text-[10px]">
        <span className="text-text-muted">Baseline:</span>
        <span className="font-mono text-text-secondary">
          {baseline.min} – {baseline.max} {unit}
        </span>
        {outOfRange && (
          <span className="text-risk-red font-medium">⚠ OUT OF RANGE</span>
        )}
      </div>

      {/* Chart with baseline band */}
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" strokeOpacity={0.3} />
            <ReferenceLine
              y={baseline.min}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              y={baseline.max}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${title})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function PatchDetail() {
  const { patchId } = useParams<{ patchId: string }>();
  const navigate = useNavigate();
  const patch = useQuery(
    api.patches.getByPatchId,
    patchId ? { patchId } : "skip"
  );
  const alerts = useQuery(api.alerts.getRecent);

  if (!patch) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading patch telemetry...</p>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(patch.status);

  // Risk trajectory data
  const riskData = patch.riskHistory.map((v, i) => ({
    v,
    i,
    label: `${i}m`,
  }));

  // Risk driver data
  const riskDrivers = [
    { name: "Physiology", value: Math.round(patch.physiologyWeight * 100), color: "#3b82f6" },
    { name: "Environment", value: Math.round(patch.environmentWeight * 100), color: "#8b5cf6" },
    { name: "Exposure", value: Math.round(patch.exposureDuration * 100), color: "#f97316" },
  ];

  const patchAlerts =
    alerts?.filter((a) => a.patchId === patch.patchId).slice(0, 5) ?? [];

  const hrOutOfRange =
    patch.heartRate < patch.baselineHR.min || patch.heartRate > patch.baselineHR.max;
  const spo2OutOfRange =
    patch.spo2 < patch.baselineSpo2.min;
  const tempOutOfRange =
    patch.skinTemp < patch.baselineTemp.min || patch.skinTemp > patch.baselineTemp.max;
  const edaOutOfRange =
    patch.edaGsr > patch.baselineEda.max;

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg bg-bg-card border border-border-subtle hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary">
                {patch.patientId}
              </h1>
              <span
                className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-full border font-bold tracking-wider",
                  status.cls
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Patch {patch.patchId} · Last update{" "}
              {new Date(patch.lastUpdated).toLocaleTimeString("en-US", {
                hour12: false,
              })}
            </p>
          </div>
        </div>

        {/* Big risk score */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">
              Risk Score
            </p>
            <p
              className="text-4xl font-bold font-mono"
              style={{ color: getRiskColor(patch.riskScore) }}
            >
              {patch.riskScore}
            </p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke={getRiskColor(patch.riskScore)}
                strokeWidth="6"
                strokeDasharray={`${(patch.riskScore / 100) * 220} 220`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Heart Rate"
          icon={<Heart className="w-4 h-4 text-risk-red" />}
          value={patch.heartRate}
          unit="bpm"
          baseline={patch.baselineHR}
          color="#ef4444"
          outOfRange={hrOutOfRange}
          history={patch.riskHistory.map((r) =>
            Math.max(
              patch.baselineHR.min - 10,
              Math.min(
                patch.baselineHR.max + 20,
                patch.baselineHR.min + (r / 100) * (patch.baselineHR.max - patch.baselineHR.min + 20)
              )
            )
          )}
        />
        <MetricCard
          title="SpO₂"
          icon={<Activity className="w-4 h-4 text-accent-cyan" />}
          value={patch.spo2}
          unit="%"
          baseline={patch.baselineSpo2}
          color="#06b6d4"
          outOfRange={spo2OutOfRange}
          history={patch.riskHistory.map((r) =>
            Math.max(85, Math.min(100, 100 - (r / 100) * 12))
          )}
        />
        <MetricCard
          title="Skin Temperature"
          icon={<Thermometer className="w-4 h-4 text-risk-orange" />}
          value={patch.skinTemp}
          unit="°C"
          baseline={patch.baselineTemp}
          color="#f97316"
          outOfRange={tempOutOfRange}
          history={patch.riskHistory.map((r) =>
            Math.max(
              35,
              Math.min(
                42,
                36 + (r / 100) * 4
              )
            )
          )}
        />
        <MetricCard
          title="EDA / GSR"
          icon={<Droplets className="w-4 h-4 text-accent-purple" />}
          value={patch.edaGsr}
          unit="µS"
          baseline={patch.baselineEda}
          color="#8b5cf6"
          outOfRange={edaOutOfRange}
          history={patch.riskHistory.map((r) =>
            Math.max(0, Math.min(30, 3 + (r / 100) * 20))
          )}
        />
      </div>

      {/* Risk trajectory + Risk drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk trajectory */}
        <div className="lg:col-span-2 bg-bg-card rounded-xl border border-border-subtle p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-blue" />
              <h3 className="text-sm font-medium text-text-primary">
                Risk Trajectory
              </h3>
            </div>
            {patch.riskScore > 60 && (
              <div className="flex items-center gap-1.5 text-risk-red text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-mono">Early Warning Zone</span>
              </div>
            )}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={getRiskColor(patch.riskScore)}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={getRiskColor(patch.riskScore)}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" strokeOpacity={0.3} />
                <XAxis dataKey="i" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a2332",
                    border: "1px solid #1e3a5f",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <ReferenceLine
                  y={40}
                  stroke="#eab308"
                  strokeDasharray="6 3"
                  label={{
                    value: "ELEVATED",
                    position: "right",
                    fill: "#eab308",
                    fontSize: 9,
                  }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  label={{
                    value: "CRITICAL",
                    position: "right",
                    fill: "#ef4444",
                    fontSize: 9,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={getRiskColor(patch.riskScore)}
                  strokeWidth={2.5}
                  fill="url(#riskGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk drivers */}
        <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
          <h3 className="text-sm font-medium text-text-primary mb-4">
            Risk Drivers
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDrivers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" strokeOpacity={0.3} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a2332",
                    border: "1px solid #1e3a5f",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(value: any) => [`${value}%`, "Weight"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {riskDrivers.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {riskDrivers.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-text-muted">{d.name}</span>
                </div>
                <span className="font-mono text-text-secondary">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patch alerts */}
      {patchAlerts.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
          <h3 className="text-sm font-medium text-text-primary mb-3">
            Recent Alerts for {patch.patientId}
          </h3>
          <div className="space-y-2">
            {patchAlerts.map((a) => (
              <div
                key={a._id}
                className={clsx(
                  "flex items-start gap-3 p-2 rounded-lg text-xs",
                  a.severity === "critical"
                    ? "bg-risk-red/10 border border-risk-red/20"
                    : a.severity === "warning"
                    ? "bg-risk-yellow/10 border border-risk-yellow/20"
                    : "bg-bg-elevated border border-border-subtle"
                )}
              >
                <AlertTriangle
                  className={clsx(
                    "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                    a.severity === "critical"
                      ? "text-risk-red"
                      : a.severity === "warning"
                      ? "text-risk-yellow"
                      : "text-accent-blue"
                  )}
                />
                <div className="flex-1">
                  <p className="text-text-secondary">{a.message}</p>
                  <p className="text-text-muted mt-0.5 font-mono">
                    {new Date(a.timestamp).toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
