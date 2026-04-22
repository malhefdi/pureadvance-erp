-- Pure Advance ERP — Seed Data
-- Populates tables with existing mock data for development

-- Run this after 001_initial_schema.sql
-- Usage: supabase db reset (includes seeds) or psql -f seed.sql

-- Zones
INSERT INTO zones (id, name, type, area, iso_class, temperature, description, x, y, width, height) VALUES
('z-upstream', 'Upstream Fermentation', 'upstream', 200, 'ISO 7', '30-37°C', 'Inoculum preparation and main fermentation vessels', 50, 50, 300, 200),
('z-downstream', 'Downstream Processing', 'downstream', 150, 'ISO 7', '15-25°C', 'Harvest, concentration, and drying', 400, 50, 300, 200),
('z-formulation', 'Formulation & Blending', 'formulation', 100, 'ISO 8', '20-25°C', 'Product formulation and stabilization', 50, 300, 300, 150),
('z-qc', 'Quality Control Lab', 'qc', 80, 'ISO 8', '20-22°C', 'Microbial testing, potency assays, stability', 400, 300, 200, 150),
('z-packaging', 'Packaging & Labeling', 'packaging', 60, 'ISO 8', '20-25°C', 'Filling, labeling, and palletizing', 650, 300, 150, 150),
('z-warehouse', 'Warehouse', 'warehouse', 300, NULL, '15-25°C', 'Raw materials and finished goods storage', 650, 50, 200, 200)
ON CONFLICT (id) DO NOTHING;

-- Materials (INSEBT biopesticide formulation)
INSERT INTO materials (id, name, function, usage_percent_min, usage_percent_max, supplier, price_per_kg, currency, stock_level, reorder_point, unit) VALUES
('mat-001', 'Btk spore-crystal concentrate', 'Active ingredient', 10, 15, 'Pure Advance (in-house)', 45, 'USD', 500, 100, 'kg'),
('mat-002', 'Lignosulfonate', 'UV protectant / sticker', 3, 5, 'Borregaard', 2.8, 'USD', 2000, 500, 'kg'),
('mat-003', 'Xanthan gum', 'Suspension stabilizer', 0.5, 1, 'CP Kelco', 12, 'USD', 500, 100, 'kg'),
('mat-004', 'Sodium benzoate', 'Preservative', 0.2, 0.5, 'Emerald Kalama', 3.5, 'USD', 1000, 200, 'kg'),
('mat-005', 'Tween 20', 'Surfactant / wetter', 1, 2, 'Croda', 8, 'USD', 300, 50, 'L'),
('mat-006', 'Potassium sorbate', 'Preservative', 0.1, 0.3, 'Celanese', 4, 'USD', 800, 150, 'kg'),
('mat-007', 'Glycerol', 'Cryoprotectant', 5, 10, 'Emery Oleochemicals', 1.5, 'USD', 3000, 500, 'L'),
('mat-008', 'Water (purified)', 'Carrier / diluent', 60, 75, 'In-house (RO)', 0.001, 'USD', 999999, 10000, 'L')
ON CONFLICT (id) DO NOTHING;

-- Equipment
INSERT INTO equipment (id, name, category, zone_id, specs, vendor, cost_range, status, hours_running, efficiency) VALUES
('eq-001', 'BioFlo 310 50L', 'upstream', 'z-upstream', '{"volume": "50L", "type": "stirred-tank"}', 'Eppendorf', '$85,000–$120,000', 'running', 1200, 94),
('eq-002', 'BioFlo 610 500L', 'upstream', 'z-upstream', '{"volume": "500L", "type": "stirred-tank"}', 'Eppendorf', '$250,000–$350,000', 'idle', 0, 100),
('eq-003', 'Seed Fermenter 10L', 'upstream', 'z-upstream', '{"volume": "10L", "type": "stirred-tank"}', 'Eppendorf', '$35,000–$50,000', 'running', 2400, 92),
('eq-004', 'Disc Stack Centrifuge', 'downstream', 'z-downstream', '{"capacity": "500 L/hr", "type": "self-cleaning"}', 'Alfa Laval', '$120,000–$180,000', 'maintenance', 3600, 88),
('eq-005', 'Spray Dryer SD-1000', 'downstream', 'z-downstream', '{"capacity": "50 kg/hr", "inlet_temp": "180°C"}', 'Buchi', '$90,000–$140,000', 'running', 800, 91),
('eq-006', 'Ribbon Blender 500L', 'formulation', 'z-formulation', '{"volume": "500L", "type": "horizontal"}', 'Munson', '$25,000–$40,000', 'idle', 600, 96),
('eq-007', 'Autoclave ST-200', 'utilities', 'z-upstream', '{"volume": "200L", "temp": "121°C"}', 'Tuttnauer', '$15,000–$25,000', 'running', 5000, 99),
('eq-008', 'HPLC System', 'lab', 'z-qc', '{"type": "analytical", "detector": "UV-Vis"}', 'Agilent', '$50,000–$80,000', 'running', 1800, 95)
ON CONFLICT (id) DO NOTHING;

