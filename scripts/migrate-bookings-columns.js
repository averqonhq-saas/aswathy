const { Pool } = require('pg');
const path = require('path');

// Load .env.local manually
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env.local');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const pool = new Pool({
  connectionString: process.env.POOLED_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Connected to Supabase. Running column migrations...\n');

    const columns = [
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 50',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 1800',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_signature TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_status TEXT',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE',
      'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE',
    ];

    for (const sql of columns) {
      await client.query(sql);
      const colName = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
      console.log('  OK:', colName);
    }

    console.log('\nVerifying final column list:');
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' ORDER BY ordinal_position"
    );
    console.log(' ', res.rows.map((r) => r.column_name).join(', '));
    console.log('\nMigration complete!');
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
