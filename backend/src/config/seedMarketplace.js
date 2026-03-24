require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { ethers } = require('ethers');

const demoProducts = [
  // ─── Images (15) ────────────────────────────────────
  { title: 'Neon City Skyline', desc: 'A stunning 4K photograph of a cyberpunk-themed city skyline at night.', type: 'image', price: 0.05 },
  { title: 'Mountain Landscape 4K', desc: 'High-res mountain landscape panorama with golden hour lighting.', type: 'image', price: 0.08 },
  { title: 'Aurora Borealis Collection', desc: 'Breathtaking northern lights captured in Iceland, 6K resolution.', type: 'image', price: 0.12 },
  { title: 'Minimalist Architecture', desc: 'Clean geometric lines of modern architectural photography.', type: 'image', price: 0.06 },
  { title: 'Tropical Paradise Set', desc: 'Vibrant beach and ocean photography from the Maldives.', type: 'image', price: 0.09 },
  { title: 'Street Art Collection', desc: 'Urban murals and graffiti art from cities worldwide.', type: 'image', price: 0.04 },
  { title: 'Deep Space Nebula', desc: 'Stunning astrophotography of distant nebulae and galaxies.', type: 'image', price: 0.15 },
  { title: 'Vintage Film Textures', desc: 'Authentic film grain and light leak overlays for editors.', type: 'image', price: 0.03 },
  { title: 'Botanical Illustrations', desc: 'Hand-drawn botanical art digitized at ultra-high resolution.', type: 'image', price: 0.07 },
  { title: 'Cyberpunk Character Art', desc: 'Digital character illustrations in cyberpunk aesthetic.', type: 'image', price: 0.10 },
  { title: 'Ocean Waves Panorama', desc: 'Dramatic ocean waves captured during a storm, ultra-wide format.', type: 'image', price: 0.06 },
  { title: 'Golden Hour Portraits', desc: 'Professional portrait photography during magic hour.', type: 'image', price: 0.08 },
  { title: 'Abstract Fluid Art', desc: 'Mesmerizing fluid dynamics captured in high-speed photography.', type: 'image', price: 0.05 },
  { title: 'Snow Mountain Peak', desc: 'Pristine snow-capped mountain peaks shot from drone altitude.', type: 'image', price: 0.11 },
  { title: 'Retro Pixel Art Pack', desc: '16-bit style pixel art sprites and backgrounds for game devs.', type: 'image', price: 0.04 },

  // ─── Audio (12) ────────────────────────────────────
  { title: 'Ambient Chill Pack Vol.3', desc: 'A curated collection of ambient lo-fi tracks perfect for content creators.', type: 'audio', price: 0.15 },
  { title: 'Synthwave Retrograde', desc: 'Retro synthwave music pack with 80s vibes and neon energy.', type: 'audio', price: 0.12 },
  { title: 'Cinematic Orchestral Suite', desc: 'Epic orchestral compositions for films and trailers.', type: 'audio', price: 0.25 },
  { title: 'Lo-Fi Hip Hop Beats', desc: 'Chill lo-fi hip hop instrumentals for study and relaxation.', type: 'audio', price: 0.10 },
  { title: 'Nature Soundscapes', desc: 'Immersive field recordings of forests, rain, and ocean waves.', type: 'audio', price: 0.08 },
  { title: 'Electronic Dance Pack', desc: 'High-energy EDM tracks for events and content.', type: 'audio', price: 0.18 },
  { title: 'Acoustic Guitar Sessions', desc: 'Warm acoustic guitar melodies for podcasts and videos.', type: 'audio', price: 0.09 },
  { title: 'Dark Ambient Textures', desc: 'Eerie atmospheric soundscapes for horror and thriller projects.', type: 'audio', price: 0.14 },
  { title: 'Jazz Lounge Collection', desc: 'Smooth jazz recordings for restaurants and cocktail bars.', type: 'audio', price: 0.11 },
  { title: 'Foley Sound Effects', desc: 'Professional foley sounds: footsteps, doors, impacts, and more.', type: 'audio', price: 0.07 },
  { title: 'Piano Meditation Vol.2', desc: 'Gentle piano compositions for meditation and wellness apps.', type: 'audio', price: 0.06 },
  { title: 'Drum & Bass Essentials', desc: 'High-tempo drum and bass tracks for gaming content.', type: 'audio', price: 0.13 },

  // ─── Videos (11) ────────────────────────────────────
  { title: 'Abstract Motion Loop', desc: 'Seamless motion graphics loop for video editors and VJs.', type: 'video', price: 0.25 },
  { title: 'Drone City Flyover', desc: 'Cinematic 4K drone footage flying over a modern cityscape.', type: 'video', price: 0.30 },
  { title: 'Particle Effects Pack', desc: 'Stunning particle animations with alpha channel for compositing.', type: 'video', price: 0.20 },
  { title: 'Time-Lapse Starfield', desc: 'Mesmerizing night sky time-lapse with Milky Way rotation.', type: 'video', price: 0.22 },
  { title: 'Underwater Reef 4K', desc: 'Vibrant coral reef footage with tropical fish in crystal water.', type: 'video', price: 0.28 },
  { title: 'Smoke & Fog Overlays', desc: 'Atmospheric smoke and fog effects on black background.', type: 'video', price: 0.15 },
  { title: 'Neon Light Transitions', desc: 'Stylish neon-themed video transitions for editors.', type: 'video', price: 0.12 },
  { title: 'Aerial Forest Canopy', desc: 'Breathtaking top-down drone footage of lush forest canopy.', type: 'video', price: 0.18 },
  { title: 'Liquid Metal Morph', desc: 'Surreal liquid metal morphing animations in 4K.', type: 'video', price: 0.35 },
  { title: 'Sunset Beach Waves', desc: 'Calming ocean waves at sunset, perfect for backgrounds.', type: 'video', price: 0.16 },
  { title: 'Holographic UI Elements', desc: 'Futuristic holographic interface animations for sci-fi projects.', type: 'video', price: 0.20 },
];

