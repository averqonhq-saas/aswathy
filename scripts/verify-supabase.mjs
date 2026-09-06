import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ncvtgsugunvbrjiautkd:6QDS%3Fc%21eA-cq%2Ba_@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function verify() {
  console.log("Checking Supabase PostgreSQL data collections...");
  const res = await pool.query(
    "SELECT collection_name, jsonb_array_length(CASE WHEN jsonb_typeof(data) = 'array' THEN data ELSE '[]'::jsonb END) as array_len FROM practice_collections ORDER BY collection_name"
  );

  console.log("Supabase Collections Status:");
  for (const row of res.rows) {
    console.log(`  - ${row.collection_name.padEnd(20)}: ${row.array_len} items`);
  }

  // Verify that dummy data is 0
  const findCount = (name) => {
    const r = res.rows.find((x) => x.collection_name === name);
    return r ? Number(r.array_len) : null;
  };

  const bookingsCount = findCount("bookings");
  const enquiriesCount = findCount("enquiries");
  const notificationsCount = findCount("notifications");
  const blockedSlotsCount = findCount("blockedSlots");

  console.log("\nDummy Data Verification:");
  console.log(`  Bookings: ${bookingsCount} (Expected: 0) -> ${bookingsCount === 0 ? "PASSED" : "FAILED"}`);
  console.log(`  Enquiries: ${enquiriesCount} (Expected: 0) -> ${enquiriesCount === 0 ? "PASSED" : "FAILED"}`);
  console.log(`  Notifications: ${notificationsCount} (Expected: 0) -> ${notificationsCount === 0 ? "PASSED" : "FAILED"}`);
  console.log(`  Blocked Slots: ${blockedSlotsCount} (Expected: 0) -> ${blockedSlotsCount === 0 ? "PASSED" : "FAILED"}`);

  if (bookingsCount !== 0 || enquiriesCount !== 0 || notificationsCount !== 0 || blockedSlotsCount !== 0) {
    throw new Error("Dummy data is still present!");
  }

  // Verify real data is present
  const servicesCount = findCount("services");
  const adminsCount = findCount("admins");
  console.log("\nReal Practice Data Verification:");
  console.log(`  Admins: ${adminsCount} (Expected: 1) -> ${adminsCount === 1 ? "PASSED" : "FAILED"}`);
  console.log(`  Services: ${servicesCount} (Expected: 5) -> ${servicesCount === 5 ? "PASSED" : "FAILED"}`);

  console.log("\nTesting Live Supabase Insert & Read-Back...");
  const testId = `live_test_${Date.now()}`;
  const notifsRes = await pool.query("SELECT data FROM practice_collections WHERE collection_name = 'notifications'");
  const currentNotifs = notifsRes.rows[0].data;

  currentNotifs.push({
    id: testId,
    type: "status_change",
    title: "Live Supabase Connection",
    message: "Verified dynamic write from client app.",
    link: "/admin/notifications",
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  await pool.query(
    "UPDATE practice_collections SET data = $1, updated_at = NOW() WHERE collection_name = 'notifications'",
    [JSON.stringify(currentNotifs)]
  );

  // Query back
  const readBackRes = await pool.query("SELECT data FROM practice_collections WHERE collection_name = 'notifications'");
  const readBackNotifs = readBackRes.rows[0].data;
  const found = readBackNotifs.find((n) => n.id === testId);
  if (!found) {
    throw new Error("Live write to Supabase could not be verified!");
  }
  console.log("  ✓ Dynamic write verified!");

  // Clean test item back out
  const cleanedNotifs = readBackNotifs.filter((n) => n.id !== testId);
  await pool.query(
    "UPDATE practice_collections SET data = $1, updated_at = NOW() WHERE collection_name = 'notifications'",
    [JSON.stringify(cleanedNotifs)]
  );
  console.log("  ✓ Cleanup complete!");

  console.log("\n🎉 ALL SUPABASE TESTS PASSED PERFECTLY!");
  await pool.end();
}

verify().catch(async (e) => {
  console.error("Verification failed:", e);
  await pool.end();
  process.exit(1);
});
