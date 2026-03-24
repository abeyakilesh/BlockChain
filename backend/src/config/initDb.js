require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/creatorchain';

  console.log('🔌 Connecting to database...');
  console.log(`   URL: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

  const pool = new Pool({ connectionString });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');

    // Read schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📋 Executing schema...');
    await client.query(schema);
    console.log('✅ Schema applied successfully');

    // Verify tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    tables.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    // Seed demo data (optional)
    const seedDemo = process.argv.includes('--seed');
    if (seedDemo) {
      console.log('\n🌱 Seeding demo data...');

      // Create demo creator
      await client.query(`
        INSERT INTO users (id, email, name, role, wallet_address, created_at)
        VALUES 
          ('demo-creator-1', 'alex@creatorchain.io', 'Alex Chen', 'creator', '0x1234567890abcdef1234567890abcdef12345678', NOW()),
          ('demo-creator-2', 'luna@creatorchain.io', 'Luna Beats', 'creator', '0xabcdef1234567890abcdef1234567890abcdef12', NOW()),
          ('demo-buyer-1', 'buyer@creatorchain.io', 'Demo Buyer', 'buyer', '0x9876543210fedcba9876543210fedcba98765432', NOW())
        ON CONFLICT (id) DO NOTHING;
      `);

      // Create demo content
      await client.query(`
        INSERT INTO content (id, creator_id, title, description, category, price, status, fingerprint_hash, ipfs_cid, tx_hash, block_number, created_at)
        VALUES 
          ('content-1', 'demo-creator-1', 'Neon City Skyline', 'A stunning 4K photograph of a cyberpunk-themed city skyline at night.', 'image', 0.05, 'REGISTERED', 'e3b0c44298fc1c149afbf4c8996fb924', 'QmSimAbC123xYz789mNoPqRsTuVwXyZ', '0xa1b2c3d4e5f67890', 52847391, NOW()),
          ('content-2', 'demo-creator-2', 'Ambient Chill Pack Vol.3', 'A curated collection of ambient lo-fi tracks.', 'audio', 0.15, 'REGISTERED', 'a1b2c3d4e5f6789012345678901234ab', 'QmSim5678AbCdEfGhIjKlMnOpQrStUv', '0xb2c3d4e5f6789012', 52847500, NOW()),
          ('content-3', 'demo-creator-1', 'Abstract Motion Loop', 'Seamless motion graphics loop for video editors.', 'video', 0.25, 'REGISTERED', 'f1e2d3c4b5a69870123456789abcdef0', 'QmSim9012WxYzAbCdEfGhIjKlMnOpQr', '0xc3d4e5f678901234', 52847600, NOW()),
          ('content-4', 'demo-creator-2', 'Mountain Landscape 4K', 'High-res mountain landscape panorama.', 'image', 0.08, 'REGISTERED', 'b2c3d4e5f678901234567890abcdef12', 'QmSimFgHiJkLmNoPqRsTuVwXyZaBcDeF', '0xd4e5f67890123456', 52847700, NOW()),
          ('content-5', 'demo-creator-1', 'Synthwave Retrograde', 'Retro synthwave music pack.', 'audio', 0.12, 'PROCESSING', NULL, NULL, NULL, NULL, NOW())
        ON CONFLICT (id) DO NOTHING;
      `);

      // Create demo licenses
      await client.query(`
        INSERT INTO licenses (id, content_id, licensee_id, price_paid, tx_hash, created_at)
        VALUES 
          ('license-1', 'content-1', 'demo-buyer-1', 0.05, '0xlic1234567890', NOW()),
          ('license-2', 'content-2', 'demo-buyer-1', 0.15, '0xlic2345678901', NOW())
        ON CONFLICT (id) DO NOTHING;
      `);

      // Create demo earnings
      await client.query(`
        INSERT INTO earnings (id, creator_id, content_id, amount, source, created_at)
        VALUES 
          ('earn-1', 'demo-creator-1', 'content-1', 0.045, 'license', NOW()),
          ('earn-2', 'demo-creator-2', 'content-2', 0.135, 'license', NOW())
        ON CONFLICT (id) DO NOTHING;
      `);

      console.log('✅ Demo data seeded (3 users, 5 content, 2 licenses, 2 earnings)');
    }

    client.release();
    console.log('\n🎉 Database initialization complete!');

  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
