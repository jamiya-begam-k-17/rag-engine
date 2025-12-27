# RAG Engine 🚀

<div align="center">

**An Intelligent Retrieval-Augmented Generation System**

[![Python](https://img.shields.io/badge/python-3.10+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io/)
[![LangChain](https://img.shields.io/badge/🦜_LangChain-121212?style=for-the-badge)](https://langchain.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6F00?style=for-the-badge)](https://www.trychroma.com/)
[![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

*Transform your documents into an intelligent, conversational knowledge base*

[Quick Start](#-quick-start) • [Features](#-key-features) • [Architecture](#-architecture) • [Documentation](#-project-structure)

---

### 🎓 AAIDC Project - 1

*Developed as ReadyTensor's AAIDC Project 1*

This project showcases advanced RAG techniques including semantic search, smart caching with content-based deduplication, and multi-LLM integration.

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Team](#-team)
- [Deployment Options](#-deployment-options)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
  - [Streamlit (Local - Full Features)](#option-1-streamlit-local---full-features)
  - [React + FastAPI (Cloud Demo)](#option-2-react--fastapi-cloud-demo)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Technical Deep Dive](#-technical-deep-dive)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Overview

**RAG Engine** is a near production-ready Retrieval-Augmented Generation system that transforms static documents into an interactive, AI-powered knowledge base. By combining semantic search with state-of-the-art Large Language Models, RAG Engine delivers accurate, context-aware responses grounded in your specific documents.

### What is RAG?

Retrieval-Augmented Generation (RAG) enhances LLMs by incorporating relevant information from your documents during response generation:

✅ **Eliminates hallucinations** - Responses are grounded in factual document content  
✅ **No retraining required** - Update knowledge by simply uploading new documents  
✅ **Privacy-focused** - Your data stays under your control  
✅ **Source transparency** - Every answer includes citations for verification  
✅ **Cost-effective** - No need for expensive fine-tuning or model retraining

### Use Cases

- 📚 **Knowledge Management**: Build intelligent documentation systems
- 🎓 **Educational Tools**: Create interactive learning assistants
- 💼 **Enterprise Search**: Enable semantic search across company documents
- 🔬 **Research Assistance**: Query academic papers and technical documentation
- 📊 **Customer Support**: Power AI-driven support with product documentation
- ⚖️ **Legal & Compliance**: Query contracts, regulations, and legal documents

---

## 👥 Team

This project was developed as a collaborative effort for ReadyTensor's AAIDC Course (Project 1).

### Team Members

**1. Adarsh Raj** - *Lead Developer & AI/ML Architect*
- Project lead and coordinator
- Overall architecture and pipeline design
- Create Streamlit version and connected with the backend.
- RAG logic implementation (retriever, embedder, vector DB flow)
- SQLite database setup and schema design
- Smart caching system (SHA-256 + UUID5)
- Helped in configuring Vector database
- Final testing and debugging

**2. Jamiya** - *Frontend Developer & API Integration Specialist*
- React UI development and component design
- Configured FastAPI
- Frontend-backend API integration using FastAPI
- Chat interface and user interaction design
- API request/response handling
- Consistent styling and usability
- Helped in Testing both UI Versions

**3. Natalie** - *Programming & Documentation Support*
- RAG code module development
- Document loading, chunking, embedding implementation
- Vector database handling
- Technical documentation for backend
- System architecture documentation
- Overall acrchitecture reviewer

**4. Victor** - *AI/ML Theory & Optimization Specialist*
- Embedding model research and evaluation
- RAG performance testing 
- Retrieval parameter fine-tuning (chunk size, overlap, n_results)
- Model performance benchmarking
- Comparison reports and recommendations
- Theoretical documentation and RAG overview
- Laid the foundation of Vector Database

### Collaboration

This project showcases effective team collaboration with clear role division while maintaining flexibility for cross-functional contributions. Each team member brought unique expertise to create a robust, production-ready RAG system.

**Project Timeline**: [Sep 2025] - [Dec 2025]  
**Course**: ReadyTensor AAIDC Programme  
**Project Type**: Retrieval-Augmented Generation System

---

## 🚀 Deployment Options

RAG Engine offers **two deployment modes** optimized for different use cases:

<table>
<thead>
<tr>
<th width="20%">Feature</th>
<th width="40%">🖥️ Streamlit (Local)</th>
<th width="40%">☁️ React + FastAPI (Cloud)</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Purpose</strong></td>
<td>Full-featured production use</td>
<td>Demo & showcase deployment</td>
</tr>
<tr>
<td><strong>Deployment</strong></td>
<td>Local machine</td>
<td>Vercel (frontend) + Render (backend)</td>
</tr>
<tr>
<td><strong>Storage</strong></td>
<td>✅ Persistent (local disk)</td>
<td>⚠️ Non-persistent (resets on inactivity)</td>
</tr>
<tr>
<td><strong>API Key Storage</strong></td>
<td>✅ Secure (.env file)</td>
<td>⚠️ Temporary (SQLite, unencrypted)</td>
</tr>
<tr>
<td><strong>Session Timeout</strong></td>
<td>✅ Never (persistent)</td>
<td>⚠️ 15 minutes of inactivity</td>
</tr>
<tr>
<td><strong>Smart Caching</strong></td>
<td>✅ Full support (indefinite)</td>
<td>✅ Session-based only</td>
</tr>
<tr>
<td><strong>Document Limit</strong></td>
<td>Multiple (cached indefinitely)</td>
<td>One at a time</td>
</tr>
<tr>
<td><strong>Chat History</strong></td>
<td>✅ Persistent across sessions</td>
<td>❌ Lost on reset</td>
</tr>
<tr>
<td><strong>Source Citations</strong></td>
<td>✅ Full details with expand</td>
<td>❌ No citation support</td>
</tr>
<tr>
<td><strong>Best For</strong></td>
<td>Personal use, teams, research</td>
<td>Demos, portfolios, showcases</td>
</tr>
<tr>
<td><strong>Setup Complexity</strong></td>
<td>Simple (one command)</td>
<td>Access via web link</td>
</tr>
<tr>
<td><strong>Cost</strong></td>
<td>Free (local hardware)</td>
<td>Free (cloud free tier)</td>
</tr>
</tbody>
</table>

### 🔐 Security Considerations

**⚠️ Important - Cloud Deployment**:

The React cloud deployment is designed for **demonstration purposes only**:

- **Temporary Storage**: Sessions reset after 15 minutes of inactivity
- **No Encryption**: API keys stored unencrypted (for demo simplicity)
- **Non-Persistent**: No long-term data storage on free-tier platforms
- **Single Document**: One document at a time per session
- **Recommended Use**: Portfolio showcases, quick demos, proof-of-concept

**For Advanced features and more security**, always choose the **Streamlit local deployment** which offers:
- ✅ Secure API key storage in `.env` files
- ✅ Full data persistence across sessions
- ✅ Complete control over documents and chat history
- ✅ Multi-document support (One at a time) with indefinite caching
- ✅ Full source citation with expandable views

---

## ✨ Key Features

### Core Capabilities

🔍 **Intelligent Document Processing**
- Support for **PDF (Preferred)** (up to 100 pages) and **TXT** files
- Automatic text chunking with smart overlap for context preservation
- Advanced metadata extraction and management
- Robust validation for corrupted or scanned PDFs

🧠 **Semantic Search**
- Powered by **Sentence Transformers** embeddings (all-MiniLM-L6-v2)
- Vector similarity matching with **ChromaDB** persistent storage
- Configurable retrieval parameters (top-k, similarity threshold)
- Sub-second query response times (3-4 seconds average)

💬 **Multi-LLM Support**
- **Groq Models**
- **Google Models**
- **OpenAI Models**
- Easy provider switching via API or UI
- BYOK (Bring Your Own Key) architecture in React Version
- This feature is not available in React version (User will only have Groq models)

🎨 **Dual Interface Options**
- **Streamlit**: Full-featured, production-ready local interface with glassmorphism design
- **React + FastAPI**: Modern web UI with responsive design and real-time chat, Made for demo purposes.

### 🚄 Smart Caching System - The Game Changer

**RAG Engine's standout feature** - eliminates redundant processing and dramatically improves performance:

#### How It Works

**1. Content-based Hashing (SHA-256)**
```python
def compute_checksum(self, file_bytes: bytes) -> str:
    """Generate SHA-256 hash of file content"""
    return hashlib.sha256(file_bytes).hexdigest()
```
- Creates a unique 64-character fingerprint of the document
- Even 1-byte change produces a completely different hash
- Immune to filename changes (hash based on content only)

**2. Deterministic ID Generation (UUID5)**
```python
def generate_document_id(self, file_bytes: bytes) -> str:
    """Generate UUID5 from content hash"""
    checksum = self.compute_checksum(file_bytes)
    return uuid.uuid5(uuid.NAMESPACE_URL, checksum).hex
```
- UUID5 ensures the same content always produces the same ID
- Forms a deterministic, globally unique identifier
- Enables instant O(1) lookup without comparing file contents

**3. Intelligent Database Lookup**
```sql
SELECT document_id, chromadb_collection_name, chunk_count
FROM documents
WHERE document_id = ?
```
- Indexed primary key for lightning-fast lookups
- Returns existing chunks if document was processed before
- Proceeds with full processing only if genuinely new

**4. Zero-Copy Chunk Reuse**
```python
if existing_doc:
    # Reuse existing chunks - no processing needed
    collection_name = existing_doc['chromadb_collection_name']
    # Link new session to existing document
    INSERT INTO session_documents(session_id, document_id)
```
- No re-chunking, no re-embedding
- Instant access to pre-computed vector representations
- Multiple users can reference same document simultaneously

#### Real-World Performance Impact

**Scenario: 50-page technical PDF (1.2MB)**

| Metric | First Upload | Subsequent Upload (Cache Hit) | **Improvement** |
|--------|-------------|------------------------------|-----------------|
| **Processing Time** | ~7-10 seconds | <1 second | **10x faster** |
| **Embedding API Calls** | ~55 chunks | 0 calls | **100% savings** |
| **Network Requests** | Multiple API calls | Single DB query | **Minimal latency** |

#### Practical Example

```
Day 1, User A: Upload "Company_Policy_2024.pdf" 
              → 7 seconds processing ⏳
              → 42 chunks created
              → Stored in ChromaDB

Day 2, User B: Upload same "Company_Policy_2024.pdf"
              → <1 second 
              → Hash detected 
              → Chunks reused
              → Zero API calls

Day 3, User C: Upload renamed "HR_Policy.pdf" (same content)
              → <1 second 
              → SHA-256 hash matches → Chunks reused
              → Filename doesn't matter

Day 4, User D: Upload modified "Company_Policy_2024_v2.pdf"
              → 7 seconds (new hash detected)
              → Content changed → New processing required
              → New chunks created
```

#### Benefits Summary

1. **⚡ Speed**: 10x faster for repeated uploads - instant loading vs 7 - 10 seconds
2. **💰 Cost Savings**: Zero embedding API calls for cached documents
3. **🌍 Storage Efficiency**: One copy of embeddings, infinite sessions can reference
4. **🔄 Consistency**: Same document always produces identical vector representations
5. **🎯 Smart Detection**: Even renamed files are detected via content hash

This sophisticated caching system is **near production-grade** and saves significant time and resources, especially in team environments where multiple users work with the same documents.

### Additional Features

- ⚡ **High Performance**: Async/await patterns throughout the backend
- 🔄 **Persistent Storage**: ChromaDB with disk persistence (local mode)
- 📊 **Session Management**: Track conversations across multiple users
- 🧪 **Extensible Architecture**: Modular design for easy customization
- 📦 **Production Ready**: Comprehensive error handling and validation
- 🎯 **Chat Context**: View source citations for transparency
- 🔍 **Document Validation**: Automatic checks for file size, page count, and content

---

## 🏗 Architecture

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                     USER INTERACTION                      │
│                  (Streamlit / React UI)                   │
└────────────────────────────┬──────────────────────────────┘
                             │
                  ┌──────────▼─────────┐
                  │  Upload Document   │
                  │ (PDF or TXT)       |
                  └─────────┬──────────┘
                            │
         ┌──────────────────▼───────────────────────────────┐
         │          SMART CACHING CHECK                     │
         │  ─────────────────────────────                   │
         │  1. Compute SHA-256 hash from file bytes         │
         │  2. Generate deterministic UUID5 from hash       │
         │  3. Query SQLite: document_id exists?            │
         └─────────────────┬────────────────────────────────┘
                           │
               ┌───────────▼────────────┐
               │      Cache Hit?        │
               └───┬──────────────┬─────┘
                   │              │
              YES  │              │  NO
                   │              │
        ┌──────────▼───┐    ┌─────▼────────────────┐
        │  INSTANT     │    │  FULL PROCESSING     │
        │  REUSE       │    │  ──────────────────  │
        │  ─────────   │    │  1. Extract text     │
        │  • Load      │    │  2. Chunk text       │
        │    existing  │    │     (1500 chars,     │
        │    chunks    │    │      150 overlap)    │
        │  • Link to   │    │  3. Generate         │
        │    session   │    │     embeddings       │
        │  • <1 sec    │    │     (SentenceT.)     │
        │              │    │  4. Store in         │
        │              │    │     ChromaDB         │
        │              │    │  5. Update SQLite    │
        │              │    │  • ~7-10 sec         │
        └─────────┬────┘    └───┬──────────────────┘
                  │             │
                  └──────┬──────┘
                         │
                ┌────────▼─────────┐
                │  READY TO QUERY  │
                │  ─────────────── │
                │   • Document in  │
                │     vector DB    │
                │   • Metadata in  │
                │     SQLite       │
                └─────────┬────────┘
                          │
                          │
                ┌─────────▼─────────────┐
                │   User Question       │
                │   (Natural Language)  │
                └─────────┬─────────────┘
                          │
                ┌─────────▼──────────────────┐
                │   RETRIEVAL PIPELINE       │
                │   ──────────────────────   │
                │   1. Generate query        │
                │      embedding             │
                │   2. Vector similarity     │
                │      search (cosine)       │
                │   3. Retrieve top-k        │
                │      chunks (default: 3)   │
                │   • ~0.5-1 sec             │
                └─────────┬──────────────────┘
                          │
                ┌─────────▼──────────────────┐
                │   GENERATION PIPELINE      │
                │   ──────────────────────   │
                │   1. Assemble context      │
                │      from chunks           │
                │   2. Format RAG prompt     │
                │      template              │
                │   3. Call LLM API          │
                │      (OpenAI/Groq/Gemini)  │
                │   4. Generate response     │
                │   • ~2-4 sec               │
                └─────────┬──────────────────┘
                          │
                ┌─────────▼──────────────┐
                │  Response Delivery     │
                │  ────────────────────  │
                │  • AI-generated answer │
                │  • Source citations    │
                │  • Metadata tracking   │
                └────────────────────────┘
```

### Data Flow Overview

1. **Document Upload** → File validation (type, size, page count, content)
2. **Smart Caching** → SHA-256 hash → UUID5 ID → Database lookup → Reuse or process
3. **Text Processing** → Extract → Chunk (1500/150) → Embed → Store in ChromaDB
4. **Query Processing** → Embed query → Similarity search (top-k=3)
5. **Response Generation** → Retrieve chunks → Format prompt → LLM call
6. **Result Delivery** → Answer + source attribution + session tracking

### Technology Stack

**Backend:**
- **FastAPI**: Modern, async web framework for API endpoints
- **LangChain**: RAG orchestration and LLM integration
- **ChromaDB**: Vector database for embeddings storage
- **SQLite**: Relational database for sessions, documents, messages
- **Sentence Transformers**: Embedding model (all-MiniLM-L6-v2)
- **PyMuPDF**: PDF text extraction
- **Python 3.10+**: Core runtime

**Frontend:**
- **React 18**: Modern UI library with hooks
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client for API communication
- **Streamlit**: Rapid prototyping and local deployment

**Infrastructure:**
- **Vercel**: Frontend hosting (React deployment)
- **Render**: Backend hosting (FastAPI deployment)
- **Git/GitHub**: Version control and collaboration

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **4GB+ RAM** (8GB recommended for larger documents)
- **1GB+ free disk space** (for vector database and models)
- **Internet connection** (for LLM API calls and model downloads)

### Option 1: Streamlit (Local - Full Features)

**✅ Recommended for advance use, research, and personal projects**

#### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/AdarshRaj2028/rag-engine
cd rag-engine

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate

# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 2: Configure API Keys

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your API key
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Add ONE of the following to your `.env` file:**

```env
# Option 1: Groq (Recommended - Free tier with generous limits)
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Option 2: Google Gemini (Free tier available)
GOOGLE_API_KEY=AIza_your_key_here
GOOGLE_MODEL=gemini-2.0-flash-exp

# Option 3: OpenAI (Paid, but most powerful)
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-4o-mini
```

**Where to get API keys:**
- **Groq**: [console.groq.com](https://console.groq.com) - Free, fast inference, generous rate limits
- **Google Gemini**: [ai.google.dev](https://ai.google.dev) - Free tier with good limits
- **OpenAI**: [platform.openai.com](https://platform.openai.com) - Paid, highest quality responses

#### Step 3: Launch Streamlit

```bash
# From project root (with virtual environment activated)
streamlit run src/frontend_app.py
```

The app will automatically open in your browser at `http://localhost:8501`

#### Step 4: Upload and Query

1. **Upload Document**: 
   - Click "Browse files" in the sidebar
   - Select a PDF (max 100 pages) or TXT file (max 10MB)
   
2. **Wait for Processing**: 
   - First upload: 7-10 seconds (depending on size)
   - Subsequent uploads of same file: <1 second ⚡
   
3. **Start Chatting**: 
   - Ask questions about your document in natural language
   - Responses appear with streaming effect
   
4. **View Sources**: 
   - Expand "View Sources" to see the exact chunks used 
   - Present in Streamlit Version
   - Verify the AI's reasoning and citations

**✅ Your documents and chat history persist indefinitely across sessions!**

---

### Option 2: React + FastAPI (Cloud Demo)

**✅ Recommended for demos, portfolios, and showcasing**

The React + FastAPI version is **deployed and accessible via web link** - no local setup required!

#### How to Use

1. **Open the Web App**: Click the demo link
   
2. **Configure API Key**:
   - Click "⚙️ Settings" in the navigation
   - Select your preferred Groq model
   - Enter your API key (Groq)
   - Click "Save API Key"
   
3. **Upload Document**:
   - Navigate to "📤 Upload" tab
   - Select PDF (max 100 pages) or TXT
   - Wait for processing (7-10 seconds for new docs)

4. **Start Chatting**:
   - Go to "💬 Chat" tab
   - Ask questions about your document
   - View AI responses in real-time

**⚠️ Important Reminders:**
- Sessions reset after **15 minutes of inactivity**
- API keys are **temporary** (not persistent)
- One document at a time per session
- Suitable for **demos only** - use Streamlit for advance use

---

## 📁 Project Structure

```
rag-engine/
├── src/                          # Backend source code
│   ├── main.py                   # FastAPI app, routes, CORS, file upload
│   ├── app.py                    # RAG orchestration, LLM init, query pipeline
│   ├── vectordb.py               # ChromaDB wrapper, chunking, embeddings
│   ├── database.py               # SQLite operations, smart caching logic
│   ├── utils.py                  # File validation, PDF parsing
│   └── frontend_app.py           # Streamlit UI with glassmorphism design
│
├── rag-ui/                       # React frontend (cloud deployment)
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Chat.jsx          # Chat interface with message history
│   │   │   ├── Upload.jsx        # File upload with progress
│   │   │   ├── Settings.jsx      # API key configuration
│   │   │   └── Sidebar.jsx       # Navigation sidebar
│   │   ├── services/
│   │   │   └── api.js            # Axios client for backend API
│   │   ├── App.jsx               # Root component with routing
│   │   ├── App.css               # Global styles
│   │   └── index.js              # Entry point
│   ├── public/                   # Static assets (index.html, favicon)
│   ├── package.json              # Node dependencies
│   └── tailwind.config.js        # Tailwind CSS configuration
│
├── data/                         # Document storage (gitignored)
│   └── (uploaded PDFs/TXTs)      # Temporary storage for processing
│
├── chroma_db/                    # Vector database (gitignored)
│   └── (persistent embeddings)   # ChromaDB collection files
│
├── rag_engine.db                 # SQLite database (gitignored)
│                                 # Contains: sessions, documents, messages
│
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── LICENSE                       # CC BY-NC-SA 4.0 License
└── README.md                     # This file
```

### Key Files Explained

| File | Lines | Purpose |
|------|-------|---------|
| `src/main.py` | ~300 | FastAPI routes, CORS middleware, file upload handling, API endpoints |
| `src/app.py` | ~400 | RAG logic, LLM initialization (OpenAI/Groq/Gemini), prompt templates, query pipeline |
| `src/vectordb.py` | ~300 | Text chunking (RecursiveCharacterTextSplitter), embedding generation, ChromaDB CRUD |
| `src/database.py` | ~500 | SQLite schema, session management, smart caching (SHA-256 + UUID5), message storage |
| `src/utils.py` | ~150 | File validation, PDF text extraction (PyMuPDF), size/page checks, error handling |
| `src/frontend_app.py` | ~400 | Streamlit UI, state management, file upload, chat interface, glassmorphism CSS |
| `rag-ui/src/services/api.js` | ~100 | Axios HTTP client, API endpoint wrappers, error handling |

---

## ⚙️ Configuration

### Chunking Parameters
Adjust text chunking in `src/vectordb.py`:
```python
def chunk_text(self, text: str, chunk_size: int = 1500, chunk_overlap: int = 150):
```

**Tuning Guidelines:**

| Document Type | Recommended Chunk Size | Overlap | Rationale |
|---------------|----------------------|---------|-----------|
| Technical docs | 1000-1500 | 100-150 | Balance detail vs context |
| Long-form content | 1500-2000 | 150-200 | Preserve narrative flow |
| FAQs / Short articles | 500-1000 | 50-100 | Precise retrieval |
| Legal documents | 2000-2500 | 200-250 | Maintain clause context |

**Rules of Thumb:**
- **Larger chunks (1500-2000)**: Better for narrative, context-heavy content
- **Smaller chunks (500-1000)**: Better for factual, structured documents
- **Overlap (10-15%)**: Prevents information loss at boundaries

### Retrieval Parameters

Adjust number of retrieved chunks in `src/app.py`:

```python
def query(self, question: str, session_id: str = None, n_results: int = 3):
```

**Recommendations:**

| Query Type | n_results | Rationale |
|-----------|-----------|-----------|
| Simple factual | 1-2 | Single source sufficient |
| Standard questions | 3-5 | Balanced coverage |
| Complex analysis | 5-7 | Multiple perspectives |
| Comprehensive research | 7-10 | Maximum context |

**⚠️ Warning**: Too many chunks (>10) may:
- Confuse the LLM with contradictory info
- Exceed LLM context window limits
- Increase latency and API costs

### Embedding Models

Change the embedding model in `src/vectordb.py`:

```python
self.embedding_model_name = embedding_model or os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
)
```

**Available Models:**

| Model | Dimensions | Speed | Accuracy | Use Case |
|-------|-----------|-------|----------|----------|
| all-MiniLM-L6-v2 (default) | 384 | ⚡⚡⚡ | ⭐⭐⭐ | Balanced, fast |
| all-mpnet-base-v2 | 768 | ⚡⚡ | ⭐⭐⭐⭐ | Higher accuracy |
| multi-qa-mpnet-base-dot-v1 | 768 | ⚡⚡ | ⭐⭐⭐⭐ | Optimized for Q&A |

**Note**: Changing embedding models requires **reprocessing all documents** (different vector representations).

---

## 🔬 Technical Deep Dive

**Key Design Decision**: 
- One document record can be linked to multiple sessions
- Zero duplication of chunks in ChromaDB
- Sessions are lightweight (just a link to document_id)

### Text Chunking Strategy

```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,      # Target size per chunk
    chunk_overlap=150,    # Overlap between chunks (10%)
    length_function=len,  # Character-based counting
    separators=["\n\n", "\n", ". ", " ", ""]  # Split hierarchy
)
```

**How RecursiveCharacterTextSplitter Works:**

1. **Try separators in order**: 
   - First: Split on double newlines (paragraphs)
   - If chunks still too large: Split on single newlines
   - If still too large: Split on periods (sentences)
   - Last resort: Split on spaces or characters

2. **Preserve context**:
   - 150-character overlap ensures no information loss at boundaries
   - Example: "...end of chunk A" → "end of chunk A at start of chunk B..."

3. **Optimal for RAG**:
   - Chunks are semantically coherent (respect paragraph/sentence boundaries)
   - Overlap prevents missing cross-boundary information
   - Size optimized for embedding models (not too long, not too short)

### Vector Similarity Search

```python
# Generate query embedding
query_embedding = self.embedding_model.encode([query])  # Shape: (1, 384)

# Search ChromaDB
results = self.collection.query(
    query_embeddings=query_embedding.tolist(),
    n_results=3,  # Top 3 most similar chunks
    # ChromaDB uses cosine similarity by default
)
```

**Cosine Similarity Calculation:**

```
similarity = (A · B) / (||A|| × ||B||)

Where:
- A = query embedding (384-dimensional vector)
- B = document chunk embedding (384-dimensional vector)
- · = dot product
- || || = vector magnitude

Result: Value between -1 and 1 (higher = more similar)
```

**Example:**
```
Query: "What is the company policy on remote work?"
Query Vector: [0.12, -0.34, 0.56, ..., 0.23]  # 384 dimensions

Chunk 1: "Remote work policy: Employees may work..."
Chunk 1 Vector: [0.15, -0.31, 0.59, ..., 0.25]
Similarity: 0.89 ✅ (High match)

Chunk 2: "Vacation days are calculated based on..."
Chunk 2 Vector: [0.03, 0.42, -0.18, ..., 0.67]
Similarity: 0.34 (Low match)

Result: Chunk 1 is retrieved for context
```

### RAG Prompt Template

```python
prompt_template = ChatPromptTemplate.from_template(
    "Act as a helpful assistant. "
    "Use the following context STRICTLY to answer the question. "
    "\nBe inside the scope of the provided context."
    "\n\nContext: {context}\n\nQuestion: {question}"
)
```

**Why This Template Works:**

1. **Clear Role Definition**: "Act as a helpful assistant"
2. **Strict Grounding**: "Use context STRICTLY" prevents hallucinations
3. **Scope Limitation**: "Stay inside the scope" avoids speculation
4. **Structured Format**: Clear separation of context and question

**Example Filled Prompt:**
```
Act as a helpful assistant. Use the following context STRICTLY to answer the question.
Be inside the scope of the provided context.

Context: 
[Chunk 1] Remote work policy: Employees may work remotely up to 3 days per week...
[Chunk 2] To request remote work, submit Form HR-102 to your manager...
[Chunk 3] Remote work equipment will be provided by the IT department...

Question: How many days can I work remotely?

[LLM generates answer based only on provided chunks]
```
---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Won't Start

**Error:**
```
Error: Address already in use: 0.0.0.0:8000
```

**Solution:**
```bash
# Windows (PowerShell)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Or change the port
uvicorn src.main:app --reload --port 8001
```

---

#### 2. ChromaDB Errors

**Error:**
```
Error: Unable to create ChromaDB client
sqlite3.DatabaseError: database disk image is malformed
```

**Solution:**
```bash
# Delete corrupted database
rm -rf chroma_db/

# Restart application - ChromaDB will recreate
streamlit run src/frontend_app.py
```

**Prevention**: Don't forcefully kill the application during document processing.

---

#### 3. API Key Not Working

**Error:**
```
Error: Invalid API key or API key not found
```

**Solutions:**

**For Streamlit:**
```bash
# Check .env file exists
ls -la .env

# Verify key format
cat .env
# Should see: GROQ_API_KEY=gsk_...

# Restart Streamlit
streamlit run src/frontend_app.py
```

**For React (Cloud):**
- Keys are temporary (reset after 15 min)
- Re-enter key in Settings tab
- Verify model selection matches provider

**Key Format Check:**
- OpenAI: Starts with `sk-`
- Groq: Starts with `gsk_`
- Gemini: Starts with `AIza`

---

#### 4. PDF Upload Fails

**Error:**
```
Error: PDF contains no extractable text
```

**Cause**: Scanned PDF (image-based, not text-based)

**Solution**: 
- Use OCR software to convert to text-based PDF
- Or manually extract text and upload as TXT file

**Error:**
```
Error: Document too large: 150 pages (limit is 100)
```

**Solution**:
- Split PDF into smaller sections
- Or increase limit in `src/utils.py`:
  ```python
  MAX_PAGES = 150  # Increase as needed
  ```

---

#### 5. Out of Memory

**Error:**
```
MemoryError: Unable to allocate array
```

**Causes:**
- Processing very large documents
- Too many chunks in memory
- Embedding model too large

**Solutions:**
```python
# Reduce chunk size in src/vectordb.py
chunk_size = 1000  # Down from 1500

# Use smaller embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Instead of mpnet
```

---

#### 6. Slow Query Responses

**Symptoms**: Queries take >10 seconds

**Diagnosis:**
```python
# Add timing logs in src/app.py
import time

start = time.time()
search_results = vector_db.search(question, n_results=3)
print(f"Search took: {time.time() - start:.2f}s")

start = time.time()
response = self.chain.invoke({"context": context, "question": question})
print(f"LLM took: {time.time() - start:.2f}s")
```

**Solutions:**
- **If search is slow**: Rebuild ChromaDB collection
- **If LLM is slow**: Switch to faster model (e.g., gpt-3.5-turbo, llama-3.1-8b)
- **If network is slow**: Check internet connection

---

#### 7. Embeddings Not Loading

**Error:**
```
OSError: Unable to load data from sentence-transformers
```

**Cause**: First-time model download failed

**Solution:**
```bash
# Manually download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Or use different model
# Edit src/vectordb.py:
EMBEDDING_MODEL = "all-mpnet-base-v2"
```

---

#### 8. React Frontend Can't Connect to Backend

**Error in browser console:**
```
Network Error: Failed to fetch
```

**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/health
# Should return: {"status":"ok"}

# Check CORS configuration in src/main.py
allow_origins=["http://localhost:3000"]  # Should match frontend URL

# Restart both services
```

---

### Debug Mode

Enable detailed logging for troubleshooting:

**Add to `src/app.py`:**
```python
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

---

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**: Look for error details in terminal output
2. **GitHub Issues**: [Open an issue](https://github.com/AdarshRaj2028/rag-engine/issues) with:
   - Error message
   - Steps to reproduce
   - System info (OS, Python version)
   - Log output
3. **Discussions**: [Community discussions](https://github.com/AdarshRaj2028/rag-engine/discussions)
4. **ReadyTensor Support**: Reach out to course instructors

---

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### What This Means

✅ **You CAN:**
- Use this code for personal, educational, and research purposes
- Modify and build upon this work
- Share and distribute the code
- Use it in your portfolio

❌ **You CANNOT:**
- Use this code for commercial purposes
- Sell this code or derivative works
- Use it in commercial products or services

📋 **You MUST:**
- Give appropriate credit to the original authors
- Link to the license
- Indicate if changes were made
- Distribute derivative works under the same license

### Full License

See the [LICENSE](LICENSE) file for complete terms and conditions.

### Third-Party Licenses

This project uses the following open-source libraries, each with their own licenses:

- **FastAPI**: MIT License
- **LangChain**: MIT License
- **ChromaDB**: Apache 2.0 License
- **Sentence Transformers**: Apache 2.0 License
- **React**: MIT License
- **Streamlit**: Apache 2.0 License

Please refer to each library's license for specific terms.

---

## 🙏 Acknowledgments

### Course and Mentorship

- **ReadyTensor** - For providing the project framework and learning opportunity
- **Course Instructors** - For guidance on RAG system architecture and best practices
- **Teaching Assistants** - For technical support and code reviews

### Open Source Community

This project stands on the shoulders of giants. We're grateful to:

- **[FastAPI](https://fastapi.tiangolo.com/)** by Sebastián Ramírez - For the excellent async web framework
- **[LangChain](https://langchain.com/)** - For RAG patterns, templates, and LLM integrations
- **[ChromaDB](https://www.trychroma.com/)** - For the powerful vector database with seamless Python integration
- **[Sentence Transformers](https://www.sbert.net/)** by UKP Lab - For state-of-the-art embedding models
- **[Streamlit](https://streamlit.io/)** - For enabling rapid prototyping of data apps
- **[React](https://react.dev/)** by Meta - For the modern UI framework
- **[Tailwind CSS](https://tailwindcss.com/)** - For utility-first CSS framework

### LLM Providers

- **[OpenAI](https://openai.com/)** - For GPT models and API access
- **[Groq](https://groq.com/)** - For ultra-fast LLM inference and generous free tier
- **[Google DeepMind](https://deepmind.google/)** - For Gemini models and AI research

### Documentation Resources

- **[Anthropic's RAG Guide](https://www.anthropic.com/)** - For foundational RAG concepts
- **[LangChain Documentation](https://python.langchain.com/)** - For implementation patterns
- **[ChromaDB Cookbook](https://docs.trychroma.com/)** - For vector database best practices

---

## 📚 Additional Resources

### Learn More About RAG

- 📖 [RAG Explained - Anthropic](https://www.anthropic.com/index/retrieval-augmented-generation)
- 🎓 [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/)
- 📝 [RAG Paper (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
- 🎥 [RAG Systems Explained (YouTube)](https://www.youtube.com/results?search_query=retrieval+augmented+generation)

### Technical Documentation

- 🔧 [FastAPI Documentation](https://fastapi.tiangolo.com/)
- 🗄️ [ChromaDB Documentation](https://docs.trychroma.com/)
- 🤖 [Sentence Transformers](https://www.sbert.net/)
- ⚛️ [React Documentation](https://react.dev/)

### Vector Embeddings & Search

- 📊 [Understanding Embeddings](https://platform.openai.com/docs/guides/embeddings)
- 🔍 [Vector Similarity Search Explained](https://www.pinecone.io/learn/vector-similarity/)
- 🧮 [Cosine Similarity Tutorial](https://en.wikipedia.org/wiki/Cosine_similarity)

### LLM Resources

- 🤖 [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- ⚡ [Groq Documentation](https://console.groq.com/docs/quickstart)
- 🌟 [Google AI Studio](https://ai.google.dev/)

---

## 📊 Project Statistics

- **Total Lines of Code**: ~2,500+ (Python + JavaScript)
- **Backend (Python)**: ~1,800 lines
- **Frontend (React)**: ~700 lines
- **Documents Tested**: 6-7 different types (PDFs, TXTs)
- **Average Query Response**: 3-4 seconds
- **Average Upload Time**: 7-28 seconds (first time), <1 second (cached)
- **Supported File Types**: PDF, TXT
- **Max PDF Pages**: 100
- **LLM Providers Supported (Streamlit Version)**: 3 (OpenAI, Groq, Google)
- **Embedding Models**: 3 options available
- **Default Chunk Size**: 1500 characters with 150 overlap

---

<div align="center">

## ⭐ Star This Project

If you found this project helpful, please consider giving it a star on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/AdarshRaj2028/rag-engine?style=social)](https://github.com/AdarshRaj2028/rag-engine/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AdarshRaj2028/rag-engine?style=social)](https://github.com/AdarshRaj2028/rag-engine/network/members)

---

**Built with ❤️ for the AI community**

*Developed as part of ReadyTensor's AAIDC Course - Project 1*

[⬆ Back to top](#rag-engine-)

</div>