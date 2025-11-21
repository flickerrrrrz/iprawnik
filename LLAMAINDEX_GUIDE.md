# LlamaIndex Integration Guide - Prawnik AI

**Framework:** LlamaIndex (llamaindex.ts)  
**Version:** ^0.7.0  
**Purpose:** RAG orchestration for legal document search & Q&A

---

## 📋 Why LlamaIndex?

### ✅ Advantages

1. **Native Supabase Integration**
   - `PGVectorStore` - Direct pgvector connection
   - No manual SQL queries for vector operations
   - Automatic tenant filtering via query filters

2. **Production-Ready Components**
   - `SimpleDirectoryReader` - PDF ingestion
   - `SentenceSplitter` - Smart chunking strategies
   - `VectorStoreIndex` - Semantic search
   - `RetrieverQueryEngine` - Q&A with context
   - `CondensePlusContextChatEngine` - Conversational RAG

3. **Developer Experience**
   - TypeScript support (llamaindex.ts)
   - Excellent documentation
   - Active community
   - Regular updates

4. **Flexibility**
   - Custom retrievers
   - Post-processors (re-ranking)
   - Response synthesizers
   - Multi-modal support

### ❌ vs Custom Implementation

| Feature | Custom | LlamaIndex |
|---------|--------|------------|
| Development Time | Weeks | Days |
| Maintenance | High | Low |
| Bug Fixes | Manual | Community |
| Optimizations | Manual | Built-in |
| Chunking Strategies | Custom code | Pre-built |
| Retrieval Methods | Manual | Multiple engines |
| Updates | Manual | npm update |

---

## 🏗️ Architecture Overview

```
PDF Upload
    ↓
SimpleDirectoryReader (LlamaIndex)
    ↓
SentenceSplitter (chunking)
    ↓
OpenAI Embeddings (text-embedding-3-large)
    ↓
PGVectorStore (Supabase pgvector)
    ↓
VectorStoreIndex
    ↓
Query/Chat Engines
    ↓
Vercel AI SDK (streaming)
    ↓
User Interface
```

---

## 📦 Installation

```bash
# LlamaIndex core
pnpm add llamaindex

# Already included in project:
# - openai (for embeddings & LLMs)
# - @supabase/supabase-js (for database)
# - ai (Vercel AI SDK for streaming)
```

---

## 🔧 Core Components

### 1. Configuration (`lib/llamaindex/config.ts`)

```typescript
import { OpenAI, Settings } from 'llamaindex'

// Global LlamaIndex settings
Settings.llm = new OpenAI({
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.1,
})

Settings.embedModel = new OpenAI({
  model: 'text-embedding-3-large',
  dimensions: 1536,
  apiKey: process.env.OPENAI_API_KEY,
})

// Optional: Custom chunk size
Settings.chunkSize = 512
Settings.chunkOverlap = 50
```

---

### 2. Vector Store (`lib/llamaindex/store.ts`)

```typescript
import { PGVectorStore } from 'llamaindex/storage/vectorStore/PGVectorStore'

export async function getPGVectorStore(tenantId: string) {
  return new PGVectorStore({
    // Connection
    connectionString: process.env.DATABASE_URL,
    
    // Schema & Table (from our migrations)
    schemaName: 'public',
    tableName: 'document_chunks',
    
    // Vector config (matches our pgvector setup)
    dimensions: 1536,
    
    // CRITICAL: Tenant isolation
    queryFilter: { 
      tenant_id: tenantId 
    },
    
    // Column mapping (defaults match our schema)
    // idColumn: 'id',
    // vectorColumn: 'embedding',
    // textColumn: 'content',
  })
}
```

**Key Notes:**
- `queryFilter` ensures multi-tenancy (RLS at app level)
- Works with existing `document_chunks` table
- No schema changes needed
- HNSW index used automatically

---

### 3. Document Ingestion (`lib/llamaindex/ingest.ts`)

```typescript
import { SimpleDirectoryReader, VectorStoreIndex } from 'llamaindex'
import { getPGVectorStore } from './store'

export async function ingestDocument(
  filePath: string,
  matterId: string,
  tenantId: string
) {
  // 1. Read PDF
  const reader = new SimpleDirectoryReader()
  const documents = await reader.loadData({
    directoryPath: filePath,
  })
  
  // 2. Add metadata (for filtering)
  documents.forEach(doc => {
    doc.metadata = {
      matter_id: matterId,
      tenant_id: tenantId,
      file_path: filePath,
    }
  })
  
  // 3. Get vector store (tenant-scoped)
  const vectorStore = await getPGVectorStore(tenantId)
  
  // 4. Create index (chunks, embeds, stores)
  const index = await VectorStoreIndex.fromDocuments(
    documents,
    { vectorStore }
  )
  
  return index
}
```

**What happens automatically:**
1. PDF parsing (SimpleDirectoryReader)
2. Text chunking (SentenceSplitter, default 512 tokens)
3. Embedding generation (OpenAI text-embedding-3-large)
4. Storage in pgvector (via PGVectorStore)

