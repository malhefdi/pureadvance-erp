# Zone-Level P&ID Factory Floor Plan — Task Plan

**Date:** 2026-04-22
**Status:** Planning
**Methodology:** Research → Think → Plan → Implement → Review → Optimize
**Principle:** Each zone IS a P&ID drawing. Status indicators are layered on top. Not a skin over rectangles — a real process diagram with live data.

---

## 1. RESEARCH SUMMARY

### What a P&ID Is (ISA-5.1)
- **Piping & Instrumentation Diagram** — the engineering blueprint of a process
- Shows: equipment, piping, valves, instruments, control loops, flow direction
- Standard: **ISA-5.1-2009** (American National Standard)
- Every symbol has meaning. Every line is a pipe. Every circle is an instrument.

### What Each Zone's P&ID Must Show

| Zone | Core Equipment | Key Piping | Instruments | Control Loops |
|------|---------------|------------|-------------|---------------|
| **Upstream** | Bioreactors (50L, 500L, seed), media prep tank, autoclave | Air supply, media feed, exhaust, cooling water, steam | TI (temp), PI (pressure), FI (flow), pH, DO, agitator speed | Temp control, pH control, DO cascade, foam detection |
| **Downstream** | Centrifuge, spray dryer, buffer tanks | Harvest line, CIP supply/return, condensate, product outlet | TI, PI, FI, speed sensor, differential pressure | Centrifuge speed, dryer temp control |
| **Formulation** | Blender, homogenizer, holding tanks | Active ingredient feed, excipient feed, product outlet | Weight (load cell), TI, viscosity | Blend time, homogenizer pressure |
| **QC** | HPLC, incubators, laminar flow hood | N/A (lab, not process) | Temp monitoring, particle counter | Incubator temp control |
| **Packaging** | Filler, sealer, labeler | Product supply, reject line | Counter, weight check, vision system | Fill volume, seal integrity |
| **Warehouse** | Cold storage, staging | Refrigerant lines | TI (multiple points), door alarm | Cold storage temp control |
| **Utilities** | WFI system, clean steam generator, chiller, compressor | WFI loop, steam, chilled water, compressed air | TI, PI, FI, conductivity, TOC | WFI loop temp, chiller setpoint |

### Existing Infrastructure to Reuse
- `src/lib/pid-symbols.ts` (557 lines) — ISA-5.1 symbol library with:
  - Equipment symbols (vessels, pumps, heat exchangers)
  - Valve symbols (gate, globe, ball, butterfly, check, control)
  - Instrument symbols (with ISA letter codes)
  - Piping line types (process, instrument, electrical)
  - Connection points for each symbol
- `src/components/pid/pid-viewer.tsx` (590 lines) — existing P&ID viewer with:
  - SVG rendering engine
  - Zoom/pan
  - Symbol selection
  - Pre-built Bt fermentation drawing
- `src/types/pid.ts` (185 lines) — type definitions for P&ID elements

---

## 2. THINK — Design Decisions

### Architecture Decision: Embedded P&ID vs. Linked P&ID

**Decision: Embedded P&ID** — each zone's expanded view renders the P&ID inline, not as a link to /pid.

**Rationale:**
- User clicks zone → sees the process diagram immediately
- No context switching
- Status indicators are part of the diagram, not overlaid post-render
- Maintains the "zone IS a P&ID" mental model

### Status Overlay Strategy

Status is not a separate layer — it's **encoded in the P&ID elements themselves:**

| P&ID Element | Status Encoding |
|--------------|-----------------|
| Equipment (vessel, tank) | Border color = status (green/amber/red/gray), fill opacity = activity |
| Valve | Position indicator (open/closed/partial), color = state |
| Instrument bubble | Value displayed inside, alarm state = red ring |
| Pipe | Animated flow dots when active, thickness = flow rate |
| Control loop | Setpoint vs. actual value, mode indicator (auto/manual) |

### Interaction Model

| Action | Result |
|--------|--------|
| Click zone on overview | Expand to full P&ID |
| Hover equipment | Tooltip with live data (temp, pressure, efficiency) |
| Click equipment | Detail panel slides in from right |
| Click instrument | Show trend sparkline + alarm history |
| Click valve | Show position + last actuation |
| "Back to Overview" | Collapse to floor map |

