-- Pure Advance ERP — Initial Schema
-- Maps types/erp.ts to Supabase tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ZONES
-- ============================================================
CREATE TABLE zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('upstream', 'downstream', 'formulation', 'packaging', 'qc', 'warehouse', 'utilities')),
  area NUMERIC NOT NULL, -- m²
  iso_class TEXT,
  temperature TEXT,
  description TEXT NOT NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EQUIPMENT
-- ============================================================
CREATE TABLE equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('upstream', 'downstream', 'formulation', 'utilities', 'lab', 'packaging')),
  zone_id TEXT REFERENCES zones(id) ON DELETE SET NULL,
  specs JSONB DEFAULT '{}',
  vendor TEXT NOT NULL,
  cost_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('running', 'idle', 'maintenance', 'offline', 'cleaning')),
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  hours_running NUMERIC DEFAULT 0,
  efficiency NUMERIC DEFAULT 100 CHECK (efficiency >= 0 AND efficiency <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATERIALS
-- ============================================================
CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  function TEXT NOT NULL,
  usage_percent_min NUMERIC DEFAULT 0,
  usage_percent_max NUMERIC DEFAULT 0,
  supplier TEXT NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  stock_level NUMERIC DEFAULT 0,
  reorder_point NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROCESS STAGES
-- ============================================================
CREATE TABLE process_stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('upstream', 'downstream', 'formulation', 'packaging', 'qc', 'warehouse', 'utilities')),
  description TEXT NOT NULL,
  duration TEXT,
  equipment TEXT[],
  parameters JSONB,
  qc_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BATCHES
-- ============================================================
CREATE TABLE batches (
  id TEXT PRIMARY KEY,
  product TEXT NOT NULL,
  size NUMERIC NOT NULL, -- kg
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'qc_pending', 'approved', 'released', 'rejected', 'on_hold')),
  start_date DATE NOT NULL,
  estimated_completion DATE NOT NULL,
  current_stage TEXT NOT NULL,
  parent_batches TEXT[],
  equipment_used TEXT[] DEFAULT '{}',
  yield NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QC RECORDS
-- ============================================================
CREATE TABLE qc_records (
  id TEXT PRIMARY KEY,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  target_value TEXT NOT NULL,
  actual_value TEXT NOT NULL,
  unit TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pass', 'fail', 'pending', 'adjustment_needed')),
  tested_by TEXT NOT NULL,
  tested_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOM ENTRIES
-- ============================================================
CREATE TABLE bom_entries (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  material_id TEXT REFERENCES materials(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  percent_min NUMERIC DEFAULT 0,
  percent_max NUMERIC DEFAULT 0,
  percent_mid NUMERIC DEFAULT 0,
  function TEXT NOT NULL,
  supplier TEXT NOT NULL,
  cost_per_kg NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  order_date DATE NOT NULL,
  ship_date DATE,
  delivered_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_equipment_zone ON equipment(zone_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_qc_records_batch ON qc_records(batch_id);
CREATE INDEX idx_bom_entries_product ON bom_entries(product_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================
-- ROW LEVEL SECURITY (optional — enable when auth is added)
-- ============================================================
-- ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE qc_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bom_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
