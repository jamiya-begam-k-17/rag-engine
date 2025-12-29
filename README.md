# RAG Engine

 RAG Engine is a near production grade Retrieval-Augmented Generation system that transforms static documents into an interactive, AI-powered knowledge base. By combining semantic search with state-of-the-art Large Language Models, RAG Engine delivers accurate, context-aware responses grounded in your specific documents.

## 🚀 Features

- **Multi-LLM Support**: Compatible with OpenAI GPT, Google Gemini, and Groq (Llama) models
- **Document Processing**: Handles PDF and TXT files with intelligent chunking
- **Vector Search**: Uses ChromaDB with sentence transformers for semantic search
- **Smart Deduplication**: Automatically detects and reuses previously processed documents
- **Session Management**: SQLite-based session and chat history tracking
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Stateless & Stateful**: Works both as a CLI tool and API service

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Streamlit Mode](#cli-mode)
  - [API Mode](#api-mode)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     USER INTERACTION                      │
│                  (Streamlit)                   │
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

**Core Components:**

1. **FastAPI Server** (`main.py`): HTTP API endpoints
2. **RAGAssistant** (`app.py`): Main orchestration logic
3. **VectorDB** (`vectordb.py`): ChromaDB wrapper for embeddings
4. **RAGDatabase** (`database.py`): SQLite for sessions, documents, and messages
5. **Utils** (`utils.py`): File validation and processing

## ✅ Prerequisites

- Python 3.8+
- pip or conda
- API key for at least one LLM provider:
  - OpenAI API key
  - Google AI (Gemini) API key
  - Groq API key

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AdarshRaj2028/rag-engine.git
cd rag-engine
git checkout dev
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Required Directories

```bash
mkdir -p data chroma_db
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Choose ONE provider and set the corresponding API key

# Option 1: OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Option 2: Google Gemini
GOOGLE_API_KEY=AIza...
GOOGLE_MODEL=gemini-2.0-flash-exp

# Option 3: Groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant

# Vector Database Settings (optional)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHROMA_COLLECTION_NAME=rag_documents
```

### File Limits

The system has built-in limits to prevent abuse:

- **PDF**: Maximum 100 pages
- **TXT**: Maximum 10 MB
- **Upload Size**: Maximum 25 MB per file

You can modify these in `utils.py`:

```python
MAX_PAGES = 100
MAX_TXT_SIZE_MB = 10
```

## 🎯 Usage

The RAG Engine offers twwo different interfaces to suit your needs:
1. Streamlit UI Mode (Recommended for Beginners)
Beautiful web interface with glassmorphism design - perfect for non-technical users:
bash# Start the Streamlit app
streamlit run frontend_app.py
Features:

🎨 Modern glassmorphism UI with gradient backgrounds
📁 Drag-and-drop file upload
💬 Real-time chat interface with typing animation
📚 Source attribution with expandable context
🔄 Smart caching indicators
📊 Document metadata display (chunks, pages, file size)
### API Mode

For production deployments and integration with frontends:

```bash
# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

**Interactive API Docs**: Visit `http://localhost:8000/docs` for Swagger UI

## 📡 API Documentation

### Base URL

```
http://localhost:8000
```

### Endpoints

#### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

#### 2. Save API Key

```http
POST /api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "api_key": "your-api-key",
  "model": "gemini-2.0-flash-exp"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "API key saved for gemini-2.0-flash-exp"
}
```

---

#### 3. Check API Key Status

```http
GET /api-key-status
```

**Response:**
```json
{
  "has_api_key": true,
  "model": "gemini-2.0-flash-exp",
  "success": true
}
```

---

#### 4. Upload Document

```http
POST /upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF or TXT file

**Response:**
```json
{
  "status": "success",
  "message": "Document processed successfully",
  "session_id": "abc123...",
  "filename": "document.pdf",
  "file_size": 1048576,
  "file_type": "application/pdf",
  "page_count": 15,
  "chunk_count": 42,
  "processing_time": 3.45,
  "from_cache": false,
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

---

#### 5. Query Document

```http
POST /query
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "abc123...",
  "question": "What are the main findings?",
  "n_results": 3
}
```

**Response:**
```json
{
  "answer": "The main findings indicate...",
  "sources": [
    "Chunk 1 text...",
    "Chunk 2 text...",
    "Chunk 3 text..."
  ],
  "status": "success",
  "session_id": "abc123..."
}
```

---

#### 6. Send Message

```http
POST /messages
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "abc123...",
  "content": "Explain the methodology"
}
```

**Response:**
```json
{
  "message_id": null,
  "content": "The methodology involves..."
}
```

---

#### 7. Get Chat History

```http
GET /messages/{session_id}
```

**Response:**
```json
[
  {
    "role": "assistant",
    "content": "Hello! I've loaded your document...",
    "timestamp": "2024-01-15T10:30:00"
  },
  {
    "role": "user",
    "content": "What is this about?",
    "timestamp": "2024-01-15T10:31:00"
  },
  {
    "role": "assistant",
    "content": "This document discusses...",
    "timestamp": "2024-01-15T10:31:05"
  }
]
```

---

#### 8. Get Document Info

```http
GET /document/{session_id}
```

**Response:**
```json
{
  "document_id": "def456...",
  "file_name": "document.pdf",
  "file_hash": "sha256...",
  "chunk_count": 42,
  "collection_name": "doc_def456...",
  "status": "completed",
  "file_size": 1048576,
  "file_type": "application/pdf",
  "page_count": 15,
  "uploaded_at": "2024-01-15T10:30:00"
}
```

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

## 🔧 How It Works

### 1. Document Upload Flow

```
1. User uploads PDF/TXT → File validation (size, type, content)
2. Compute SHA256 hash → Check if document already exists
3. If new:
   - Generate unique document_id
   - Create ChromaDB collection
   - Split into chunks (1500 chars, 150 overlap)
   - Generate embeddings using sentence-transformers
   - Store chunks in vector database
4. If existing:
   - Reuse existing chunks (no reprocessing)
5. Create session → Link session to document → Return session_id
```

### 2. Query Flow

```
1. User sends question → Validate session_id
2. Generate query embedding
3. Search ChromaDB → Retrieve top K similar chunks (default: 3)
4. Combine chunks into context
5. Build prompt: "Use the following context to answer: {context}\nQuestion: {question}"
6. Send to LLM → Get response
7. Save to chat history → Return answer + sources
```

### 3. Deduplication Strategy

The system uses content-based deduplication:

- **Document ID**: `UUID5(SHA256(file_content))`
- Same content = same ID = reuse existing chunks
- Different sessions can share the same document chunks
- Saves processing time and storage space

## ⚠️ Limitations

- **PDF Limitations**: 
  - Scanned PDFs without OCR are not supported
  - Password-protected PDFs cannot be processed
  - Maximum 100 pages per document
  
- **Text Extraction**:
  - Tables and complex layouts may not parse correctly
  - Images and diagrams are ignored
  
- **Embedding Model**:
  - Fixed embedding model (all-MiniLM-L6-v2)
  - Cannot change after documents are processed
  
- **Context Window**:
  - Only retrieves top 3 chunks by default
  - May miss relevant information if query is too broad

## 🐛 Troubleshooting

### Issue: "No API key found"

**Solution**: Ensure your `.env` file exists and contains a valid API key:

```bash
# Check if .env exists
ls -la .env

# Verify contents
cat .env
```

### Issue: "PDF contains no extractable text"

**Solution**: The PDF is likely scanned. Use a text-based PDF or run OCR first.

### Issue: "ModuleNotFoundError"

**Solution**: Reinstall dependencies:

```bash
pip install -r requirements.txt --force-reinstall
```

### Issue: ChromaDB collection errors

**Solution**: Delete and recreate the database:

```bash
rm -rf chroma_db/
rm rag_engine.db
python app.py  # Will recreate on startup
```

### Issue: API returns 400 "API key required"

**Solution**: Upload an API key first:

```bash
curl -X POST http://localhost:8000/api-key \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-key", "model": "gemini-2.0-flash-exp"}'
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

### Development Setup

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black .
isort .

# Type checking
mypy .
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

##👥 Team

```
This project was developed as a collaborative effort for ReadyTensor's AAIDC Course (Project 1).

Team Members
1. Adarsh Raj - Lead Developer & AI/ML Architect

Project lead and coordinator
Overall architecture and pipeline design
Create Streamlit version and connected with the backend.
RAG logic implementation (retriever, embedder, vector DB flow)
SQLite database setup and schema design
Smart caching system (SHA-256 + UUID5)
Helped in configuring Vector database
Final testing and debugging
2. Jamiya - Frontend Developer & API Integration

React UI development and component design
Configured FastAPI
Frontend-backend API integration using FastAPI
Chat interface and user interaction design
API request/response handling
Consistent styling and usability
Helped in Testing both UI Versions
3. Natalie - Programming & Documentation Support

RAG code module development
Document loading, chunking, embedding implementation
Vector database handling
Technical documentation for backend
System architecture documentation
Overall acrchitecture reviewer
4. Victor - AI/ML Theory & Optimization Specialist

Embedding model research and evaluation
RAG performance testing
Retrieval parameter fine-tuning (chunk size, overlap, n_results)
Model performance benchmarking
Comparison reports and recommendations
Theoretical documentation and RAG overview
Laid the foundation of Vector Database
Collaboration
This project showcases effective team collaboration with clear role division while maintaining flexibility for cross-functional contributions. Each team member brought unique expertise to create a robust, production-ready RAG system.

Project Timeline: [Sep 2025] - [Dec 2025]
Course: ReadyTensor AAIDC Programme
Project Type: Retrieval-Augmented Generation System
```
```
## 🙏 Acknowledgments

- **LangChain**: For document processing and LLM integrations
- **ChromaDB**: For vector database functionality
- **Sentence Transformers**: For embedding generation
- **FastAPI**: For the REST API framework

## 📧 Contact

For questions or support:

- **GitHub Issues**: [Create an issue](https://github.com/AdarshRaj2028/rag-engine/issues)
- **Documentation**: Check the [Wiki](https://github.com/AdarshRaj2028/rag-engine/wiki)
