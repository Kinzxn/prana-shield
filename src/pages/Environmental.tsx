import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Flame,
  CloudRain,
  CloudFog,
  Tornado,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import clsx from "clsx";

const disasterTypes = [
  {
    id: "heatwave",
    label: "Heatwave",
    icon: Flame,
    color: "#ef4444",
    envWeights: { temperature: 1.5, humidity: 1.2, pm25: 0.5, pm10: 0.5, pressure: 0.3, co: 0.3 },
    description: "Extreme heat — temperature and humidity dominate risk model",
  },
  {
    id: "flood",
    label: "Flood",
    icon: CloudRain,
    color: "#3b82f6",
    envWeights: { temperature: 0.3, humidity: 1.5, pm25: 0.8, pm10: 0.8, pressure: 1.5, co: 0.5 },
    description: "Flooding — pressure drops and humidity spikes signal danger",
  },
  {
    id: "pollution",
    label: "Pollution",
    icon: CloudFog,
    color: "#a855f7",
    envWeights: { temperature: 0.3, humidity: 0.3, pm25: 2.0, pm10: 2.0, pressure: 0.5, co: 1.5 },
    description: "Air quality crisis — PM2.5, PM10, and CO dominate risk",
  },
  {
    id: "cyclone",
    label: "Cyclone",
    icon: Tornado,
    color: "#06b6d4",
    envWeights: { temperature: 0.5, humidity: 1.0, pm25: 0.5, pm10: 0.5, pressure: 2.0, co: 0.3 },
    description: "Cyclonic storm — rapid pressure drop is the primary indicator",
  },
];

const thresholds = {
  temperature: { danger: 40, warning: 38 },
  humidity: { danger: 85, warning: 75 },
  pm25: { danger: 150, warning: 75 },
  pm10: { danger: 250, warning: 150 },
  pressure: { dangerLow: 990, warningLow: 1000 },
  co: { danger: 25, warning: 15 },
};

