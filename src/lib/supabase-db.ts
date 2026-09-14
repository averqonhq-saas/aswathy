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

  // Prioritize POOLED_DATABASE_URL (port 6543 Transaction mode) to avoid EMAXCONNSESSION (max 15 session limit)
  const rawUrl =
    process.env.POOLED_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "postgresql://postgres.ncvtgsugunvbrjiautkd:6QDS%3Fc%21eA-cq%2Ba_@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

  const connectionString = rawUrl.replace(
    ".pooler.supabase.com:5432",
    ".pooler.supabase.com:6543"
  );

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 8000,
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
      zoho_booking_id TEXT,
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
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      price INTEGER DEFAULT 1800,
      duration_minutes INTEGER DEFAULT 50,
      meeting_link TEXT,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      google_event_id TEXT,
      whatsapp_status TEXT,
      source TEXT DEFAULT 'internal',
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 1800;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 50;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_status TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE;

    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_payment ON bookings(payment_status);
    CREATE INDEX IF NOT EXISTS idx_bookings_order_id ON bookings(razorpay_order_id);
  `;
  try {
    await pool.query(query);
  } catch (err) {
    console.warn("initSupabaseSchema notice:", err);
  }
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

    // 1. Primary: Save all practice_collections (JSONB document store)
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
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to save practice_collections to Supabase PostgreSQL:", error);
    throw error;
  } finally {
    client.release();
  }

  // 2. Secondary: Sync bookings to the relational SQL table (isolated, non-blocking)
  if (Array.isArray(data.bookings)) {
    for (const b of data.bookings) {
      try {
        const zohoId = b.id.startsWith("ZOHO-")
          ? b.id.replace("ZOHO-", "")
          : null;

        const rawDate = b.appointmentDate || new Date().toISOString().split("T")[0];
        const safeDate = rawDate.includes("T")
          ? rawDate.split("T")[0]
          : rawDate.includes(" ")
          ? rawDate.split(" ")[0]
          : rawDate;

        await pool.query(
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
            safeDate,
            b.appointmentTime || "10:00 AM",
            "Asia/Kolkata",
            b.format || "online",
            b.clientMessage || b.internalNotes || null,
            b.bookingStatus || "pending",
            b.paymentStatus || "pending",
            b.provider || "internal",
            b.createdAt || new Date().toISOString(),
            b.updatedAt || new Date().toISOString(),
          ]
        );
      } catch (rowErr) {
        console.warn(`[Relational Bookings Sync Warning for ${b.id}]:`, rowErr);
      }
    }
  }
}

/**
 * Persists a single collection directly to practice_collections
 */
export async function saveCollectionToSupabase(
  collectionName: string,
  data: any
): Promise<void> {
  const pool = getPgPool();
  await pool.query(
    `
    INSERT INTO practice_collections (collection_name, data, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (collection_name) 
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `,
    [collectionName, JSON.stringify(data)]
  );
}