---

## 3. PLAN — Detailed Task List

### Phase 1: Data Layer (Foundation)
*Must be complete before any visual work*

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 1.1 | **Define P&ID data model for each zone** | Create TypeScript interfaces for zone P&ID: equipment nodes, pipe connections, instrument points, control loops | — |
| 1.2 | **Create Upstream P&ID data** | Define the 50L/500L bioreactor train: vessels, agitators, air supply, media feed, harvest, CIP, cooling, instruments (TI, PI, FI, pH, DO) | 1.1 |
| 1.3 | **Create Downstream P&ID data** | Centrifuge → buffer tank → spray dryer: harvest pipe, feed lines, CIP, condensate, instruments | 1.1 |
| 1.4 | **Create Formulation P&ID data** | Blender → homogenizer → holding tank: ingredient feeds, product outlet, load cells | 1.1 |
| 1.5 | **Create Utilities P&ID data** | WFI generation → loop → points of use, clean steam generator, chiller, compressed air | 1.1 |
| 1.6 | **Create Packaging P&ID data** | Filler → sealer → labeler: product supply, reject line, counters | 1.1 |
| 1.7 | **Create QC P&ID data** | Lab layout with instruments (simplified — no piping) | 1.1 |
| 1.8 | **Create Warehouse P&ID data** | Cold storage zones, refrigerant loop, temp monitoring points | 1.1 |
| 1.9 | **Create mock instrument values** | Temp, pressure, flow, pH, DO values for each instrument point | 1.2–1.8 |
| 1.10 | **Create mock alarm states** | Define which instruments are in alarm/warning/normal | 1.9 |

### Phase 2: P&ID Renderer (Core Engine)

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 2.1 | **Build ZonePIDRenderer component** | SVG component that takes P&ID data model and renders: equipment, pipes, instruments, valves | 1.1 |
| 2.2 | **Implement equipment rendering** | Draw vessels (vertical/horizontal), pumps, heat exchangers, agitators using pid-symbols.ts | 2.1 |
| 2.3 | **Implement pipe rendering** | Draw pipes with correct line types (process = solid, instrument = dashed), flow direction arrows | 2.1 |
| 2.4 | **Implement valve rendering** | Draw valves at connection points, show position (open/closed/partial) | 2.1 |
| 2.5 | **Implement instrument bubbles** | ISA-5.1 bubble format: circle with letter code (TI-101), connection line to measurement point | 2.1 |
| 2.6 | **Implement control loop visualization** | Show setpoint/actual, auto/manual mode, alarm thresholds | 2.5 |
| 2.7 | **Add connection point snapping** | Pipes connect to equipment at defined connection points (from pid-symbols.ts) | 2.2, 2.3 |

### Phase 3: Status Overlay (Live Data)

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 3.1 | **Equipment status coloring** | Border + fill based on running/maintenance/offline/idle | 2.2 |
| 3.2 | **Flow animation** | Animated dots along pipes when flow is active, speed proportional to flow rate | 2.3 |
| 3.3 | **Instrument value display** | Show live value inside instrument bubble, color by alarm state | 2.5 |
| 3.4 | **Valve position indicator** | Visual indicator of valve state (color + position marker) | 2.4 |
| 3.5 | **Alarm indicators** | Pulsing red ring on alarmed instruments, alarm banner at zone level | 3.3 |
| 3.6 | **Batch tracking overlay** | Show which batch is in which equipment, batch ID labels on active equipment | 3.1 |

### Phase 4: Interaction Layer

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 4.1 | **Hover tooltips** | On hover: equipment name, status, key values (temp, pressure, efficiency) | 2.2 |
| 4.2 | **Click → detail panel** | On click equipment: slide-in panel with specs, hours, maintenance, linked batches | 4.1 |
| 4.3 | **Instrument click → trend** | On click instrument: sparkline showing last N readings, alarm history | 2.5 |
| 4.4 | **Valve click → control** | On click valve: position, last actuation, manual/auto mode | 2.4 |
| 4.5 | **Zoom/pan on P&ID** | Scroll to zoom, drag to pan (reuse pid-viewer.tsx patterns) | 2.1 |
| 4.6 | **Mini-map** | Small overview in corner showing current viewport position | 4.5 |

