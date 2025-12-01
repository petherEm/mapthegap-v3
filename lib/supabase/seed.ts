import { createClient } from "./client";
import { MOCK_LOCATIONS } from "../data/mockData";

/**
 * Seed the database with mock location data
 *
 * Usage:
 * 1. Make sure you've run the schema.sql file in Supabase SQL Editor
 * 2. Run this script from the browser console or create a one-time API route
 *
 * For API route approach, create: app/api/seed/route.ts
 * Then visit: http://localhost:3000/api/seed
 */
export async function seedLocations() {
  const supabase = createClient();

  console.log("🌱 Starting database seed...");
  console.log(`📦 Inserting ${MOCK_LOCATIONS.length} locations...`);

  try {
    // Insert all locations
    const { data, error } = await supabase
      .from("locations")
      .insert(MOCK_LOCATIONS)
      .select();

    if (error) {
      console.error("❌ Error seeding database:", error);
      return { success: false, error };
    }

    console.log("✅ Database seeded successfully!");
    console.log(`📊 Inserted ${data?.length || 0} locations`);

    // Log summary by country
    const summary = MOCK_LOCATIONS.reduce(
      (acc, location) => {
        acc[location.country] = (acc[location.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log("\n📈 Summary by country:");
    Object.entries(summary).forEach(([country, count]) => {
      console.log(`  ${country}: ${count} locations`);
    });

    return { success: true, data };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { success: false, error: err };
  }
}

/**
 * Clear all locations from the database
 * Use with caution!
 */
export async function clearLocations() {
  const supabase = createClient();

  console.log("🗑️  Clearing all locations...");

  try {
    const { error } = await supabase.from("locations").delete().neq("id", "");

    if (error) {
      console.error("❌ Error clearing database:", error);
      return { success: false, error };
    }

    console.log("✅ All locations cleared!");
    return { success: true };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { success: false, error: err };
  }
}

/**
 * Reset database: clear and re-seed
 */
export async function resetDatabase() {
  console.log("🔄 Resetting database...");

  const clearResult = await clearLocations();
  if (!clearResult.success) {
    return clearResult;
  }

  const seedResult = await seedLocations();
  return seedResult;
}
