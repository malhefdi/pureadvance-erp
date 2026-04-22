/**
 * Pure Advance ERP — Data Access Layer
 * 
 * Uses Supabase when configured, falls back to mock data.
 * Components import from here instead of mock-data.ts directly.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import * as mock from "./mock-data";
import type {
  Zone,
  Equipment,
  Batch,
  QCRecord,
  Material,
  BOMEntry,
  ProcessStage,
  Order,
} from "@/types/erp";

// ============================================================
// ZONES
// ============================================================

export async function getZones(): Promise<Zone[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.zones;
  const { data, error } = await supabase.from("zones").select("*").order("name");
  if (error) throw new Error(`Failed to fetch zones: ${error.message}`);
  return data.map(mapZone);
}

function mapZone(row: any): Zone {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    area: row.area,
    isoClass: row.iso_class,
    temperature: row.temperature,
    description: row.description,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
  };
}

// ============================================================
// EQUIPMENT
// ============================================================

export async function getEquipment(): Promise<Equipment[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.equipment;
  const { data, error } = await supabase.from("equipment").select("*").order("name");
  if (error) throw new Error(`Failed to fetch equipment: ${error.message}`);
  return data.map(mapEquipment);
}

function mapEquipment(row: any): Equipment {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    zoneId: row.zone_id,
    specs: row.specs || {},
    vendor: row.vendor,
    costRange: row.cost_range,
    status: row.status,
    lastMaintenance: row.last_maintenance,
    nextMaintenance: row.next_maintenance,
    hoursRunning: row.hours_running,
    efficiency: row.efficiency,
  };
}

// ============================================================
// BATCHES
// ============================================================

export async function getBatches(): Promise<Batch[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.batches;
  const { data, error } = await supabase.from("batches").select("*").order("start_date", { ascending: false });
  if (error) throw new Error(`Failed to fetch batches: ${error.message}`);
  return data.map(mapBatch);
}

function mapBatch(row: any): Batch {
  return {
    id: row.id,
    product: row.product,
    size: row.size,
    status: row.status,
    startDate: row.start_date,
    estimatedCompletion: row.estimated_completion,
    currentStage: row.current_stage,
    parentBatches: row.parent_batches,
    equipmentUsed: row.equipment_used || [],
    qcResults: [], // load separately if needed
    materials: [],  // load separately if needed
    yield: row.yield,
    notes: row.notes,
  };
}

// ============================================================
// MATERIALS
// ============================================================

export async function getMaterials(): Promise<Material[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.materials;
  const { data, error } = await supabase.from("materials").select("*").order("name");
  if (error) throw new Error(`Failed to fetch materials: ${error.message}`);
  return data.map(mapMaterial);
}

function mapMaterial(row: any): Material {
  return {
    id: row.id,
    name: row.name,
    function: row.function,
    usagePercentMin: row.usage_percent_min,
    usagePercentMax: row.usage_percent_max,
    supplier: row.supplier,
    pricePerKg: row.price_per_kg,
    currency: row.currency,
    stockLevel: row.stock_level,
    reorderPoint: row.reorder_point,
    unit: row.unit,
  };
}

// ============================================================
// BOM ENTRIES
// ============================================================

export async function getBOMEntries(): Promise<BOMEntry[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.bomEntries;
  const { data, error } = await supabase.from("bom_entries").select("*").order("material_name");
  if (error) throw new Error(`Failed to fetch BOM entries: ${error.message}`);
  return data.map(mapBOMEntry);
}

function mapBOMEntry(row: any): BOMEntry {
  return {
    id: row.id,
    productId: row.product_id,
    materialId: row.material_id,
    materialName: row.material_name,
    percentMin: row.percent_min,
    percentMax: row.percent_max,
    percentMid: row.percent_mid,
    function: row.function,
    supplier: row.supplier,
    costPerKg: row.cost_per_kg,
  };
}

// ============================================================
// PROCESS STAGES
// ============================================================

export async function getProcessStages(): Promise<ProcessStage[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.processStages;
  const { data, error } = await supabase.from("process_stages").select("*").order("name");
  if (error) throw new Error(`Failed to fetch process stages: ${error.message}`);
  return data.map(mapProcessStage);
}

function mapProcessStage(row: any): ProcessStage {
  return {
    id: row.id,
    name: row.name,
    zone: row.zone,
    description: row.description,
    duration: row.duration,
    equipment: row.equipment,
    parameters: row.parameters,
    qcRequired: row.qc_required,
  };
}

// ============================================================
// ORDERS
// ============================================================

export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured() || !supabase) return mock.orders;
  const { data, error } = await supabase.from("orders").select("*").order("order_date", { ascending: false });
  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return data.map(mapOrder);
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    customer: row.customer,
    product: row.product,
    quantity: row.quantity,
    unit: row.unit,
    status: row.status,
    orderDate: row.order_date,
    shipDate: row.ship_date,
    deliveredDate: row.delivered_date,
  };
}
