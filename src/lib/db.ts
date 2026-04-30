/**
 * Supabase-based database client that exposes a Prisma-compatible API.
 *
 * All table names use snake_case (Supabase convention).
 * Model names in the API use camelCase to match the old Prisma usage.
 */

import { supabaseAdmin } from "@/lib/supabase";
import type * as DbTypes from "@/lib/db-types";

// ============================================================
// Table name mapping: camelCase model → snake_case Supabase table
// ============================================================

const modelToTable: Record<string, string> = {
  user: "users",
  account: "accounts",
  session: "sessions",
  verificationToken: "verification_tokens",
  salon: "salons",
  salonPhoto: "salon_photos",
  openingHours: "opening_hours",
  serviceCategory: "service_categories",
  service: "services",
  staffService: "staff_services",
  staffMember: "staff_members",
  staffSchedule: "staff_schedules",
  staffAbsence: "staff_absences",
  clockEvent: "clock_events",
  booking: "bookings",
  bookingItem: "booking_items",
  review: "reviews",
  payment: "payments",
  giftCard: "gift_cards",
  giftCardUsage: "gift_card_usages",
  product: "products",
  supplier: "suppliers",
  favorite: "favorites",
  loyaltyCard: "loyalty_cards",
  loyaltyTransaction: "loyalty_transactions",
  notification: "notifications",
  marketingCampaign: "marketing_campaigns",
};

function tableName(model: string): string {
  const t = modelToTable[model];
  if (!t) throw new Error(`Unknown model: ${model}`);
  return t;
}

// ============================================================
// Filter builder – converts Prisma-style where to Supabase
// ============================================================

function buildFilters(where: Record<string, unknown>): string[] {
  const filters: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (key === "OR") continue;
    if (value === null || value === undefined) continue;

    if (typeof value === "object" && value !== null) {
      const ops = value as Record<string, unknown>;

      if ("in" in ops) {
        const arr = ops.in as unknown[];
        filters.push(`${key}.in.(${arr.join(",")})`);
      } else if ("contains" in ops) {
        filters.push(`${key}.ilike.%${ops.contains}%`);
      } else if ("gte" in ops) {
        filters.push(`${key}.gte.${ops.gte}`);
      } else if ("lte" in ops) {
        filters.push(`${key}.lte.${ops.lte}`);
      } else if ("gt" in ops) {
        filters.push(`${key}.gt.${ops.gt}`);
      } else if ("lt" in ops) {
        filters.push(`${key}.lt.${ops.lt}`);
      } else if ("not" in ops) {
        filters.push(`${key}.neq.${ops.not}`);
      }
    } else {
      filters.push(`${key}.eq.${value}`);
    }
  }

  return filters;
}

// ============================================================
// Order-by builder
// ============================================================

function buildOrderBy(orderBy: Record<string, string> | string): { column: string; ascending: boolean } | null {
  if (typeof orderBy === "string") {
    return { column: "created_at", ascending: orderBy === "asc" };
  }
  const entries = Object.entries(orderBy);
  if (entries.length === 0) return null;
  const [col, dir] = entries[0];
  const sc = col.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  return { column: sc, ascending: dir === "asc" };
}

// ============================================================
// Apply filters to a query builder
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyFilters(query: any, filters: string[]) {
  for (const f of filters) {
    const firstDot = f.indexOf(".");
    const secondDot = f.indexOf(".", firstDot + 1);
    const col = f.substring(0, firstDot);
    const op = f.substring(firstDot + 1, secondDot);
    const val = f.substring(secondDot + 1);
    query = query.filter(col, op, val);
  }
  return query;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================================
// Build select string for include
// ============================================================

function buildSelect(include?: Record<string, boolean | object>): string {
  if (!include || Object.keys(include).length === 0) return "*";
  const relations = Object.keys(include);
  const parts = relations.map((r) => {
    const relTable = modelToTable[r] || r;
    return `${relTable}(*)`;
  });
  return `*,${parts.join(",")}`;
}

// ============================================================
// Flatten nested Prisma-style create objects
// ============================================================

function flattenNestedCreates(data: Record<string, unknown>): { flatData: Record<string, unknown> } {
  const flatData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).create === "object") {
      continue;
    }
    flatData[key] = value;
  }
  return { flatData };
}