### Phase 5: Integration

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 5.1 | **Replace ExpandedZoneView** | Swap current card-based expanded view with P&ID renderer | 2.1, 3.1 |
| 5.2 | **Keep facility overview** | Floor map with zones remains as-is (overview level) | — |
| 5.3 | **Zone summary bar** | At top of P&ID view: zone name, ISO class, KPIs (equipment online, efficiency, active batches) | 5.1 |
| 5.4 | **Breadcrumb navigation** | Facility > Zone > Equipment drill-down path | 5.1 |
| 5.5 | **Responsive behavior** | Desktop: full P&ID. Tablet: scrollable. Mobile: simplified view | 5.1 |

### Phase 6: Polish & Validation

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| 6.1 | **ISA-5.1 compliance check** | Verify all symbols match standard, letter codes are correct | 2.1 |
| 6.2 | **Legend** | P&ID legend showing all symbol types, line types, alarm states | 2.1 |
| 6.3 | **Print/export** | Ability to export P&ID as SVG/PDF for documentation | 4.5 |
| 6.4 | **Accessibility** | ARIA labels on equipment, keyboard navigation, screen reader support | 4.1 |
| 6.5 | **Performance** | SVG optimization, lazy rendering for large P&IDs, virtual scrolling | 2.1 |
| 6.6 | **User testing** | Review with domain expert (Mohammed) for accuracy | 5.1 |

---

## 4. IMPLEMENTATION ORDER

```
Phase 1 (Data) ──────► Phase 2 (Renderer) ──────► Phase 3 (Status) ──────► Phase 4 (Interaction)
     │                       │                        │                        │
     │                       │                        │                        │
     ▼                       ▼                        ▼                        ▼
 1.1 → 1.2-1.8         2.1 → 2.2-2.7           3.1 → 3.2-3.6           4.1 → 4.2-4.6
     │                       │                        │                        │
     └───────────────────────┴────────────────────────┴────────────────────────┘
                                        │
                                        ▼
                                Phase 5 (Integration)
                                        │
                                        ▼
                                Phase 6 (Polish)
```

---

## 5. FILES TO CREATE/MODIFY

| File | Action | Purpose |
|------|--------|---------|
| `src/types/pid-zone.ts` | CREATE | Zone-specific P&ID data model |
| `src/lib/pid-data/upstream.ts` | CREATE | Upstream zone P&ID definition |
| `src/lib/pid-data/downstream.ts` | CREATE | Downstream zone P&ID definition |
| `src/lib/pid-data/formulation.ts` | CREATE | Formulation zone P&ID definition |
| `src/lib/pid-data/utilities.ts` | CREATE | Utilities zone P&ID definition |
| `src/lib/pid-data/packaging.ts` | CREATE | Packaging zone P&ID definition |
| `src/lib/pid-data/qc.ts` | CREATE | QC zone P&ID definition |
| `src/lib/pid-data/warehouse.ts` | CREATE | Warehouse zone P&ID definition |
| `src/lib/pid-data/index.ts` | CREATE | Aggregator + mock instrument values |
| `src/components/factory/zone-pid-renderer.tsx` | CREATE | Core P&ID SVG renderer |
| `src/components/factory/zone-pid-overlay.tsx` | CREATE | Status overlay layer |
| `src/components/factory/zone-pid-tooltip.tsx` | CREATE | Hover/click tooltips |
| `src/components/factory/zone-pid-detail.tsx` | CREATE | Equipment/instrument detail panel |
| `src/components/factory/factory-floor-plan.tsx` | MODIFY | Replace ExpandedZoneView with P&ID |
| `src/lib/pid-symbols.ts` | MODIFY | Add any missing symbols for biotech |

---

## 6. DEFINITION OF DONE

- [ ] Each zone renders a real P&ID with ISA-5.1 symbols
- [ ] Equipment status visible on P&ID (green/amber/red)
- [ ] Flow animation on active pipes
- [ ] Instrument values displayed in bubbles
- [ ] Alarm states clearly visible
- [ ] Click any element → detail panel
- [ ] Zoom/pan works smoothly
- [ ] Legend available
- [ ] Build passes with zero errors
- [ ] Mohammed reviews and confirms accuracy

---

*Ready to begin Phase 1 when approved.*
