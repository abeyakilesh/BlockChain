# CreatorChain

> **Blockchain as Legal Notary, Not a Database.**

A production-grade hybrid platform for digital content ownership, licensing, and royalty distribution — combining **Web2** speed, **AI** content verification, and **Blockchain** immutable truth.

![Architecture](https://img.shields.io/badge/Architecture-Hybrid_Web2%2FWeb3%2FAI-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Polygon-8247e5)
![License](https://img.shields.io/badge/License-MIT-green)

---

##  Problems Solved

| Problem | Solution |
|---------|----------|
| No verifiable content ownership | Blockchain-notarized ownership with immutable records |
| Widespread copyright violations | AI fingerprinting detects duplicates before registration |
| Manual, unreliable royalty tracking | Merkle tree batched automatic royalty distribution |
| Centralized platform control | Smart contracts enforce royalties — no intermediary |

---

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Next.js 14  │───▶│  Express API │───▶│  PostgreSQL  │
│  :3000       │    │  :4000       │    │  (Metadata)  │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                    ┌──────┴───────┐
                    │ Redis+BullMQ │
                    │ (Async Queue)│
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌────────────┐ ┌────────┐ ┌──────────┐
       │ Python AI  │ │  IPFS  │ │ Polygon  │
       │ :5000      │ │ Pinata │ │ Register │
       └────────────┘ └────────┘ └──────────┘
```

### Services

| Service | Tech | Purpose |
|---------|------|---------|
| **Frontend** | Next.js 14, Tailwind CSS | Premium dark theme UI with glassmorphism |
| **Backend** | Express, BullMQ, PostgreSQL | REST API + async processing pipeline |
| **AI Service** | Python Flask, imagehash, librosa | Content fingerprinting & similarity detection |
| **Contracts** | Solidity, Hardhat, OpenZeppelin | Ownership registration & royalty distribution |

---

##  Monorepo Structure

```
BlockChain/
├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── contracts/      # CreatorRights.sol, RoyaltyDistributor.sol
│   ├── scripts/        # Deployment scripts
│   └── test/           # Unit tests
├── backend/            # Express API + BullMQ worker
│   └── src/
│       ├── config/     # DB, Redis, schema, init script
│       ├── middleware/  # JWT auth, role-based access
│       ├── routes/     # Auth, Content, License, Royalty, Detect
│       ├── services/   # Blockchain, IPFS, Merkle, Certificate
│       └── workers/    # Async content processing pipeline
├── ai-service/         # Python fingerprinting microservice
│   ├── app.py          # Flask REST API
│   ├── fingerprint.py  # pHash, MFCC, keyframe hashing
│   ├── vector_store.py # In-memory similarity search
│   └── watermark.py    # LSB steganography
├── frontend/           # Next.js 14 + Tailwind CSS
│   └── src/
│       ├── app/        # Pages (landing, auth, dashboard, marketplace, etc.)
│       ├── components/ # Shared components (Navbar)
│       └── lib/        # API client
├── docker-compose.yml  # Full stack orchestration
├── .env.example        # Environment template
└── README.md
```

---

##  Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+
- Docker & Docker Compose (for PostgreSQL & Redis)

### 1. Clone & Install

```bash
git clone https://github.com/abeyakilesh/BlockChain.git
cd BlockChain

# Install all dependencies
npm install                         # Root workspaces
cd contracts && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis via Docker
docker-compose up postgres redis -d

# Initialize database schema + seed demo data
cd backend && npm run db:init -- --seed
```

### 4. Compile Smart Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat test        # Run unit tests
```

### 5. Start Services

```bash
# Terminal 1: Backend API
cd backend && npm run dev

# Terminal 2: Background Worker
cd backend && npm run worker

# Terminal 3: AI Service
cd ai-service && pip install -r requirements.txt && python app.py

# Terminal 4: Frontend
cd frontend && npm run dev
```

### 6. Open App

Navigate to **http://localhost:3000**

---

## Content Pipeline

```
Upload → AI Fingerprint → Duplicate Check → IPFS Storage → Blockchain Registration → PDF Certificate
```

1. **Creator uploads** content via dashboard
2. **BullMQ job** queues the async pipeline
3. **AI Service** generates perceptual fingerprint (pHash/MFCC/keyframe)
4. **Similarity check** against existing fingerprints
5. **IPFS upload** (Pinata or simulated)
6. **Blockchain registration** on Polygon (or simulated)
7. **PDF certificate** generated with all proof data
8. **Status updates** via polling from frontend

---

## AI Fingerprinting

| Content Type | Algorithm | Library |
|-------------|-----------|---------|
| **Image** | Perceptual Hash (pHash) | `imagehash` + `Pillow` |
| **Audio** | MFCC Feature Extraction | `librosa` + `numpy` |
| **Video** | Keyframe Extraction + Hash | `Pillow` + `imagehash` |

Plus **invisible watermarking** via LSB steganography for off-platform tracking.

---

##  Smart Contracts

### CreatorRights.sol
- `registerRights()` — Records ownership with fingerprint hash and royalty config
- `licenseTo()` — Issues license with automatic royalty payment to creator
- Events: `RightsRegistered`, `LicenseGranted`, `RoyaltyPaid`

### RoyaltyDistributor.sol
- `updateMerkleRoot()` — Admin batches earnings into Merkle tree
- `claim()` — Creator withdraws with cryptographic proof
- Gas-efficient: one tx for batch, individual claims with proofs

---

##  User Roles

| Role | Capabilities |
|------|-------------|
| **Creator** | Upload content, set pricing, view earnings, claim royalties |
| **Buyer** | Browse marketplace, purchase licenses, download content |
| **Admin** | Read-only monitoring dashboard (no control over funds) |

---

##  Production Swap Guide

| Development Stub | Production Replacement |
|-----------------|----------------------|
| Simulated auth | [Privy](https://privy.io) or [Magic](https://magic.link) SDK |
| Local file storage | [Pinata](https://pinata.cloud) IPFS (set `PINATA_API_KEY`) |
| Simulated blockchain | Deploy to Polygon Amoy (set contract addresses in `.env`) |
| In-memory vector store | [Pinecone](https://pinecone.io) or [Milvus](https://milvus.io) |
| Account abstraction stubs | [Biconomy](https://biconomy.io) or [Pimlico](https://pimlico.io) |

---

##  Testing

```bash
# Smart contract tests
cd contracts && npx hardhat test

# Backend tests (requires DB)
cd backend && npm test

# AI service tests
cd ai-service && python -m pytest tests/
```

---

##  Docker (Full Stack)

```bash
docker-compose up --build
```

Services: PostgreSQL (:5432), Redis (:6379), AI (:5000), Backend (:4000), Frontend (:3000)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with  by <strong>CreatorChain</strong> — Blockchain as Legal Notary
</p>
