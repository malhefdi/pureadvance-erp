/**
 * Pure Advance ERP — Design Tokens
 * 
 * Centralized color and spacing tokens.
 * Replace hardcoded hex values throughout the codebase with these.
 */

export const colors = {
  // Status colors
  status: {
    running: "#22c55e",    // green
    idle: "#eab308",       // yellow
    offline: "#6b7280",    // gray
    alert: "#ef4444",      // red
    maintenance: "#3b82f6",// blue
  },

  // Process flow
  flow: {
    upstream: "#3b82f6",   // blue
    downstream: "#8b5cf6", // purple
    qc: "#10b981",         // teal
    packaging: "#f59e0b",  // amber
  },

  // P&ID colors
  pid: {
    vessel: "#334155",     // slate
    pipe: "#64748b",       // gray
    valve: "#ef4444",      // red
    instrument: "#3b82f6", // blue
    sensor: "#22c55e",     // green
    pump: "#f59e0b",       // amber
    agitator: "#8b5cf6",   // purple
  },

  // Factory zones
  zone: {
    upstream: "#1e3a5f",
    downstream: "#3b1f5e",
    qc: "#1a4d3e",
    packaging: "#4a3728",
    utilities: "#2d3748",
    warehouse: "#1a202c",
  },

  // Severity levels
  severity: {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#3b82f6",
    info: "#6b7280",
  },
} as const;

export type ColorCategory = keyof typeof colors;
export type ColorToken<C extends ColorCategory> = keyof (typeof colors)[C];
