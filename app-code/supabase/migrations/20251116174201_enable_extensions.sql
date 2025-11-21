-- Migration: Enable Required Extensions
-- Date: 2024-11-16
-- Description: Enable pgvector for vector embeddings and uuid-ossp for UUID generation

-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for fuzzy text search (useful for autocomplete)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify extensions are enabled
SELECT 
  extname as "Extension Name",
  extversion as "Version"
FROM pg_extension 
WHERE extname IN ('vector', 'uuid-ossp', 'pgcrypto', 'pg_trgm')
ORDER BY extname;
