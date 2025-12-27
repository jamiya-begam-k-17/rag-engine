import os
import traceback
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from .vectordb import VectorDB
from .utils import validate_txt_or_pdf
from .database import RAGDatabase
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI


# FIX: Create data directory at project root (one level up from src/)
# If app.py is in src/, this goes to project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, ".env"))

def get_data_filepath():
    """
    FIX: Safely get the first file from data directory.
    Returns (filename, filepath) tuple or (None, None) if no files.
    """
    if not os.path.exists(DATA_DIR):
        return None, None
    
    entries = os.listdir(DATA_DIR)
    if not entries:
        return None, None
    
    # Get first valid file (pdf or txt)
    for entry in entries:
        if entry.lower().endswith(('.pdf', '.txt')):
            filename = entry
            filepath = os.path.join(DATA_DIR, filename)
            return filename, filepath
    
    return None, None


def load_document(filename: str, filepath: str) -> str:
    """
    Load documents for demonstration.

    Returns:
        Content of pdf or txt file in str format
    """
    raw_text = validate_txt_or_pdf(filename, filepath)
    return raw_text


class RAGAssistant:
    """
    A simple RAG-based AI assistant using ChromaDB and multiple LLM providers.
    Supports OpenAI, Groq, and Google Gemini APIs.
    """

    def __init__(self, require_api_key=False, model=None):
        """Initialize the RAG assistant.
        Args:
            require_api_key: If True, will raise an error if no API key is found.
            model: The model to use
        """
        # Store the model
        self.current_model = model
        
        # DON'T initialize LLM here anymore - it will be done via set_api_key()
        self.llm = None
        self.chain = None
        
        self.db_path = "rag_engine.db"
        
        # Initialize SQLite database
        temp_db = RAGDatabase(self.db_path)
        temp_db.connect()
        temp_db.create_tables()
        temp_db.close()
        
        # For backwards compatibility with Streamlit
        self.current_session_id = None
        self.current_collection_name = None
        
        # Create RAG prompt template
        self.prompt_template = ChatPromptTemplate.from_template(
            "Act as a helpful assistant. "
            "Use the following context STRICTLY to answer the question"
            "\nBe inside the scope of the provided context."
            "\n\nContext: {context}\n\nQuestion: {question}"
        )
        
        print("RAG Assistant initialized successfully (no LLM yet)")

    def _initialize_llm(self, require_api_key=True, model=None):
        """
        Can be used as a Fallback
        Initialize the LLM by checking for available API keys.
        Tries Google Gemini, Groq, and OpenAI in that order.
        Args:
            require_api_key: If True, will raise an error if no API key is found.
                            If False, will return None if no API key is found.
            model: The specified model to use
        """
        # Debug: Print available environment variables
        print("Debug: Checking environment variables...")
        print(f"OPENAI_API_KEY exists: {'OPENAI_API_KEY' in os.environ}")
        print(f"GROQ_API_KEY exists: {'GROQ_API_KEY' in os.environ}")
        print(f"GOOGLE_API_KEY exists: {'GOOGLE_API_KEY' in os.environ}")
        print(f"API_KEY exists: {'API_KEY' in os.environ}")
        print(f"Requested model: {model}")
        
        groq_key = os.getenv("GROQ_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        # Check for Google API key
        if os.getenv("GOOGLE_API_KEY"):
            model_name = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash-exp")
            api_key = os.getenv("GOOGLE_API_KEY")
            print(f"Using Google Gemini model: {model_name}")
            print(f"API Key (first 5 chars): {api_key[:5]}...")  
            return ChatGoogleGenerativeAI(
                google_api_key=api_key,
                model=model_name,
                temperature=0.1,
            )
        elif groq_key:
            model_name = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
            api_key = os.getenv("GROQ_API_KEY")
            print(f"Using Groq model: {model_name}")
            print(f"API Key (first 5 chars): {api_key[:5]}...") 
            return ChatGroq(
                api_key=api_key, model=model_name, temperature=0.1
            )
        elif openai_key:
            model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            api_key = os.getenv("OPENAI_API_KEY")
            print(f"Using OpenAI model: {model_name}")
            print(f"API Key (first 5 chars): {api_key[:5]}...") 
            return ChatOpenAI(
                api_key=api_key, model=model_name, temperature=0.1
            )
        
        else:
            print("No API keys found in environment variables")
            print("Current .env file contents:")
            try:
                with open('.env', 'r') as f:
                    print(f.read())
            except:
                print("Could not read .env file")
                
            if require_api_key:
                raise ValueError(
                    "No valid API key found. Please set one of: OPENAI_API_KEY, GROQ_API_KEY, GOOGLE_API_KEY, or API_KEY in your .env file"
                )
            else:
                print("Warning: No API key found. RAG functionality will be limited.")
                return None
    
    def set_api_key(self, api_key: str, model: str = None):
        """
        Set an API key and initialize the LLM.
        
        Args:
            api_key: The API key to use
            model: The model to use (e.g., 'gemini-2.0-flash-exp')
        """
        # FIXED: Update the current model
        if model:
            self.current_model = model
        
        # FIXED: Use model to determine the correct LLM initialization
        if self.current_model:
            if "gemini" in self.current_model.lower():
                print(f"Setting Google Gemini API key for model: {self.current_model}")
                self.llm = ChatGoogleGenerativeAI(
                    google_api_key=api_key,
                    model=self.current_model,
                    temperature=0.1
                )
            elif "llama" in self.current_model.lower() or "groq" in self.current_model.lower():
                print(f"Setting Groq API key for model: {self.current_model}")
                self.llm = ChatGroq(
                    api_key=api_key,
                    model=self.current_model,
                    temperature=0.1
                )
            elif "gpt" in self.current_model.lower():
                print(f"Setting OpenAI API key for model: {self.current_model}")
                self.llm = ChatOpenAI(
                    api_key=api_key,
                    model=self.current_model,
                    temperature=0.1
                )
            else:
                # Default to OpenAI
                print(f"Setting generic API key with model: {self.current_model}")
                self.llm = ChatOpenAI(
                    api_key=api_key,
                    model=self.current_model,
                    temperature=0.1
                )
        else:
            # FIXED: Fallback - try to determine from key format
            if api_key.startswith("gsk_"):
                print("Setting Groq API key")
                self.llm = ChatGroq(
                    api_key=api_key,
                    model="llama-3.1-8b-instant",
                    temperature=0.1
                )
            elif api_key.startswith("AIz"):
                print("Setting Google API key")
                self.llm = ChatGoogleGenerativeAI(
                    google_api_key=api_key,
                    model="gemini-2.0-flash-exp",
                    temperature=0.1
                )
            else:
                print("Setting OpenAI API key")
                self.llm = ChatOpenAI(
                    api_key=api_key,
                    model="gpt-4o-mini",
                    temperature=0.1
                )
        
        # Recreate the chain with the new LLM
        self.chain = self.prompt_template | self.llm | StrOutputParser()
        print("LLM initialized successfully")
    

    def upload_document(self, filepath: str) -> dict:
        """
        Add documents to the knowledge base. Works for both Streamlit and FastAPI.

        Args:
            filepath: path of the uploaded documents
        
        Returns:
            dict: Always returns a dictionary with success/error info
        """
        db = RAGDatabase(self.db_path)
        db.connect()

        try:
            if not os.path.exists(filepath):
                return {"error": f"File not found: {filepath}", "status": "error"}
            
            filename = os.path.basename(filepath)
            
            # FIX: Validate file type before processing
            if not filename.lower().endswith(('.pdf', '.txt')):
                return {"error": "Invalid file type. Only PDF and TXT files are supported.", "status": "error"}
            
            # This will raise exceptions if PDF has issues
            try:
                doc_text = load_document(filename, filepath) 
            except Exception as load_error:
                # Catch validation errors from validate_txt_or_pdf
                return {"error": str(load_error), "status": "error"}
            
            doc_in_bytes = doc_text.encode("utf-8")
            
            result = db.process_file_upload(doc_in_bytes, filename)
            
            document_id = result["document_id"]
            session_id = result["session_id"]
            was_processed = result["was_processed"]
            
            if was_processed:
                vector_db = VectorDB(collection_name=result["collection_name"])
                chunk_count = vector_db.add_document(doc_text, document_id)
                db.update_chunk_count(document_id, chunk_count)

                self.current_session_id = session_id
                self.current_collection_name = result["collection_name"]
                
                return {
                    "session_id": self.current_session_id,
                    "collection_name": self.current_collection_name,
                    "document_id": document_id,
                    "was_processed": was_processed,
                    "chunk_count": chunk_count,
                    "status": "success"
                }
            else:
                doc_info = db.get_document_by_session(session_id)
                chunk_count = doc_info["chunk_count"] if doc_info else 0

                self.current_session_id = session_id
                self.current_collection_name = result["collection_name"]

                return {
                    "session_id": self.current_session_id,
                    "collection_name": self.current_collection_name,
                    "document_id": document_id,
                    "was_processed": was_processed,
                    "chunk_count": chunk_count,
                    "filename": filename,
                    "message": "File already initialized. Fetching existing chunks",
                    "status": "success"
                }

        except Exception as e:
            traceback.print_exc()
            return {"error": f"Error processing file: {str(e)}", "status": "error"}
        finally:
            db.close()

    def query(self, question: str, session_id: str = None, n_results: int = 3) -> dict:
        """
        Query the document (Works with both Streamlit and FastAPI).

        Args:
            question: User's question
            session_id: Optional session ID (for FastAPI stateless calls)
                        If None, uses self.current_session_id (for Streamlit)
            n_results: Number of relevant chunks to retrieve

        Returns:
            Dict containing the answer from the LLM or error message
        """
        db = RAGDatabase(self.db_path)
        db.connect()

        try:
            if not self.llm:
                return {"error": "No API key configured. Please add an api key to use the RAG functionality.","status":"error"}
            
            active_session_id = session_id or self.current_session_id

            if not active_session_id:
                return {"error": "No active session. Need to upload a document first.", "status": "error"}
            
            # Save user message
            try:
                db.add_message(active_session_id, "user", question)
                print(f"User message saved")
            except Exception as e:
                print(f"Warning: Could not save user message: {e}")
            
            doc_info = db.get_document_by_session(active_session_id)
        
            if not doc_info:
                return {"error": "Session not found in database.", "status": "error"}
            
            collection_name = doc_info["collection_name"]

            print(f"STEP: Processing query: {question}")
            print(f"STEP: Using {n_results} results")
            
            # Initialize vector database
            vector_db = VectorDB(collection_name=collection_name)

            # Retrieve relevant context chunks from vector database
            print("STEP: Searching vector database...")
            search_results = vector_db.search(question, n_results=n_results)
            
            print(f"STEP: Search results type: {type(search_results)}")
            
            # FIX: Better error handling for search results
            if not search_results:
                return {"error": "No search results returned", "status": "error"}
            
            if not isinstance(search_results, dict):
                return {"error": "Invalid search results format", "status": "error"}
            
            documents = search_results.get('documents', [])
            
            if not documents:
                return {
                    "answer": "I couldn't find any relevant information in the document to answer your question.",
                    "sources": [],
                    "status": "no_results",
                    "session_id": active_session_id
                }
            
            # Combine retrieved document chunks into a single context string
            context = "\n\n".join(documents)
            
            if not context.strip():
                return {
                    "answer": "The retrieved context was empty. Please try rephrasing your question.",
                    "sources": documents,
                    "status": "empty_context",
                    "session_id": active_session_id
                }
            
            print(f"STEP: Context length: {len(context)} characters")
            print(f"STEP: Retrieved {len(documents)} documents")
            
            print("STEP: Generating response with LLM...")
            # Use the chain to generate response with context and question
            response = self.chain.invoke({
                "context": context,
                "question": question
            })

            # Save assistant message
            try:
                db.add_message(active_session_id, "assistant", response)
            except Exception as e:
                print(f"Warning: Could not save assistant message: {e}")
            
            print(f"STEP: Response generated successfully: {len(response)} characters")
            
            return {
                "answer": response,
                "sources": documents,
                "status": "success",
                "session_id": active_session_id
            }
            
        except KeyError as e:
            return {"error": f"Key error: {e}. Check your vector database.", "status": "error"}
        except Exception as e:
            traceback.print_exc()
            return {"error": f"Exception: {type(e).__name__}: {str(e)}", "status": "error"}
        finally:
            db.close()


def main():
    """Main function to demonstrate the RAG assistant."""
    try:
        # Initialize the RAG assistant with require_api_key=False
        print("Initializing RAG Assistant...")
        assistant = RAGAssistant(require_api_key=False)

        # FIX: Safely get file path
        filename, filepath = get_data_filepath()
        
        if not filename or not filepath:
            print("ERROR: No valid files found in data/ directory")
            print("Please add a PDF or TXT file to the data/ folder")
            return

        # Load and upload document
        print(f"\nLoading document: {filename}")
        upload_result = assistant.upload_document(filepath)
        
        # FIX: Check for errors in upload
        if upload_result.get("status") == "error":
            print(f"ERROR uploading document: {upload_result.get('error')}")
            return
        
        print(f"Document uploaded successfully!")
        print(f"Chunks: {upload_result.get('chunk_count', 'unknown')}")
        
        done = False
        print("\n" + "="*50)
        print("RAG Assistant Ready! Type 'quit' to exit.")
        print("="*50 + "\n")

        while not done:
            question = input("You: ").strip()
            
            if not question:
                continue
                
            if question.lower() in ['quit', 'exit', 'q']:
                done = True
                print("Goodbye!")
            else:
                result = assistant.query(question)
                
                if result.get("status") == "success":
                    print(f"\nAI: {result['answer']}\n")
                    
                    # Optionally show sources
                    if result.get("sources"):
                        show_sources = input("Show sources? (y/n): ").lower()
                        if show_sources == 'y':
                            print("\nSources:")
                            for i, source in enumerate(result["sources"], 1):
                                print(f"\n[{i}] {source[:200]}...")
                    print()
                else:
                    print(f"\nERROR: {result.get('error', 'Unknown error')}\n")

    except Exception as e:
        print(f"Error running RAG assistant: {e}")
        traceback.print_exc()
        print("\nMake sure you have:")
        print("1. Set up your .env file with at least one API key")
        print("2. Added a PDF or TXT file to the data/ folder")


if __name__ == "__main__":
    main()