function SensorChart({
  title,
  icon,
  dataKey,
  unit,
  color,
  nodes,
  warning,
  danger,
  dangerLow,
  warningLow,
}: {
  title: string;
  icon: React.ReactNode;
  dataKey: string;
  unit: string;
  color: string;
  nodes: any[];
  warning?: number;
  danger?: number;
  dangerLow?: number;
  warningLow?: number;
}) {
  // Build time-series from current snapshot (last 30 readings simulated)
  const chartData = nodes[0]
    ? Array.from({ length: 30 }, (_, i) => {
        const base = nodes.reduce((sum, n) => sum + (n as any)[dataKey], 0) / nodes.length;
        const jitter = Math.sin(i * 0.3) * (base * 0.08) + (Math.random() - 0.5) * (base * 0.05);
        return {
          time: i,
          avg: Math.round((base + jitter) * 10) / 10,
          ...Object.fromEntries(nodes.map((n: any) => [n.nodeId, (n as any)[dataKey] + Math.sin(i * 0.2 + nodes.indexOf(n)) * ((n as any)[dataKey] * 0.06)])),
        };
      })
    : [];

  return (
    <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        </div>
        <span className="text-xs text-text-muted font-mono">{unit}</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" strokeOpacity={0.3} />
            <XAxis dataKey="time" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{
                background: "#1a2332",
                border: "1px solid #1e3a5f",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            {danger && (
              <ReferenceLine
                y={danger}
                stroke="#ef4444"
                strokeDasharray="4 3"
                label={{ value: "DANGER", position: "right", fill: "#ef4444", fontSize: 8 }}
              />
            )}
            {warning && (
              <ReferenceLine
                y={warning}
                stroke="#eab308"
                strokeDasharray="4 3"
                label={{ value: "WARN", position: "right", fill: "#eab308", fontSize: 8 }}
              />
            )}
            {dangerLow && (
              <ReferenceLine
                y={dangerLow}
                stroke="#ef4444"
                strokeDasharray="4 3"
                label={{ value: "DANGER LOW", position: "right", fill: "#ef4444", fontSize: 8 }}
              />
            )}
            {warningLow && (
              <ReferenceLine
                y={warningLow}
                stroke="#eab308"
                strokeDasharray="4 3"
                label={{ value: "WARN LOW", position: "right", fill: "#eab308", fontSize: 8 }}
              />
            )}
            <Line type="monotone" dataKey="avg" stroke={color} strokeWidth={2} dot={false} name="Ward Avg" />
            <Legend
              wrapperStyle={{ fontSize: "10px" }}
              iconType="circle"
              iconSize={6}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Environmental() {
  const [activeDisaster, setActiveDisaster] = useState("heatwave");
  const envNodes = useQuery(api.environment.getAll);

  if (!envNodes) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const disaster = disasterTypes.find((d) => d.id === activeDisaster)!;

  // Compute weighted composite risk contribution from environment
  const envRiskContribution = envNodes.reduce((sum, n) => {
    const w = disaster.envWeights;
    return (
      sum +
      (n.temperature * w.temperature +
        n.humidity * w.humidity +
        n.pm25 * w.pm25 +
        n.pm10 * w.pm10 +
        n.co * w.co +
        Math.abs(1013 - n.pressure) * w.pressure) /
        6
    );
  }, 0) / envNodes.length;

  const normalizedRisk = Math.min(100, Math.round(envRiskContribution * 2.5));

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Disaster type selector */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-text-primary">
            Disaster-Type Mode
          </h2>
          <span className="text-xs text-text-muted">
            Re-weights environmental factors in fused risk model
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {disasterTypes.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDisaster(d.id)}
              className={clsx(
                "p-3 rounded-lg border text-left transition-all",
                activeDisaster === d.id
                  ? "border-opacity-50 bg-opacity-20"
                  : "border-border-subtle bg-bg-elevated hover:bg-bg-primary"
              )}
              style={
                activeDisaster === d.id
                  ? {
                      borderColor: d.color,
                      backgroundColor: `${d.color}15`,
                    }
                  : {}
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <d.icon
                  className="w-4 h-4"
                  style={{ color: activeDisaster === d.id ? d.color : "#94a3b8" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: activeDisaster === d.id ? d.color : "#94a3b8" }}
                >
                  {d.label}
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-tight">
                {d.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Composite environmental risk */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">
            Composite Environmental Risk — {disaster.label} Mode
          </p>
          <p
            className="text-3xl font-bold font-mono mt-1"
            style={{
              color:
                normalizedRisk > 70
                  ? "#ef4444"
                  : normalizedRisk > 40
                  ? "#eab308"
                  : "#22c55e",
            }}
          >
            {normalizedRisk}
          </p>
        </div>
        <div className="text-right text-xs text-text-muted space-y-1">
          <p>Active ward sensors: {envNodes.length}</p>
          <p>Disaster mode: <span style={{ color: disaster.color }}>{disaster.label}</span></p>
        </div>
      </div>

      {/* Sensor charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SensorChart
          title="Temperature"
          icon={<Thermometer className="w-4 h-4 text-risk-orange" />}
          dataKey="temperature"
          unit="°C"
          color="#f97316"
          nodes={envNodes}
          warning={thresholds.temperature.warning}
          danger={thresholds.temperature.danger}
        />
        <SensorChart
          title="Humidity"
          icon={<Droplets className="w-4 h-4 text-accent-cyan" />}
          dataKey="humidity"
          unit="%RH"
          color="#06b6d4"
          nodes={envNodes}
          warning={thresholds.humidity.warning}
          danger={thresholds.humidity.danger}
        />
        <SensorChart
          title="PM2.5"
          icon={<Wind className="w-4 h-4 text-accent-purple" />}
          dataKey="pm25"
          unit="µg/m³"
          color="#a855f7"
          nodes={envNodes}
          warning={thresholds.pm25.warning}
          danger={thresholds.pm25.danger}
        />
        <SensorChart
          title="PM10"
          icon={<Wind className="w-4 h-4 text-risk-yellow" />}
          dataKey="pm10"
          unit="µg/m³"
          color="#eab308"
          nodes={envNodes}
          warning={thresholds.pm10.warning}
          danger={thresholds.pm10.danger}
        />
        <SensorChart
          title="Atmospheric Pressure"
          icon={<Gauge className="w-4 h-4 text-accent-blue" />}
          dataKey="pressure"
          unit="hPa"
          color="#3b82f6"
          nodes={envNodes}
          warningLow={thresholds.pressure.warningLow}
          dangerLow={thresholds.pressure.dangerLow}
        />
        <SensorChart
          title="Carbon Monoxide"
          icon={<Flame className="w-4 h-4 text-risk-red" />}
          dataKey="co"
          unit="ppm"
          color="#ef4444"
          nodes={envNodes}
          warning={thresholds.co.warning}
          danger={thresholds.co.danger}
        />
      </div>
    </div>
  );
}
