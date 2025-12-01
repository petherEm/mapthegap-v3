#!/usr/bin/env node

/**
 * Script to import Ria Poland data from JSON file
 *
 * Usage:
 *   node scripts/import-ria-data.mjs [--replace]
 *
 * Options:
 *   --replace: Replace existing Ria locations instead of appending
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importData() {
  // Check if --replace flag is set
  const replace = process.argv.includes('--replace');

  // Read the JSON file
  const jsonPath = path.join(__dirname, '../lib/supabase/ria_poland_ready.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Error: ria_poland_ready.json not found at:', jsonPath);
    process.exit(1);
  }

  console.log('📖 Reading JSON file...');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const locations = JSON.parse(rawData);

  console.log(`✅ Loaded ${locations.length} locations`);

  // Make API request
  console.log('\n🚀 Importing to database...');
  console.log(`   Mode: ${replace ? 'REPLACE existing Ria locations' : 'APPEND to existing locations'}`);

  const response = await fetch('http://localhost:3000/api/seed/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locations,
      network: 'ria',
      replace,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('\n❌ Import failed:');
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log('\n✅ Import completed!');
  console.log(`   Network: ${result.network}`);
  console.log(`   Total: ${result.total}`);
  console.log(`   Inserted: ${result.inserted}`);
  console.log(`   Failed: ${result.failed}`);

  if (result.summary) {
    console.log('\n📊 Summary by country:');
    Object.entries(result.summary).forEach(([country, count]) => {
      console.log(`   ${country}: ${count}`);
    });
  }

  if (result.errors && result.errors.length > 0) {
    console.warn('\n⚠️  Some batches had errors:');
    result.errors.forEach(err => {
      console.warn(`   Batch ${err.batch}: ${err.error}`);
    });
  }
}

// Run the import
importData().catch(error => {
  console.error('\n❌ Unexpected error:');
  console.error(error);
  process.exit(1);
});