// ============================================================
// Model handler implementation
// ============================================================

interface ModelHandler {
  findUnique(args: { where: Record<string, unknown>; include?: Record<string, boolean | object>; select?: Record<string, boolean> }): Promise<any>;
  findFirst(args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> | string; include?: Record<string, boolean | object> }): Promise<any>;
  findMany(args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> | string; skip?: number; take?: number; include?: Record<string, boolean | object>; select?: Record<string, boolean> }): Promise<any[]>;
  create(args: { data: Record<string, unknown>; include?: Record<string, boolean> }): Promise<any>;
  update(args: { where: Record<string, unknown>; data: Record<string, unknown>; include?: Record<string, boolean> }): Promise<any>;
  delete(args: { where: Record<string, unknown> }): Promise<any>;
  deleteMany(args?: { where?: Record<string, unknown> }): Promise<void>;
  createMany(args: { data: Record<string, unknown>[] }): Promise<void>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
  aggregate(args: { where?: Record<string, unknown>; _avg?: Record<string, boolean>; _count?: boolean | Record<string, boolean> }): Promise<{ _avg: Record<string, number | null>; _count: number }>;
}

function createModelHandler(model: string): ModelHandler {
  const table = () => tableName(model);

  return {
    async findUnique(args: { where: Record<string, unknown>; include?: Record<string, boolean | object>; select?: Record<string, boolean> }) {
      const filters = buildFilters(args.where);
      const select = buildSelect(args.include);

      let query = supabaseAdmin.from(table()).select(select).limit(1);
      query = applyFilters(query, filters);

      // Handle select (field selection) - rebuild query if select is specified without include
      if (args.select && !args.include) {
        const cols = Object.keys(args.select).join(",");
        query = supabaseAdmin.from(table()).select(cols).limit(1);
        query = applyFilters(query, filters);
      }

      const { data, error } = await query;
      if (error) { console.error(`[db] findUnique ${model}:`, error.message); return null; }
      return (data as unknown[])[0] ?? null;
    },

    async findFirst(args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> | string; include?: Record<string, boolean | object> }) {
      const filters = args?.where ? buildFilters(args.where) : [];
      const select = buildSelect(args?.include);
      let query = supabaseAdmin.from(table()).select(select).limit(1);
      query = applyFilters(query, filters);
      if (args?.orderBy) {
        const ob = buildOrderBy(args.orderBy);
        if (ob) query = query.order(ob.column, { ascending: ob.ascending });
      }
      const { data, error } = await query;
      if (error) { console.error(`[db] findFirst ${model}:`, error.message); return null; }
      return (data as unknown[])[0] ?? null;
    },

    async findMany(args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> | string; skip?: number; take?: number; include?: Record<string, boolean | object> }) {
      const filters = args?.where ? buildFilters(args.where) : [];
      const select = buildSelect(args?.include);
      let query = supabaseAdmin.from(table()).select(select);
      query = applyFilters(query, filters);

      if (args?.orderBy) {
        const ob = buildOrderBy(args.orderBy);
        if (ob) query = query.order(ob.column, { ascending: ob.ascending });
      }
      if (args?.skip != null && args?.take != null) {
        query = query.range(args.skip, args.skip + args.take - 1);
      } else if (args?.take) {
        query = query.limit(args.take);
      }

      const { data, error } = await query;
      if (error) { console.error(`[db] findMany ${model}:`, error.message); return []; }
      return (data ?? []) as any[];
    },

    async create(args: { data: Record<string, unknown>; include?: Record<string, boolean> }) {
      const select = buildSelect(args.include);
      const { flatData } = flattenNestedCreates(args.data);
      const { data, error } = await supabaseAdmin.from(table()).insert(flatData).select(select).single();
      if (error) { console.error(`[db] create ${model}:`, error.message); throw error; }
      return data;
    },

    async update(args: { where: Record<string, unknown>; data: Record<string, unknown>; include?: Record<string, boolean> }) {
      const filters = buildFilters(args.where);
      const { flatData } = flattenNestedCreates(args.data);
      let query = supabaseAdmin.from(table()).update(flatData);
      query = applyFilters(query, filters);
      const { data, error } = await query.select().single();
      if (error) { console.error(`[db] update ${model}:`, error.message); throw error; }
      return data;
    },

    async delete(args: { where: Record<string, unknown> }) {
      const filters = buildFilters(args.where);
      let query = supabaseAdmin.from(table()).delete();
      query = applyFilters(query, filters);
      const { data, error } = await query.select().single();
      if (error) { console.error(`[db] delete ${model}:`, error.message); throw error; }
      return data;
    },

    async deleteMany(args?: { where?: Record<string, unknown> }) {
      const filters = args?.where ? buildFilters(args.where) : [];
      let query = supabaseAdmin.from(table()).delete();
      query = applyFilters(query, filters);
      const { error } = await query;
      if (error) { console.error(`[db] deleteMany ${model}:`, error.message); throw error; }
    },

    async createMany(args: { data: Record<string, unknown>[] }) {
      const flatRows = args.data.map((r) => flattenNestedCreates(r).flatData);
      const { error } = await supabaseAdmin.from(table()).insert(flatRows);
      if (error) { console.error(`[db] createMany ${model}:`, error.message); throw error; }
    },

    async count(args?: { where?: Record<string, unknown> }) {
      const filters = args?.where ? buildFilters(args.where) : [];
      let query = supabaseAdmin.from(table()).select("*", { count: "exact", head: true });
      query = applyFilters(query, filters);
      const { count, error } = await query;
      if (error) { console.error(`[db] count ${model}:`, error.message); return 0; }
      return count ?? 0;
    },

    async aggregate(args: { where?: Record<string, unknown>; _avg?: Record<string, boolean>; _count?: boolean | Record<string, boolean> }) {
      const filters = args.where ? buildFilters(args.where) : [];
      let query = supabaseAdmin.from(table()).select("*");
      query = applyFilters(query, filters);
      const { data, error } = await query;
      if (error) { console.error(`[db] aggregate ${model}:`, error.message); return { _avg: {}, _count: 0 }; }
      const rows = (data ?? []) as Record<string, unknown>[];

      const avgResult: Record<string, number | null> = {};
      if (args._avg) {
        for (const col of Object.keys(args._avg)) {
          const sc = col.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
          const vals = rows.map((r) => r[sc] ?? r[col]).filter((v): v is number => typeof v === "number");
          avgResult[col] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        }
      }

      return { _avg: avgResult, _count: rows.length };
    },
  };
}

