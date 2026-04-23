# Factory Floor Plan — Redesign Plan
## Pure Advance ERP | INSEBT Biopesticide Production

**Date:** 2026-04-22
**Status:** Planning Phase
**Methodology:** Design Thinking (Research → Think → Plan → Implement → Review → Optimize)

---

## 1. RESEARCH FINDINGS

### What's Wrong With the Current Design

| Problem | Impact |
|---------|--------|
| Flat rectangles with no spatial logic | User can't understand physical relationships |
| Equipment shown as tiny text pills | Not scannable, no hierarchy |
| No material flow visualization | Can't see the production process |
| No pressure/airflow indicators | Missing critical GMP compliance info |
| No personnel flow paths | Missing contamination control logic |
| No environmental monitoring overlay | Missing real-time facility awareness |
| Corridor is a flat bar | Doesn't communicate GMP separation principles |
| No connection to batches in real-time | Floor plan is static, disconnected from ops |

### What Best-in-Class Biotech Facility Views Show

From GMP/pharma facility design research:

1. **Unidirectional Material Flow** — Raw → Upstream → Downstream → Formulation → QC → Packaging → Warehouse. Never backwards for contaminants.

2. **Pressure Cascades** — Higher pressure in cleaner zones (ISO 5) pushes air outward. Visualized as gradients/arrows.

3. **Cleanroom Classifications** — ISO 5/7/8 shown with color-coded zones, not just labels.

4. **Personnel Flow Separation** — Separate gowning/de-gowning paths. No crossover with material paths.

5. **Environmental Monitoring (EMS)** — Real-time temp, humidity, particle counts per zone.

6. **Equipment Status at a Glance** — Running/maintenance/offline visible from the overview, not hidden behind clicks.

7. **Process Stage Connection** — Active batches shown flowing through zones, not as static labels.

### What Good MES Factory Visualizations Include

- **Heat maps** for utilization, OEE, throughput
- **Drill-down** from zone → equipment → batch history
- **Real-time KPIs** overlaid on the floor plan (not in separate panels)
- **Alert indicators** — pulsing red on problem equipment/zones
- **Material flow lines** with direction arrows and batch IDs
- **Capacity indicators** — how full is each zone/equipment

---

## 2. THINK — Design Principles

### User-Centered Design Decisions

| Principle | Application |
|-----------|-------------|
| **Progressive Disclosure** | Overview first → zone detail → equipment detail → batch detail |
| **Glanceable Status** | Color + shape + position convey meaning without reading |
| **Spatial Accuracy** | Layout reflects real physical relationships (adjacency, flow) |
| **GMP Compliance** | Visualize pressure, classification, personnel/material separation |
| **Operational Context** | Connect floor plan to active batches, not just static zones |

### Visual Hierarchy

1. **Primary:** Zone status (color = classification, glow = activity level)
2. **Secondary:** Equipment status (dot color + pulse animation)
3. **Tertiary:** Batch flow (animated arrows with batch IDs)
4. **Contextual:** Environmental data (temp, pressure badges)

---

## 3. PLAN — Implementation Blueprint

### Layout Architecture (New SVG)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Facility KPIs (OEE, Active Batches, Alerts)           │
├───────────────┬───────────────────────┬─────────────────────────┤
│               │                       │                         │
│  UPSTREAM     │  TRANSFER             │  DOWNSTREAM             │
│  (ISO 8)      │  CORRIDOR             │  (ISO 7)                │
│               │  (Material Flow →)    │                         │
│  - Seed 10L   │                       │  - Centrifuge           │
│  - BioFlo 50L │                       │  - Spray Dryer          │
│  - BioFlo 500L│                       │                         │
│               │                       │                         │
├───────────────┤  ─ ─ ─ ─ ─ ─ ─ ─ ─   ├─────────────────────────┤
│               │  PERSONNEL CORRIDOR   │                         │
│  FORMULATION  │  (Gowning →)          │  QC LAB                │
│  (ISO 8)      │                       │  (ISO 8)               │
│               │                       │  - HPLC                │
│  - Blender    │                       │  - Incubators          │
│               │                       │                         │
├───────────────┼───────────────────────┼─────────────────────────┤
│               │                       │  PACKAGING              │
│  UTILITIES    │  WAREHOUSE            │  (ISO 8)               │
│  (No class)   │  (No class)           │                         │
│  - Autoclave  │  - RM Storage         │  - Filling             │
│  - WFI        │  - FG Storage         │  - Labeling            │
│               │                       │                         │
└───────────────┴───────────────────────┴─────────────────────────┘
```

### Zone Enhancements

| Zone | Add | Visual |
|------|-----|--------|
| All | ISO classification badge | Colored border (gold=5, blue=7, gray=8) |
| All | Pressure indicator | Arrow showing airflow direction |
| All | Activity heatmap | Background opacity based on batch activity |
| All | Environmental stats | Small badge: temp, humidity |
| Corridor | Animated material flow | Arrows with batch IDs moving |
| Gowning | Personnel flow path | Dashed line showing gowning sequence |

### Equipment Enhancements

| Change | Detail |
|--------|--------|
| Larger hit targets | Min 80×40px for mobile friendliness |
| Icon + name | Equipment type icon + abbreviated name |
| Status ring | Colored ring around equipment (green/yellow/red/gray) |
| Pulse for running | Subtle animation on active equipment |
| Efficiency bar | Mini progress bar under each equipment |
| Hover tooltip | Quick specs without clicking |

### Material Flow Animation

- Animated dashed lines connecting zones in process order
- Batch ID badges moving along the flow path
- Direction arrows at each transfer point
- Color coding by batch (different colors per active batch)

---

## 4. Components to Build

| Component | Purpose |
|-----------|---------|
| `FactoryFloorPlan` | Main orchestrator, SVG canvas |
| `ZoneBlock` | Individual zone with classification, pressure, equipment |
| `EquipmentNode` | Individual equipment with status, icon, efficiency |
| `MaterialFlowLine` | Animated connection between zones |
| `BatchFlowBadge` | Moving batch indicator on flow lines |
| `FacilityHeader` | KPIs bar above the floor plan |
| `EnvironmentalBadge` | Small overlay showing temp/humidity |
| `PressureArrow` | Airflow direction indicator |

---

## 5. Technical Decisions

- **SVG viewBox:** Expand to 1400×600 for more detail
- **Responsive:** Horizontal scroll on mobile, full view on desktop
- **Animation:** CSS keyframes for flow lines, no JS animation loop
- **Data:** Connect to mock data first, ready for real-time Supabase
- **Accessibility:** ARIA labels on zones, keyboard navigation

---

*Next: Implement phase*
