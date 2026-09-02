import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Wifi,
  Radio,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Zap,
  Server,
  Smartphone,
} from "lucide-react";
import clsx from "clsx";

const nodeIcons: Record<string, React.ReactNode> = {
  patch: <Smartphone className="w-3 h-3" />,
  hub: <Server className="w-4 h-4" />,
  repeater: <Radio className="w-4 h-4" />,
  responder: <ShieldAlert className="w-5 h-5" />,
};

const nodeColors: Record<string, Record<string, string>> = {
  online: { patch: "#22c55e", hub: "#3b82f6", repeater: "#8b5cf6", responder: "#06b6d4" },
  offline: { patch: "#64748b", hub: "#64748b", repeater: "#64748b", responder: "#64748b" },
  rerouted: { patch: "#eab308", hub: "#eab308", repeater: "#eab308", responder: "#06b6d4" },
};

export default function MeshNetwork() {
  const meshNodes = useQuery(api.mesh.getAll);
  const destroyHub = useMutation(api.mesh.simulateHubDestruction);
  const restoreHub = useMutation(api.mesh.simulateRestoreHub);
  const deadManSwitch = useMutation(api.patches.simulateDeadManSwitch);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animateAlert, setAnimateAlert] = useState<string | null>(null);

  const handleHubClick = useCallback(
    async (nodeId: string) => {
      const node = meshNodes?.find((n) => n.nodeId === nodeId);
      if (!node) return;
      if (node.status === "offline") {
        await restoreHub({ nodeId });
      } else {
        await destroyHub({ nodeId });
        setAnimateAlert(nodeId);
        setTimeout(() => setAnimateAlert(null), 3000);
      }
      setSelectedNode(nodeId);
    },
    [meshNodes, destroyHub, restoreHub]
  );

  const handlePatchClick = useCallback(
    async (patchId: string) => {
      await deadManSwitch({ patchId });
      setAnimateAlert(patchId);
      setTimeout(() => setAnimateAlert(null), 3000);
      setSelectedNode(`PATCH-${patchId}`);
    },
    [deadManSwitch]
  );

  if (!meshNodes) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Scale positions for SVG
  const scaleX = (x: number) => (x / 900) * 900;
  const scaleY = (y: number) => (y / 850) * 550;

  const onlineCount = meshNodes.filter((n) => n.status === "online").length;
  const reroutedCount = meshNodes.filter((n) => n.status === "rerouted").length;
  const offlineCount = meshNodes.filter((n) => n.status === "offline").length;

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-sm font-bold text-text-primary tracking-wide">
              LoRa Mesh Topology
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Patches → Ward Hubs → LoRa Repeater Chain → Responder Endpoint
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
            <Radio className="w-4 h-4 text-accent-cyan animate-glow" />
            <div>
              <span className="text-[10px] font-mono text-accent-cyan block">
                LoRa Mesh Only
              </span>
              <span className="text-[9px] text-text-muted">
                Zero SIM · Zero WiFi · Zero Internet
              </span>
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-green" />
              <span className="text-text-muted">{onlineCount} Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-risk-yellow" />
              <span className="text-text-muted">{reroutedCount} Rerouted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-text-muted" />
              <span className="text-text-muted">{offlineCount} Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-bg-elevated rounded-lg border border-border-subtle p-3 flex items-center gap-6 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-risk-red" />
          <span>Click a <strong className="text-text-primary">Hub</strong> to simulate destruction → auto-reroute</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-risk-yellow" />
          <span>Click a <strong className="text-text-primary">Patch</strong> to simulate dead-man's switch</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-risk-green" />
          <span>Click destroyed <strong className="text-text-primary">Hub</strong> again to restore</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Graph */}
        <div className="lg:col-span-3 bg-bg-card rounded-xl border border-border-subtle p-4">
          <svg
            viewBox="0 0 900 560"
            className="w-full"
            style={{ background: "transparent" }}
          >
            {/* Grid dots */}
            {Array.from({ length: 20 }, (_, i) =>
              Array.from({ length: 12 }, (_, j) => (
                <circle
                  key={`${i}-${j}`}
                  cx={i * 45 + 22}
                  cy={j * 45 + 22}
                  r={1}
                  fill="#1e3a5f"
                  opacity={0.3}
                />
              ))
            )}

            {/* Connections */}
            {meshNodes.map((node) =>
              node.connections
                .filter((c) => {
                  // Only draw connections where we haven't already drawn them
                  const other = meshNodes.find((n) => n.nodeId === c);
                  if (!other) return false;
                  // Draw from lower x to higher x for consistency
                  return node.nodeId < c;
                })
                .map((connId) => {
                  const target = meshNodes.find((n) => n.nodeId === connId);
                  if (!target) return null;

                  const isBroken =
                    node.status === "offline" || target.status === "offline";
                  const isRerouted =
                    node.status === "rerouted" || target.status === "rerouted";

                  return (
                    <line
                      key={`${node.nodeId}-${connId}`}
                      x1={scaleX(node.x)}
                      y1={scaleY(node.y)}
                      x2={scaleX(target.x)}
                      y2={scaleY(target.y)}
                      stroke={
                        isBroken
                          ? "#64748b"
                          : isRerouted
                          ? "#eab308"
                          : "#1e3a5f"
                      }
                      strokeWidth={isRerouted ? 2 : 1.5}
                      strokeDasharray={isBroken ? "4 4" : isRerouted ? "6 3" : "none"}
                      opacity={isBroken ? 0.3 : 0.6}
                    />
                  );
                })
            )}

            {/* Nodes */}
            {meshNodes.map((node) => {
              const color = nodeColors[node.status]?.[node.type] ?? "#64748b";
              const isAnimating = animateAlert === node.nodeId;
              const isSelected = selectedNode === node.nodeId;
              const isClickable = node.type === "hub" || node.type === "patch";
              const radius = node.type === "responder" ? 22 : node.type === "hub" ? 18 : node.type === "repeater" ? 14 : 11;

              return (
                <g
                  key={node.nodeId}
                  onClick={() => {
                    if (node.type === "hub") handleHubClick(node.nodeId);
                    else if (node.type === "patch") {
                      const pid = node.nodeId.replace("PATCH-", "");
                      handlePatchClick(pid);
                    }
                  }}
                  className={isClickable ? "cursor-pointer" : ""}
                  style={isAnimating ? { animation: "blink 0.5s ease-in-out 3" } : {}}
                >
                  {/* Glow ring for critical/animating */}
                  {isAnimating && (
                    <circle
                      cx={scaleX(node.x)}
                      cy={scaleY(node.y)}
                      r={radius + 8}
                      fill="none"
                      stroke={node.type === "patch" ? "#ef4444" : "#ef4444"}
                      strokeWidth={2}
                      opacity={0.6}
                      className="animate-critical-pulse"
                    >
                      <animate
                        attributeName="r"
                        values={`${radius + 4};${radius + 12};${radius + 4}`}
                        dur="0.8s"
                        repeatCount="3"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="0.8s"
                        repeatCount="3"
                      />
                    </circle>
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={scaleX(node.x)}
                      cy={scaleY(node.y)}
                      r={radius + 5}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={scaleX(node.x)}
                    cy={scaleY(node.y)}
                    r={radius}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Inner icon placeholder */}
                  <text
                    x={scaleX(node.x)}
                    y={scaleY(node.y) + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color}
                    fontSize={node.type === "responder" ? 10 : 8}
                    fontWeight="bold"
                  >
                    {node.type === "patch"
                      ? node.label
                      : node.type === "hub"
                      ? "H"
                      : node.type === "repeater"
                      ? "R"
                      : "⚡"}
                  </text>

                  {/* Label */}
                  <text
                    x={scaleX(node.x)}
                    y={scaleY(node.y) + radius + 12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {node.type === "patch"
                      ? node.label
                      : node.type === "responder"
                      ? "RESPONDER"
                      : node.type === "repeater"
                      ? `REP-${node.nodeId.split("-")[1]}`
                      : node.label}
                  </text>

                  {/* Status indicator */}
                  <circle
                    cx={scaleX(node.x) + radius - 2}
                    cy={scaleY(node.y) - radius + 2}
                    r={3}
                    fill={color}
                    stroke="#0a0e17"
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Column labels */}
            <text x={120} y={25} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="monospace">
              PATCHES
            </text>
            <text x={350} y={25} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="monospace">
              WARD HUBS
            </text>
            <text x={580} y={25} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="monospace">
              LORA REPEATERS
            </text>
            <text x={780} y={25} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="monospace">
              RESPONDER
            </text>

            {/* Flow arrows */}
            <polygon points="230,540 240,535 240,545" fill="#1e3a5f" opacity={0.5} />
            <text x={265} y={543} fill="#64748b" fontSize={8} fontFamily="monospace">DATA FLOW →</text>
          </svg>
        </div>

        {/* Legend & Node details */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
            <h3 className="text-xs font-medium text-text-primary mb-3">Legend</h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-risk-green/20 border border-risk-green flex items-center justify-center">
                  <Smartphone className="w-2.5 h-2.5 text-risk-green" />
                </div>
                <span className="text-text-muted">Patch (Body Sensor)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent-blue/20 border border-accent-blue flex items-center justify-center">
                  <Server className="w-2.5 h-2.5 text-accent-blue" />
                </div>
                <span className="text-text-muted">Ward Hub (Gateway)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent-purple/20 border border-accent-purple flex items-center justify-center">
                  <Radio className="w-2.5 h-2.5 text-accent-purple" />
                </div>
                <span className="text-text-muted">LoRa Repeater</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center">
                  <ShieldAlert className="w-2.5 h-2.5 text-accent-cyan" />
                </div>
                <span className="text-text-muted">Responder Endpoint</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border-subtle space-y-1.5 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-risk-green" />
                <span className="text-text-muted">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-risk-yellow" style={{ borderTop: "1px dashed #eab308", height: 0 }} />
                <span className="text-text-muted">Rerouted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-text-muted opacity-40" style={{ borderTop: "1px dashed #64748b", height: 0 }} />
                <span className="text-text-muted">Offline</span>
              </div>
            </div>
          </div>

          {/* Selected node info */}
          {selectedNode && (
            <div className="bg-bg-card rounded-xl border border-border-subtle p-4 animate-slide-in-up">
              <h3 className="text-xs font-medium text-text-primary mb-2">Node Details</h3>
              {(() => {
                const node = meshNodes.find((n) => n.nodeId === selectedNode);
                if (!node) return <p className="text-xs text-text-muted">Node not found</p>;
                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">ID</span>
                      <span className="font-mono text-text-secondary">{node.nodeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Type</span>
                      <span className="text-text-secondary capitalize">{node.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status</span>
                      <span
                        className={clsx(
                          "font-mono font-bold",
                          node.status === "online"
                            ? "text-risk-green"
                            : node.status === "rerouted"
                            ? "text-risk-yellow"
                            : "text-text-muted"
                        )}
                      >
                        {node.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Connections</span>
                      <span className="font-mono text-text-secondary">
                        {node.connections.length}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Network stats */}
          <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
            <h3 className="text-xs font-medium text-text-primary mb-3">Network Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Nodes</span>
                <span className="font-mono text-text-secondary">{meshNodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Patches</span>
                <span className="font-mono text-text-secondary">
                  {meshNodes.filter((n) => n.type === "patch").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Hubs</span>
                <span className="font-mono text-text-secondary">
                  {meshNodes.filter((n) => n.type === "hub").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Repeaters</span>
                <span className="font-mono text-text-secondary">
                  {meshNodes.filter((n) => n.type === "repeater").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Protocol</span>
                <span className="font-mono text-accent-cyan">LoRa 868MHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Connectivity</span>
                <span className="font-mono text-accent-cyan">Mesh-Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