// ============================================================
// $transaction support
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionCallback = (tx: any) => Promise<any>;

async function $transaction(fn: TransactionCallback): Promise<any> {
  return fn(db);
}

// ============================================================
// The `db` object with typed model access
// ============================================================

// We define the db type explicitly to provide type-safe model access
type DbModels = {
  user: ModelHandler;
  account: ModelHandler;
  session: ModelHandler;
  verificationToken: ModelHandler;
  salon: ModelHandler;
  salonPhoto: ModelHandler;
  openingHours: ModelHandler;
  serviceCategory: ModelHandler;
  service: ModelHandler;
  staffService: ModelHandler;
  staffMember: ModelHandler;
  staffSchedule: ModelHandler;
  staffAbsence: ModelHandler;
  clockEvent: ModelHandler;
  booking: ModelHandler;
  bookingItem: ModelHandler;
  review: ModelHandler;
  payment: ModelHandler;
  giftCard: ModelHandler;
  giftCardUsage: ModelHandler;
  product: ModelHandler;
  supplier: ModelHandler;
  favorite: ModelHandler;
  loyaltyCard: ModelHandler;
  loyaltyTransaction: ModelHandler;
  notification: ModelHandler;
  marketingCampaign: ModelHandler;
  $transaction: typeof $transaction;
};

const handler: ProxyHandler<Record<string, ModelHandler>> = {
  get(_target, prop: string) {
    if (prop === "$transaction") return $transaction;
    return createModelHandler(prop);
  },
};

export const db = new Proxy({} as Record<string, ModelHandler>, handler) as unknown as DbModels;

// Re-export types for consumers
export type * from "@/lib/db-types";