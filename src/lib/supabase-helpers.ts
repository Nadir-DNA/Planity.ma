/**
 * Supabase Admin REST Helpers
 *
 * Thin wrappers around supabaseAdmin for common CRUD patterns.
 * Replaces Prisma `db.xxx` calls with Supabase REST equivalents.
 */

import { supabaseAdmin } from "@/lib/supabase";
import { createId } from "@paralleldrive/cuid2";

/** Generate a CUID2 id — required for Supabase tables without DEFAULT on `id` */
export const createId2 = createId;

// ============================================================
// Types
// ============================================================

export type QueryFilter = Record<string, unknown>;
export type OrderSpec = { column: string; ascending?: boolean };

// ============================================================
// Generic CRUD helpers
// ============================================================

/**
 * Find a single row by ID.
 * Equivalent to: db.model.findUnique({ where: { id } })
 */
export async function findById<T = unknown>(table: string, id: string): Promise<T | null> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // 0 rows
    throw new Error(`findById(${table}, ${id}): ${error.message}`);
  }
  return data as T;
}

/**
 * Find a single row by a unique column value.
 * Equivalent to: db.model.findUnique({ where: { [column]: value } })
 */
export async function findByUnique<T = unknown>(table: string, column: string, value: unknown): Promise<T | null> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq(column, value as string | number | boolean)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`findByUnique(${table}, ${column}): ${error.message}`);
  }
  return data as T;
}

/**
 * Find multiple rows with optional filters, ordering, and pagination.
 * Equivalent to: db.model.findMany({ where, orderBy, skip, take })
 */
export async function findMany<T = unknown>(
  table: string,
  options?: {
    filters?: QueryFilter;
    order?: OrderSpec | OrderSpec[];
    range?: { from: number; to: number };
    select?: string;
  },
): Promise<T[]> {
  let query = supabaseAdmin.from(table).select(options?.select || "*");

  if (options?.filters) {
    query = applyFilters(query, options.filters);
  }

  if (options?.order) {
    const orders = Array.isArray(options.order) ? options.order : [options.order];
    for (const o of orders) {
      query = query.order(o.column, { ascending: o.ascending ?? true });
    }
  }

  if (options?.range) {
    query = query.range(options.range.from, options.range.to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`findMany(${table}): ${error.message}`);
  }
  return (data as T[]) || [];
}

/**
 * Find first matching row.
 * Equivalent to: db.model.findFirst({ where })
 */
export async function findFirst<T = unknown>(
  table: string,
  options?: {
    filters?: QueryFilter;
    order?: OrderSpec | OrderSpec[];
    select?: string;
  },
): Promise<T | null> {
  let query = supabaseAdmin.from(table).select(options?.select || "*");

  if (options?.filters) {
    query = applyFilters(query, options.filters);
  }

  if (options?.order) {
    const orders = Array.isArray(options.order) ? options.order : [options.order];
    for (const o of orders) {
      query = query.order(o.column, { ascending: o.ascending ?? true });
    }
  }

  query = query.limit(1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`findFirst(${table}): ${error.message}`);
  }
  return (data as T[])?.[0] ?? null;
}

/**
 * Count rows matching filters.
 * Equivalent to: db.model.count({ where })
 */
export async function countRows(
  table: string,
  filters?: QueryFilter,
): Promise<number> {
  let query = supabaseAdmin.from(table).select("*", { count: "exact", head: true });

  if (filters) {
    query = applyFilters(query, filters);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`countRows(${table}): ${error.message}`);
  }
  return count ?? 0;
}

/**
 * Insert one or more rows.
 * Equivalent to: db.model.create({ data }) or db.model.createMany({ data })
 */
export async function insertRow<T = unknown>(table: string, data: Record<string, unknown>): Promise<T> {
  const { data: row, error } = await supabaseAdmin
    .from(table)
    .insert(data)
    .select("*")
    .single();

  if (error) {
    throw new Error(`insertRow(${table}): ${error.message}`);
  }
  return row as T;
}

/**
 * Insert multiple rows and return them.
 */
export async function insertRows<T = unknown>(table: string, rows: Record<string, unknown>[]): Promise<T[]> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(`insertRows(${table}): ${error.message}`);
  }
  return (data as T[]) || [];
}

/**
 * Update rows matching filters.
 * Equivalent to: db.model.update({ where: { id }, data })
 */
export async function updateRow<T = unknown>(
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  const { data: row, error } = await supabaseAdmin
    .from(table)
    .update(data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`updateRow(${table}, ${id}): ${error.message}`);
  }
  return row as T;
}

/**
 * Update rows matching filters and return all of them.
 */
export async function updateRows<T = unknown>(
  table: string,
  filters: QueryFilter,
  data: Record<string, unknown>,
): Promise<T[]> {
  let query = supabaseAdmin.from(table).update(data);

  query = applyFilters(query, filters);

  const { data: rows, error } = await query.select("*");

  if (error) {
    throw new Error(`updateRows(${table}): ${error.message}`);
  }
  return (rows as T[]) || [];
}

/**
 * Delete a row by ID.
 * Equivalent to: db.model.delete({ where: { id } })
 */
export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`deleteRow(${table}, ${id}): ${error.message}`);
  }
}

/**
 * Delete rows matching filters.
 * Equivalent to: db.model.deleteMany({ where })
 */
export async function deleteRows(table: string, filters: QueryFilter): Promise<void> {
  let query = supabaseAdmin.from(table).delete();
  query = applyFilters(query, filters);

  const { error } = await query;

  if (error) {
    throw new Error(`deleteRows(${table}): ${error.message}`);
  }
}

// ============================================================
// Filter helpers
// ============================================================

/**
 * Apply a set of filters to a Supabase query builder.
 * Supports:
 *   - column: value           → .eq(column, value)
 *   - column: { in: [...] }  → .in(column, values)
 *   - column: { gte: val }   → .gte(column, val)
 *   - column: { lte: val }   → .lte(column, val)
 *   - column: { gt: val }    → .gt(column, val)
 *   - column: { lt: val }    → .lt(column, val)
 *   - column: { contains: val } → .ilike(column, `%${val}%`)
 *   - column: { eq: val }    → .eq(column, val)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: QueryFilter): any {
  for (const [column, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      const op = value as Record<string, unknown>;
      if ("in" in op) {
        query = query.in(column, op.in as unknown[]);
      } else if ("gte" in op && "lt" in op) {
        query = query.gte(column, op.gte as string | number);
        query = query.lt(column, op.lt as string | number);
      } else if ("gte" in op) {
        query = query.gte(column, op.gte as string | number);
      } else if ("lte" in op) {
        query = query.lte(column, op.lte as string | number);
      } else if ("gt" in op) {
        query = query.gt(column, op.gt as string | number);
      } else if ("lt" in op) {
        query = query.lt(column, op.lt as string | number);
      } else if ("contains" in op) {
        query = query.ilike(column, `%${op.contains}%`);
      } else if ("eq" in op) {
        query = query.eq(column, op.eq as string | number | boolean);
      }
    } else {
      query = query.eq(column, value as string | number | boolean);
    }
  }
  return query;
}

// ============================================================
// Re-export supabaseAdmin for direct use
// ============================================================

export { supabaseAdmin };