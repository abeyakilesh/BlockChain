-- CreatorChain Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE,
    name            VARCHAR(255),
    wallet_address  VARCHAR(42) UNIQUE,
    role            VARCHAR(20) DEFAULT 'creator' CHECK (role IN ('creator', 'buyer', 'admin')),
    avatar_url      TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Content ─────────────────────────────────────────────────

CREATE TYPE content_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'FINGERPRINTING',
    'UPLOADING_IPFS',
    'REGISTERING_BLOCKCHAIN',
    'REGISTERED',
    'REJECTED',
    'FAILED'
);

CREATE TABLE content (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    category            VARCHAR(100),
    content_type        VARCHAR(50), -- image, audio, video
    price               DECIMAL(18, 8) DEFAULT 0,
    currency            VARCHAR(10) DEFAULT 'MATIC',
    
    -- File references
    original_filename   VARCHAR(500),
    file_size           BIGINT,
    mime_type           VARCHAR(100),
    preview_url         TEXT,
    
    -- IPFS
    ipfs_cid            VARCHAR(100),
    ipfs_url            TEXT,
    
    -- Fingerprint
    fingerprint_hash    VARCHAR(66),
    similarity_score    DECIMAL(5, 4),
    
    -- Blockchain
    content_hash        VARCHAR(66), -- bytes32 contentId on-chain
    tx_hash             VARCHAR(66),
    block_number        BIGINT,
    
    -- Certificate
    certificate_cid     VARCHAR(100),
    certificate_url     TEXT,
    
    -- Status
    status              content_status DEFAULT 'PENDING',
    rejection_reason    TEXT,
    
    -- Timestamps
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    registered_at       TIMESTAMP
);

CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_fingerprint ON content(fingerprint_hash);

-- ─── Licenses ────────────────────────────────────────────────

CREATE TABLE licenses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id      UUID REFERENCES content(id) ON DELETE CASCADE,
    licensee_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    price_paid      DECIMAL(18, 8),
    currency        VARCHAR(10) DEFAULT 'MATIC',
    tx_hash         VARCHAR(66),
    granted_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP, -- NULL = perpetual
    UNIQUE(content_id, licensee_id)
);

CREATE INDEX idx_licenses_licensee ON licenses(licensee_id);
CREATE INDEX idx_licenses_content ON licenses(content_id);

-- ─── Royalty Claims ──────────────────────────────────────────

CREATE TABLE royalty_claims (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    amount          DECIMAL(18, 8),
    epoch           INTEGER,
    merkle_root     VARCHAR(66),
    merkle_proof    JSONB,
    tx_hash         VARCHAR(66),
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'failed')),
    created_at      TIMESTAMP DEFAULT NOW(),
    claimed_at      TIMESTAMP
);

-- ─── Earnings Ledger ─────────────────────────────────────────

CREATE TABLE earnings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id      UUID REFERENCES content(id) ON DELETE SET NULL,
    amount          DECIMAL(18, 8),
    source          VARCHAR(50) DEFAULT 'license', -- license, royalty
    tx_hash         VARCHAR(66),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_earnings_creator ON earnings(creator_id);

-- ─── Jobs (async tracking) ──────────────────────────────────

CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id      UUID REFERENCES content(id) ON DELETE CASCADE,
    bull_job_id     VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'queued',
    progress        INTEGER DEFAULT 0,
    error           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_content ON jobs(content_id);
CREATE INDEX idx_jobs_bull ON jobs(bull_job_id);