-- Batches
INSERT INTO batches (id, product, size, status, start_date, estimated_completion, current_stage, equipment_used, notes) VALUES
('batch-001', 'INSEBT Btk WP-25', 50, 'in_progress', '2026-04-15', '2026-04-29', 'Fermentation (Day 5/14)', ARRAY['eq-001', 'eq-003'], 'Pilot batch — culture expansion going well'),
('batch-002', 'INSEBT Btk WP-25', 10, 'qc_pending', '2026-04-01', '2026-04-18', 'QC Testing', ARRAY['eq-003'], 'Awaiting potency assay results'),
('batch-003', 'INSEBT Btk WP-25', 5, 'approved', '2026-03-20', '2026-04-05', 'Released', ARRAY['eq-003'], 'Stability sample retained')
ON CONFLICT (id) DO NOTHING;

-- Process Stages
INSERT INTO process_stages (id, name, zone, description, duration, equipment, qc_required) VALUES
('ps-001', 'Inoculum Preparation', 'upstream', 'Seed culture expansion from lyophilized stock', '3 days', ARRAY['eq-003'], true),
('ps-002', 'Main Fermentation', 'upstream', 'Submerged fermentation at 30°C, pH 7.0', '7-10 days', ARRAY['eq-001', 'eq-002'], true),
('ps-003', 'Harvest & Concentration', 'downstream', 'Centrifugation and diafiltration', '1 day', ARRAY['eq-004'], true),
('ps-004', 'Spray Drying', 'downstream', 'Inlet 180°C, outlet 65°C', '4 hours', ARRAY['eq-005'], true),
('ps-005', 'Formulation Blending', 'formulation', 'Mix active with adjuvants and carriers', '2 hours', ARRAY['eq-006'], false),
('ps-006', 'QC Release Testing', 'qc', 'Potency, purity, moisture, contaminant testing', '3-5 days', ARRAY['eq-008'], true),
('ps-007', 'Packaging', 'packaging', 'Filling into labeled containers', '1 day', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- BOM Entries (for INSEBT Btk WP-25)
INSERT INTO bom_entries (id, product_id, material_id, material_name, percent_min, percent_max, percent_mid, function, supplier, cost_per_kg) VALUES
('bom-001', 'prod-001', 'mat-001', 'Btk spore-crystal concentrate', 10, 15, 12.5, 'Active ingredient', 'Pure Advance (in-house)', 45),
('bom-002', 'prod-001', 'mat-002', 'Lignosulfonate', 3, 5, 4, 'UV protectant / sticker', 'Borregaard', 2.8),
('bom-003', 'prod-001', 'mat-003', 'Xanthan gum', 0.5, 1, 0.75, 'Suspension stabilizer', 'CP Kelco', 12),
('bom-004', 'prod-001', 'mat-004', 'Sodium benzoate', 0.2, 0.5, 0.35, 'Preservative', 'Emerald Kalama', 3.5),
('bom-005', 'prod-001', 'mat-005', 'Tween 20', 1, 2, 1.5, 'Surfactant / wetter', 'Croda', 8)
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (id, customer, product, quantity, unit, status, order_date, ship_date) VALUES
('ord-001', 'Delta AgriTech', 'INSEBT Btk WP-25', 200, 'kg', 'pending', '2026-04-20', NULL),
('ord-002', 'GreenShield Farms', 'INSEBT Btk WP-25', 50, 'kg', 'processing', '2026-04-10', '2026-04-25')
ON CONFLICT (id) DO NOTHING;
