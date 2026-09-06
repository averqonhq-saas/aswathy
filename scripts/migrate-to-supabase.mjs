import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ncvtgsugunvbrjiautkd:6QDS%3Fc%21eA-cq%2Ba_@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

console.log("Connecting to Supabase PostgreSQL at:", "aws-0-ap-south-1.pooler.supabase.com:5432");

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  try {
    // 1. Initialize schema
    console.log("Creating practice_collections table in Supabase if not exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS practice_collections (
        collection_name VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_practice_collections_updated_at 
      ON practice_collections(updated_at);
    `);

    // 2. Read local data file
    const dbFilePath = path.join(process.cwd(), "data", "database.json");
    console.log("Reading data from:", dbFilePath);
    const content = await fs.readFile(dbFilePath, "utf8");
    const rawData = JSON.parse(content);

    // 3. Clean dummy data
    console.log("Purging dummy data (bookings, enquiries, notifications, blocked slots)...");
    
    // Clear dummy bookings
    console.log(`- Removing ${rawData.bookings?.length || 0} dummy bookings`);
    rawData.bookings = [];

    // Clear dummy enquiries
    console.log(`- Removing ${rawData.enquiries?.length || 0} dummy enquiries`);
    rawData.enquiries = [];

    // Clear dummy notifications
    console.log(`- Removing ${rawData.notifications?.length || 0} dummy notifications`);
    rawData.notifications = [];

    // Clear dummy blocked slots
    console.log(`- Removing ${rawData.blockedSlots?.length || 0} dummy blocked slots`);
    rawData.blockedSlots = [];

    // Filter feedback to only approved public testimonials
    const initialFeedbackCount = rawData.feedback?.length || 0;
    rawData.feedback = (rawData.feedback || []).filter((fb) => fb.status === "approved" && fb.publicVisibility === true);
    console.log(`- Preserved ${rawData.feedback.length} of ${initialFeedbackCount} testimonials`);

    console.log("\nSummary of real data to persist in Supabase:");
    console.log(`- Admins: ${rawData.admins?.length || 0} (${rawData.admins?.[0]?.name})`);
    console.log(`- Service Categories: ${rawData.serviceCategories?.length || 0}`);
    console.log(`- Clinical Services: ${rawData.services?.length || 0}`);
    console.log(`- Bookings: ${rawData.bookings.length} (CLEAN)`);
    console.log(`- Enquiries: ${rawData.enquiries.length} (CLEAN)`);
    console.log(`- Notifications: ${rawData.notifications.length} (CLEAN)`);
    console.log(`- Practice Settings: ${rawData.settings?.general?.websiteName || "Configured"}`);

    // 4. Save to Supabase
    console.log("\nUploading collections to Supabase PostgreSQL...");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const [collectionName, collectionData] of Object.entries(rawData)) {
        await client.query(
          `
          INSERT INTO practice_collections (collection_name, data, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (collection_name) 
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `,
          [collectionName, JSON.stringify(collectionData)]
        );
        console.log(`  ✓ Synced collection: ${collectionName}`);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    // 5. Update local database.json with cleaned data
    await fs.writeFile(dbFilePath, JSON.stringify(rawData, null, 2), "utf8");
    console.log("\nUpdated local data/database.json with clean real data backup.");

    // 6. Verify by querying Supabase
    console.log("\nVerifying Supabase collections...");
    const verifyRes = await pool.query(
      "SELECT collection_name, jsonb_typeof(data) as type, updated_at FROM practice_collections ORDER BY collection_name"
    );
    console.log("Collections verified in Supabase:");
    verifyRes.rows.forEach((r) => {
      console.log(`  - ${r.collection_name} (${r.type}) updated at ${r.updated_at.toISOString()}`);
    });

    console.log("\n🎉 MIGRATION TO SUPABASE COMPLETED SUCCESSFULLY!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