const creatorProfiles = [
  { name: 'Alex Chen', email: 'alex@creatorchain.io' },
  { name: 'Luna Beats', email: 'luna@creatorchain.io' },
  { name: 'Motion Lab', email: 'motion@creatorchain.io' },
  { name: 'Sarah Kim', email: 'sarah@creatorchain.io' },
  { name: 'Nova Sound', email: 'nova@creatorchain.io' },
];

async function seedMarketplace() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/creatorchain';
  const isRemote = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');
  
  const pool = new Pool({
    connectionString: dbUrl,
    ...(isRemote && { ssl: { rejectUnauthorized: false } }),
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Create demo creators
    const creatorIds = [];
    for (const creator of creatorProfiles) {
      const id = uuidv4();
      const wallet = ethers.Wallet.createRandom();
      try {
        await client.query(
          `INSERT INTO users (id, email, name, wallet_address, role)
           VALUES ($1, $2, $3, $4, 'creator')
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [id, creator.email, creator.name, wallet.address]
        );
        const res = await client.query('SELECT id FROM users WHERE email = $1', [creator.email]);
        creatorIds.push(res.rows[0].id);
        console.log(`   👤 Creator: ${creator.name}`);
      } catch (err) {
        const res = await client.query('SELECT id FROM users WHERE email = $1', [creator.email]);
        if (res.rows.length > 0) creatorIds.push(res.rows[0].id);
      }
    }

    // Insert products
    let inserted = 0;
    for (const product of demoProducts) {
      const contentId = uuidv4();
      const creatorId = creatorIds[Math.floor(Math.random() * creatorIds.length)];
      const fingerprint = crypto.createHash('sha256').update(`seed-${product.title}-${product.type}`).digest('hex');
      const licenseSales = Math.floor(Math.random() * 15);

      // Check if product with same title already exists
      const existing = await client.query('SELECT id FROM content WHERE title = $1', [product.title]);
      if (existing.rows.length > 0) {
        console.log(`   ⏭  Skipping "${product.title}" (already exists)`);
        continue;
      }

      await client.query(
        `INSERT INTO content (id, creator_id, title, description, category, content_type, price,
          fingerprint_hash, status, registered_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $5, $6, $7, 'REGISTERED', NOW(), NOW() - interval '1 day' * $8)`,
        [contentId, creatorId, product.title, product.desc, product.type, product.price, fingerprint, Math.floor(Math.random() * 30)]
      );

      // Add some random license sales
      if (licenseSales > 0) {
        const buyerId = creatorIds[(creatorIds.indexOf(creatorId) + 1) % creatorIds.length];
        for (let i = 0; i < Math.min(licenseSales, 3); i++) {
          try {
            await client.query(
              `INSERT INTO licenses (id, content_id, licensee_id, price_paid, granted_at)
               VALUES ($1, $2, $3, $4, NOW() - interval '1 hour' * $5)
               ON CONFLICT DO NOTHING`,
              [uuidv4(), contentId, buyerId, product.price, Math.floor(Math.random() * 72)]
            );
          } catch {}
        }
      }

      inserted++;
      console.log(`   ✅ ${product.type.toUpperCase().padEnd(6)} "${product.title}" — ${product.price} MATIC`);
    }

    client.release();
    console.log(`\n🎉 Seeded ${inserted} products with ${creatorIds.length} creators!`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seedMarketplace();
