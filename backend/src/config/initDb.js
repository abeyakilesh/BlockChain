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

    // Reset database
    console.log('🗑 Resetting database...');
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

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

      // Valid UUIDs for testing
      const c1 = '11111111-1111-1111-1111-111111111111';
      const c2 = '22222222-2222-2222-2222-222222222222';
      const b1 = '33333333-3333-3333-3333-333333333333';
      
      const cont1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const cont2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      const cont3 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
      const cont4 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
      const cont5 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

      // Create demo creator
      await client.query(`
        INSERT INTO users (id, email, name, role, wallet_address, created_at)
        VALUES 
          ($1, 'alex@creatorchain.io', 'Alex Chen', 'creator', '0x1234567890abcdef1234567890abcdef12345678', NOW()),
          ($2, 'luna@creatorchain.io', 'Luna Beats', 'creator', '0xabcdef1234567890abcdef1234567890abcdef12', NOW()),
          ($3, 'buyer@creatorchain.io', 'Demo Buyer', 'buyer', '0x9876543210fedcba9876543210fedcba98765432', NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [c1, c2, b1]);

      // Create demo content
      await client.query(`
        INSERT INTO content (id, creator_id, title, description, category, price, status, fingerprint_hash, ipfs_cid, tx_hash, block_number, created_at)
        VALUES 
          ($1, $2, 'Neon City Skyline', 'A stunning 4K photograph of a cyberpunk-themed city skyline at night.', 'image', 0.05, 'REGISTERED', 'e3b0c44298fc1c149afbf4c8996fb924', 'QmSimAbC123xYz789mNoPqRsTuVwXyZ', '0xa1b2c3d4e5f67890', 52847391, NOW()),
          ($3, $4, 'Ambient Chill Pack Vol.3', 'A curated collection of ambient lo-fi tracks.', 'audio', 0.15, 'REGISTERED', 'a1b2c3d4e5f6789012345678901234ab', 'QmSim5678AbCdEfGhIjKlMnOpQrStUv', '0xb2c3d4e5f6789012', 52847500, NOW()),
          ($5, $2, 'Abstract Motion Loop', 'Seamless motion graphics loop for video editors.', 'video', 0.25, 'REGISTERED', 'f1e2d3c4b5a69870123456789abcdef0', 'QmSim9012WxYzAbCdEfGhIjKlMnOpQr', '0xc3d4e5f678901234', 52847600, NOW()),
          ($6, $4, 'Mountain Landscape 4K', 'High-res mountain landscape panorama.', 'image', 0.08, 'REGISTERED', 'b2c3d4e5f678901234567890abcdef12', 'QmSimFgHiJkLmNoPqRsTuVwXyZaBcDeF', '0xd4e5f67890123456', 52847700, NOW()),
          ($7, $2, 'Synthwave Retrograde', 'Retro synthwave music pack.', 'audio', 0.12, 'PROCESSING', NULL, NULL, NULL, NULL, NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [cont1, c1, cont2, c2, cont3, cont4, cont5]);

      // Create demo licenses
      await client.query(`
        INSERT INTO licenses (id, content_id, licensee_id, price_paid, tx_hash, granted_at)
        VALUES 
          ('ffffffff-1111-1111-1111-111111111111', $1, $3, 0.05, '0xlic1234567890', NOW()),
          ('ffffffff-2222-2222-2222-222222222222', $2, $3, 0.15, '0xlic2345678901', NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [cont1, cont2, b1]);

      // Create demo earnings
      await client.query(`
        INSERT INTO earnings (id, creator_id, content_id, amount, source, created_at)
        VALUES 
          ('99999999-1111-1111-1111-111111111111', $1, $3, 0.045, 'license', NOW()),
          ('99999999-2222-2222-2222-222222222222', $2, $4, 0.135, 'license', NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [c1, c2, cont1, cont2]);

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
