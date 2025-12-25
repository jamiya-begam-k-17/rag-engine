import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv, set_key
import time
from pathlib import Path

from app import RAGAssistant
from database import RAGDatabase

# -------------------------------------------------
# App setup
# -------------------------------------------------

app = FastAPI(title="RAG Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Global variable to store the assistant instance
assistant = None
db = RAGDatabase("rag_engine.db")
db.connect()
db.create_tables()

UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global variable to track the current model
current_model = None

# -------------------------------------------------
# Helper functions
# -------------------------------------------------

def get_assistant():
    global assistant
    if assistant is None:
        raise HTTPException(status_code=400, detail="API key is required. Please upload an API key first.")
    return assistant

def initialize_assistant():
    global assistant, current_model
    if assistant is None:
        # Check if we have any API keys in the environment
        has_api_key = bool(os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("API_KEY"))
        
        if has_api_key:
            # Get the stored model
            current_model = os.getenv("CURRENT_MODEL")
            assistant = RAGAssistant(require_api_key=False)
            print(f"Assistant initialized with existing API key for model: {current_model}")
    return assistant

# Helper to get file info
def get_file_info(filepath):
    """Extract metadata from a file"""
    file_stats = os.stat(filepath)
    file_size = file_stats.st_size
    
    # Determine file type
    file_ext = Path(filepath).suffix.lower()
    
    metadata = {
        "file_size": file_size,
        "file_type": "application/pdf" if file_ext == ".pdf" else "text/plain",
        "file_extension": file_ext,
    }
    
    # For PDF files, try to get page count
    if file_ext == ".pdf":
        try:
            import pypdf
            with open(filepath, 'rb') as f:
                pdf = pypdf.PdfReader(f)
                metadata["page_count"] = len(pdf.pages)
        except Exception as e:
            print(f"Could not read PDF page count: {e}")
            metadata["page_count"] = 0
    else:
        # For text files, count lines as "pages"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = sum(1 for _ in f)
                metadata["page_count"] = max(1, lines // 50)  # Estimate ~50 lines per page
        except Exception as e:
            print(f"Could not count text lines: {e}")
            metadata["page_count"] = 0
    
    return metadata

# Initialize assistant on startup if API keys are available
initialize_assistant()

# -------------------------------------------------
# Schemas
# -------------------------------------------------

class MessageRequest(BaseModel):
    session_id: str
    content: str

class QueryRequest(BaseModel):
    session_id: str
    question: str
    n_results: int = 3

class ApiKeyRequest(BaseModel):
    api_key: str
    model: str

# -------------------------------------------------
# Routes
# -------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------- Upload document ----------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Enhanced file validation
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or TXT files allowed")

    # Check file size (200MB limit)
    MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File size ({file_size / (1024*1024):.2f}MB) exceeds maximum allowed size (200MB)"
        )
    
    # Reset file pointer after reading
    await file.seek(0)

    filepath = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Check if assistant is initialized
    try:
        assistant_instance = get_assistant()
    except HTTPException:
        raise HTTPException(status_code=400, detail="API key is required before uploading a document.")

    # Track processing time and get file metadata
    start_time = time.time()
    
    # Get file metadata before processing
    file_metadata = get_file_info(filepath)
    
    # Process document
    result = assistant_instance.upload_document(filepath)
    
    processing_time = time.time() - start_time

    if result.get("status") == "error":
        # Clean up file on error
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=result.get("error"))

    # Enhanced response with comprehensive metadata
    response = {
        "status": "success",
        "message": result.get("message", "Document processed successfully"),
        "session_id": result.get("session_id"),
        "filename": file.filename,
        # Processing details
        "newlyProcessed": result.get("newlyProcessed", True),
        "wasProcessed": result.get("wasProcessed", None),
        "was_processed": result.get("wasProcessed", False),  # Alternative key
        "from_cache": result.get("wasProcessed", False),
        # File metadata
        "file_size": file_metadata["file_size"],
        "file_type": file_metadata["file_type"],
        "page_count": file_metadata.get("page_count", 0),
        # Chunk information (from assistant result)
        "chunk_count": result.get("chunk_count", result.get("chunks", 0)),
        "chunks": result.get("chunk_count", result.get("chunks", 0)),
        # Performance metrics
        "processing_time": round(processing_time, 2),
        # Timestamp
        "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    
    return response

# API key endpoint with including the model
@app.post("/api-key")
async def save_api_key(request: ApiKeyRequest):
    """
    Save API key to environment file and initialize the assistant
    """
    global assistant, current_model
    
    try:
        api_key = request.api_key
        model = request.model
        
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        if not model:
            raise HTTPException(status_code=400, detail="Model selection is required")
        
        # Determine which API key to set based on the model
        if "gemini" in model.lower():
            env_key = "GOOGLE_API_KEY"
        elif "llama" in model.lower() or "groq" in model.lower():
            env_key = "GROQ_API_KEY"
        elif "gpt" in model.lower():
            env_key = "OPENAI_API_KEY"
        else:
            # Use generic API_KEY for unknown models (won't happen as we give model as mandatory in frontend)
            env_key = "API_KEY"
        
        # Update .env
        set_key(".env", env_key, api_key)
        # Store the current model in .env
        set_key(".env", "CURRENT_MODEL", model)
        
        # Reload .env
        load_dotenv(override=True)
        
        # Store the current model globally
        current_model = model
        
        # Initialize the assistant now that we have an API key
        if assistant is None:
            assistant = RAGAssistant(require_api_key=False, model=model)
        else:
            # Update existing assistant with new API key and model
            assistant.set_api_key(api_key, model)
        
        return {"status": "success", "message": f"API key saved for {model}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save API key: {str(e)}")

# API key status endpoint - returns the model
@app.get("/api-key-status")
async def check_api_key_status():
    """
    Check if an API key is stored and return the model
    """
    try:
        has_key = bool(os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("API_KEY"))
        model = os.getenv("CURRENT_MODEL") if has_key else None
        
        return {
            "has_api_key": has_key, 
            "model": model,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check API key status: {str(e)}")

# ---------- Send message ----------

@app.post("/messages")
def send_message(body: MessageRequest, assistant_instance: RAGAssistant = Depends(get_assistant)):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    result = assistant_instance.query(
        question=body.content,
        session_id=body.session_id,
        n_results=3
    )

    if result.get("status") != "success":
        raise HTTPException(status_code=500, detail=result.get("error"))

    return {
        "message_id": None,
        "content": result["answer"]
    }

# ---------- Get messages ----------

@app.get("/messages/{session_id}")
def get_messages(session_id: str):
    messages = db.get_messages(session_id)
    
    # Add initial greeting message if this is a new session with no messages
    if not messages:
        # Add a welcome message from the assistant
        initial_message = {
            "role": "assistant",
            "content": "Hello! I've loaded your document and I'm ready to help. Ask me anything about its contents!",
            "timestamp": None
        }
        messages.append(initial_message)
    
    return messages

# ---------- Get document info ----------

@app.get("/document/{session_id}")
def get_document(session_id: str):
    """
    Return comprehensive document information including metadata that is for the doc info
    """
    doc = db.get_document_by_session(session_id)
    if not doc:
        raise HTTPException(status_code=404, detail="No document found")
    
    # Enhance document info with file metadata if available
    filepath = os.path.join(UPLOAD_DIR, doc.get("filename", ""))
    
    if os.path.exists(filepath):
        file_metadata = get_file_info(filepath)
        doc.update(file_metadata)
    
    # Ensure consistent key names for frontend
    doc["file_name"] = doc.get("filename", doc.get("file_name", "Unknown"))
    doc["chunk_count"] = doc.get("chunk_count", doc.get("chunks", 0))
    doc["from_cache"] = doc.get("from_cache", doc.get("was_processed", False))
    
    return doc

# ---------- Query endpoint ----------

@app.post("/query")
def query_document(body: QueryRequest, assistant_instance: RAGAssistant = Depends(get_assistant)):
    result = assistant_instance.query(
        question=body.question,
        session_id=body.session_id,
        n_results=body.n_results
    )

    if result.get("status") != "success":
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result