---

### 4. Query Engine (`lib/llamaindex/query.ts`)

```typescript
import { 
  VectorStoreIndex, 
  RetrieverQueryEngine,
  VectorIndexRetriever,
} from 'llamaindex'
import { getPGVectorStore } from './store'

export async function createQueryEngine(
  tenantId: string,
  matterId?: string
) {
  // 1. Get tenant-scoped vector store
  const vectorStore = await getPGVectorStore(tenantId)
  
  // 2. Create index from existing vectors
  const index = await VectorStoreIndex.fromVectorStore(vectorStore)
  
  // 3. Create retriever
  const retriever = index.asRetriever({
    similarityTopK: 10, // Return top 10 chunks
  })
  
  // 4. Optional: Filter by matter
  if (matterId) {
    retriever.setFilters({
      matter_id: matterId,
    })
  }
  
  // 5. Create query engine
  const queryEngine = new RetrieverQueryEngine(retriever)
  
  return queryEngine
}

// Usage:
export async function query(
  question: string,
  tenantId: string,
  matterId?: string
) {
  const engine = await createQueryEngine(tenantId, matterId)
  
  const response = await engine.query({
    query: question,
  })
  
  return {
    answer: response.response,
    sources: response.sourceNodes.map(node => ({
      text: node.text,
      score: node.score,
      metadata: node.metadata,
    })),
  }
}
```

---

### 5. Chat Engine (`lib/llamaindex/chat.ts`)

```typescript
import { 
  VectorStoreIndex,
  CondensePlusContextChatEngine,
} from 'llamaindex'
import { getPGVectorStore } from './store'

export async function createChatEngine(
  tenantId: string,
  matterId?: string
) {
  // 1. Get vector store & index
  const vectorStore = await getPGVectorStore(tenantId)
  const index = await VectorStoreIndex.fromVectorStore(vectorStore)
  
  // 2. Create retriever (fewer chunks for chat)
  const retriever = index.asRetriever({
    similarityTopK: 5,
  })
  
  if (matterId) {
    retriever.setFilters({ matter_id: matterId })
  }
  
  // 3. Create chat engine
  const chatEngine = new CondensePlusContextChatEngine({
    retriever,
    
    // System prompt
    systemPrompt: `
      You are a legal AI assistant for Prawnik AI platform.
      You help lawyers analyze legal documents and answer questions.
      
      Guidelines:
      - Always cite sources from the provided context
      - Be precise and accurate
      - If unsure, say so
      - Use legal terminology appropriately
      - Answer in Polish unless asked otherwise
    `,
  })
  
  return chatEngine
}

// Usage:
export async function chat(
  message: string,
  chatHistory: ChatMessage[],
  tenantId: string,
  matterId?: string
) {
  const engine = await createChatEngine(tenantId, matterId)
  
  const response = await engine.chat({
    message,
    chatHistory: chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    stream: false, // Set to true for streaming
  })
  
  return {
    message: response.response,
    sources: response.sourceNodes,
  }
}
```

---

## 🌊 Streaming with Vercel AI SDK

```typescript
// app/api/rag/chat/route.ts
import { createChatEngine } from '@/lib/llamaindex/chat'
import { LlamaIndexStream, StreamingTextResponse } from 'ai'
import { getTenantIdFromCookie } from '@/lib/auth/tenant'

export async function POST(request: Request) {
  const { messages, matterId } = await request.json()
  const tenantId = await getTenantIdFromCookie()
  
  if (!tenantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const chatEngine = await createChatEngine(tenantId, matterId)
  
  const stream = await chatEngine.chat({
    message: messages[messages.length - 1].content,
    chatHistory: messages.slice(0, -1),
    stream: true, // Enable streaming
  })
  
  // Convert LlamaIndex stream to Vercel AI SDK stream
  return new StreamingTextResponse(
    LlamaIndexStream(stream)
  )
}
```

```typescript
// components/rag/ChatInterface.tsx
'use client'
import { useChat } from 'ai/react'

export function ChatInterface({ matterId }: { matterId?: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/rag/chat',
    body: { matterId },
  })
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
```

---

## 🔍 Advanced: Custom Retrievers

```typescript
import { BaseRetriever } from 'llamaindex'

class HybridRetriever extends BaseRetriever {
  async retrieve(query: string) {
    // 1. Vector search (semantic)
    const vectorResults = await this.vectorRetriever.retrieve(query)
    
    // 2. Full-text search (keyword)
    const keywordResults = await this.keywordRetriever.retrieve(query)
    
    // 3. Reciprocal Rank Fusion (RRF)
    const merged = this.mergeResults(vectorResults, keywordResults)
    
    return merged
  }
  
  private mergeResults(vectorResults, keywordResults) {
    // RRF implementation
    // See: https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html
  }
}
```

