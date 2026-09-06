import { Pool } from "pg";
import type { DatabaseSchema } from "./db";

// Global pool singleton for Next.js hot-reloading
const globalForPg = globalThis as unknown as {
  supabasePgPool?: Pool;
};

export function getPgPool(): Pool {
  if (globalForPg.supabasePgPool) {
    return globalForPg.supabasePgPool;
  }

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POOLED_DATABASE_URL ||
    "postgresql://postgres.ncvtgsugunvbrjiautkd:6QDS%3Fc%21eA-cq%2Ba_@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected Supabase PostgreSQL client error:", err);
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPg.supabasePgPool = pool;
  }

  return pool;
}

/**
 * Initializes the required tables in Supabase PostgreSQL
 */
export async function initSupabaseSchema(): Promise<void> {
  const pool = getPgPool();
  const query = `
    CREATE TABLE IF NOT EXISTS practice_collections (
      collection_name VARCHAR(64) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_practice_collections_updated_at 
    ON practice_collections(updated_at);

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      zoho_booking_id TEXT UNIQUE,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      service_name TEXT,
      service_id TEXT,
      appointment_date DATE,
      appointment_time TEXT,
      timezone TEXT DEFAULT 'Asia/Kolkata',
      meeting_format TEXT DEFAULT 'online',
      client_notes TEXT,
      status TEXT,
      payment_status TEXT,
      source TEXT DEFAULT 'zoho',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_zoho_id ON bookings(zoho_booking_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
  `;
  await pool.query(query);
}

/**
 * Loads the full database schema from Supabase PostgreSQL
 */
export async function loadDatabaseFromSupabase(): Promise<DatabaseSchema | null> {
  const pool = getPgPool();
  try {
    const res = await pool.query(
      "SELECT collection_name, data FROM practice_collections"
    );

    if (res.rows.length === 0) {
      return null;
    }

    const partialDb: Record<string, any> = {};
    for (const row of res.rows) {
      partialDb[row.collection_name] = row.data;
    }

    return partialDb as unknown as DatabaseSchema;
  } catch (error) {
    console.error("Failed to load data from Supabase PostgreSQL:", error);
    return null;
  }
}

/**
 * Persists all collections to Supabase PostgreSQL atomically
 */
export async function saveDatabaseToSupabase(data: DatabaseSchema): Promise<void> {
  const pool = getPgPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const entries = Object.entries(data);
    for (const [collectionName, collectionData] of entries) {
      await client.query(
        `
        INSERT INTO practice_collections (collection_name, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (collection_name) 
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `,
        [collectionName, JSON.stringify(collectionData)]
      );

      // If updating bookings, also sync to the relational 'bookings' SQL table
      if (collectionName === "bookings" && Array.isArray(collectionData)) {
        for (const b of collectionData) {
          const zohoId = b.provider === "zoho" ? (b.id.startsWith("ZOHO-") ? b.id.replace("ZOHO-", "") : b.id) : null;
          await client.query(
            `
            INSERT INTO bookings (
              id, zoho_booking_id, client_name, client_email, client_phone,
              service_name, service_id, appointment_date, appointment_time,
              timezone, meeting_format, client_notes, status, payment_status,
              source, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE SET
              zoho_booking_id = EXCLUDED.zoho_booking_id,
              client_name = EXCLUDED.client_name,
              client_email = EXCLUDED.client_email,
              client_phone = EXCLUDED.client_phone,
              service_name = EXCLUDED.service_name,
              service_id = EXCLUDED.service_id,
              appointment_date = EXCLUDED.appointment_date,
              appointment_time = EXCLUDED.appointment_time,
              client_notes = EXCLUDED.client_notes,
              status = EXCLUDED.status,
              payment_status = EXCLUDED.payment_status,
              source = EXCLUDED.source,
              updated_at = NOW()
            `,
            [
              b.id,
              zohoId,
              b.clientName,
              b.clientEmail,
              b.clientPhone,
              b.serviceName,
              b.serviceId,
              b.appointmentDate,
              b.appointmentTime,
              "Asia/Kolkata",
              b.format || "online",
              b.clientMessage || b.internalNotes || null,
              b.bookingStatus,
              b.paymentStatus || "pending",
              b.provider || "internal",
              b.createdAt || new Date().toISOString(),
              b.updatedAt || new Date().toISOString(),
            ]
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to save database to Supabase PostgreSQL:", error);
    throw error;
  } finally {
    client.release();
  }
}