---

## 📊 Performance Optimization

### 1. Chunking Strategy

```typescript
import { SentenceSplitter } from 'llamaindex'

const splitter = new SentenceSplitter({
  chunkSize: 512,      // Tokens per chunk
  chunkOverlap: 50,    // Overlap for context
  separator: '\n\n',   // Split on paragraphs
})
```

**Recommendations:**
- Legal contracts: 512-1024 tokens (preserve clause context)
- Court decisions: 256-512 tokens (smaller for precision)
- General docs: 512 tokens (default)

### 2. Retrieval Tuning

```typescript
const retriever = index.asRetriever({
  similarityTopK: 10,           // More = better recall, slower
  similarityThreshold: 0.7,     // Filter low-quality matches
})
```

### 3. Caching

```typescript
// Cache indices per tenant
const indexCache = new Map<string, VectorStoreIndex>()

export async function getCachedIndex(tenantId: string) {
  if (!indexCache.has(tenantId)) {
    const vectorStore = await getPGVectorStore(tenantId)
    const index = await VectorStoreIndex.fromVectorStore(vectorStore)
    indexCache.set(tenantId, index)
  }
  return indexCache.get(tenantId)!
}
```

---

## 🧪 Testing

```typescript
// __tests__/llamaindex/query.test.ts
import { createQueryEngine } from '@/lib/llamaindex/query'

describe('LlamaIndex Query Engine', () => {
  it('should retrieve relevant chunks', async () => {
    const engine = await createQueryEngine('test-tenant-id')
    
    const response = await engine.query({
      query: 'What are the contract terms?',
    })
    
    expect(response.response).toBeTruthy()
    expect(response.sourceNodes.length).toBeGreaterThan(0)
  })
  
  it('should filter by matter', async () => {
    const engine = await createQueryEngine(
      'test-tenant-id',
      'matter-123'
    )
    
    const response = await engine.query({
      query: 'Contract details',
    })
    
    // All sources should be from matter-123
    response.sourceNodes.forEach(node => {
      expect(node.metadata.matter_id).toBe('matter-123')
    })
  })
})
```

---

## 🚨 Common Pitfalls

### 1. ❌ Forgetting Tenant Filter

```typescript
// BAD: No tenant filtering
const vectorStore = new PGVectorStore({
  connectionString: process.env.DATABASE_URL,
  tableName: 'document_chunks',
})

// GOOD: Always filter by tenant
const vectorStore = new PGVectorStore({
  connectionString: process.env.DATABASE_URL,
  tableName: 'document_chunks',
  queryFilter: { tenant_id: tenantId }, // ✅
})
```

### 2. ❌ Not Handling Embeddings Cost

```typescript
// Monitor embedding usage
const estimatedTokens = text.split(' ').length * 1.3 // Rough estimate
const estimatedCost = (estimatedTokens / 1_000_000) * 0.13 // $0.13/1M tokens

if (estimatedCost > MAX_COST) {
  throw new Error('Document too large')
}
```

### 3. ❌ Ignoring Error Handling

```typescript
try {
  const index = await VectorStoreIndex.fromDocuments(documents, { vectorStore })
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Retry with exponential backoff
  } else if (error.message.includes('connection')) {
    // Database connection issue
  } else {
    throw error
  }
}
```

---

## 📚 Resources

### Official Docs
- **LlamaIndex:** https://ts.llamaindex.ai/
- **PGVectorStore:** https://ts.llamaindex.ai/modules/vector_stores/available_stores/PGVectorStore
- **Query Engines:** https://ts.llamaindex.ai/modules/high_level/query_engine
- **Chat Engines:** https://ts.llamaindex.ai/modules/high_level/chat_engine

### Examples
- **Supabase + LlamaIndex:** https://github.com/run-llama/ts-agents/tree/main/examples/supabase
- **Next.js Integration:** https://github.com/run-llama/create-llama

### Community
- **Discord:** https://discord.gg/dGcwcsnxhU
- **GitHub:** https://github.com/run-llama/LlamaIndexTS

---

## 🎯 Quick Reference

```typescript
// 1. Ingest document
import { ingestDocument } from '@/lib/llamaindex/ingest'
await ingestDocument(filePath, matterId, tenantId)

// 2. Query (one-off question)
import { query } from '@/lib/llamaindex/query'
const result = await query(question, tenantId, matterId)

// 3. Chat (conversational)
import { chat } from '@/lib/llamaindex/chat'
const response = await chat(message, history, tenantId, matterId)

// 4. Stream chat (Vercel AI SDK)
import { createChatEngine } from '@/lib/llamaindex/chat'
import { LlamaIndexStream } from 'ai'

const engine = await createChatEngine(tenantId, matterId)
const stream = await engine.chat({ message, stream: true })
return new StreamingTextResponse(LlamaIndexStream(stream))
```

---

**Last Updated:** 2024-11-16  
**Maintainer:** Prawnik AI Team
