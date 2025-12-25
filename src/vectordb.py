import os
import chromadb
import logging
from typing import List, Dict, Any, Union
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

# FIX: Use proper logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VectorDB:
    """
    A simple vector database wrapper using ChromaDB with HuggingFace embeddings.
    """
    def __init__(self, collection_name: str = None, embedding_model: str = None):
        """
        Initialize the vector database.

        Args:
            collection_name: Name of the ChromaDB collection
            embedding_model: HuggingFace model name for embeddings
        """
        self.collection_name = collection_name or os.getenv(
            "CHROMA_COLLECTION_NAME", "rag_documents"
        )
        self.embedding_model_name = embedding_model or os.getenv(
            "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
        )

        try:
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(path="./chroma_db")

            # Load embedding model
            logger.info(f"Loading embedding model: {self.embedding_model_name}")
            self.embedding_model = SentenceTransformer(self.embedding_model_name)

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "RAG document collection"},
            )

            logger.info(f"Vector database initialized with collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error initializing VectorDB: {e}")
            raise

    def chunk_text(self, text: str, chunk_size: int = 1500, chunk_overlap: int = 150) -> List[str]:
        """
        Split text into chunks using RecursiveCharacterTextSplitter.

        Args:
            text: Input text (str)
            chunk_size: Approximate number of characters per chunk
            chunk_overlap: Number of overlapping characters between chunks

        Returns:
            List[str]: list of text chunks
        """
        # FIX: Validate input
        if not text or not isinstance(text, str):
            logger.warning("Invalid input text for chunking")
            return []
        
        if not text.strip():
            logger.warning("Empty text provided for chunking")
            return []
        
        try:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )
            chunks = text_splitter.split_text(text)
            
            logger.info(f"Text split into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            return []

    def add_document(self, document_text: str, document_id: str = None) -> int:
        """
        Add a document to the vector database.
        
        Args:
            document_text: Full text content of the document
            document_id: Unique identifier for the document (optional)
        
        Returns:
            int: Number of chunks added (0 if failed)
        """
        # FIX: Validate inputs
        if not document_text or not document_text.strip():
            logger.warning("No content provided to add_document")
            return 0

        # FIX: Default document_id if not provided
        if not document_id:
            document_id = "doc_default"
            logger.warning("No document_id provided, using default")

        try:
            # Chunk the text
            chunks = self.chunk_text(document_text)
            
            if not chunks:
                logger.warning("No chunks generated from document")
                return 0

            # Generate embeddings
            logger.info(f"Generating embeddings for {len(chunks)} chunks...")
            embeddings = self.embedding_model.encode(chunks)
            
            # FIX: Safely convert to list
            try:
                emb_list = embeddings.tolist()
            except (AttributeError, TypeError):
                emb_list = list(embeddings)

            # FIX: Check for existing chunks and handle duplicates
            # Generate unique IDs for each chunk
            ids = [
                f"{document_id}_chunk_{i}"
                for i in range(len(chunks))
            ]
            
            # Create metadata for each chunk
            metadatas = [
                {
                    "source": document_id,
                    "chunk_index": i,
                    "chunk_size": len(chunks[i])
                }
                for i in range(len(chunks))
            ]

            # FIX: Try to add, handle duplicates gracefully
            try:
                self.collection.add(
                    ids=ids,
                    embeddings=emb_list,
                    documents=chunks,
                    metadatas=metadatas,
                )
                logger.info(f"Successfully added {len(chunks)} chunks to vector database")
                return len(chunks)
            
            except Exception as add_error:
                # If chunks already exist, try upserting instead
                if "already exists" in str(add_error).lower():
                    logger.warning(f"Chunks already exist, attempting to update...")
                    try:
                        self.collection.upsert(
                            ids=ids,
                            embeddings=emb_list,
                            documents=chunks,
                            metadatas=metadatas,
                        )
                        logger.info(f"Successfully updated {len(chunks)} chunks in vector database")
                        return len(chunks)
                    except Exception as upsert_error:
                        logger.error(f"Error upserting chunks: {upsert_error}")
                        return 0
                else:
                    logger.error(f"Error adding chunks: {add_error}")
                    return 0

        except Exception as e:
            logger.error(f"Error in add_document: {e}")
            return 0

    def search(
        self, 
        query: Union[str, List[str]], 
        n_results: int = 5
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Search for similar documents in the vector database.

        Args:
            query: single query string or list of query strings
            n_results: number of results per query

        Returns:
            If query is a string -> dict with keys: 
                'ids', 'documents', 'metadatas', 'distances'
            If query is a list -> list of such dicts (one per query)
        """
        # FIX: Validate inputs
        if not query:
            logger.warning("Empty query provided to search")
            return {"ids": [], "documents": [], "metadatas": [], "distances": []}
        
        # FIX: Handle edge case of n_results
        if n_results <= 0:
            logger.warning(f"Invalid n_results: {n_results}, setting to 1")
            n_results = 1
        
        single_query = isinstance(query, str)
        queries = [query] if single_query else list(query)
        
        # FIX: Filter out empty queries
        queries = [q for q in queries if q and q.strip()]
        
        if not queries:
            logger.warning("All queries were empty after filtering")
            return {"ids": [], "documents": [], "metadatas": [], "distances": []}

        try:
            # Encode queries as list
            logger.info(f"Searching for {len(queries)} quer{'y' if len(queries)==1 else 'ies'}...")
            query_embeddings = self.embedding_model.encode(queries)
            
            # FIX: Safely convert to list
            try:
                emb_list = query_embeddings.tolist()
            except Exception:
                emb_list = list(query_embeddings)

            # Query the collection
            results = self.collection.query(
                query_embeddings=emb_list,
                n_results=n_results,
            )

            # Extract results
            ids = results.get("ids", [])
            documents = results.get("documents", [])
            metadatas = results.get("metadatas", [])
            distances = results.get("distances", [])

            # FIX: Handle case where no results found
            if not ids or not any(ids):
                logger.warning("No results found for query")
                return {"ids": [], "documents": [], "metadatas": [], "distances": []}

            # Build output structure
            qcount = len(queries)
            out: List[Dict[str, Any]] = []
            
            for i in range(qcount):
                out.append({
                    "ids": ids[i] if i < len(ids) else [],
                    "documents": documents[i] if i < len(documents) else [],
                    "metadatas": metadatas[i] if i < len(metadatas) else [],
                    "distances": distances[i] if i < len(distances) else [],
                })

            result = out[0] if single_query else out
            
            # FIX: Log search results
            if single_query and result.get("documents"):
                logger.info(f"Found {len(result['documents'])} results for query")
            
            return result

        except Exception as e:
            logger.error(f"Error during search: {e}")
            # Return empty results structure on error
            empty_result = {"ids": [], "documents": [], "metadatas": [], "distances": []}
            return empty_result if single_query else [empty_result]

    def delete_collection(self) -> bool:
        """
        Delete the current collection from ChromaDB.
        
        Returns:
            bool: True if successful, False otherwise
        
        Use case:
            - Clean up when document is removed
            - Reset the database
        """
        try:
            self.client.delete_collection(name=self.collection_name)
            logger.info(f"Deleted collection: {self.collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            return False

    def get_collection_count(self) -> int:
        """
        Get the number of documents in the collection.
        
        Returns:
            int: Number of chunks in the collection
        """
        try:
            count = self.collection.count()
            logger.info(f"Collection {self.collection_name} contains {count} chunks")
            return count
        except Exception as e:
            logger.error(f"Error getting collection count: {e}")
            return 0

    def collection_exists(self) -> bool:
        """
        Check if the collection exists in ChromaDB.
        
        Returns:
            bool: True if collection exists, False otherwise
        """
        try:
            collections = self.client.list_collections()
            exists = any(c.name == self.collection_name for c in collections)
            return exists
        except Exception as e:
            logger.error(f"Error checking collection existence: {e}")
            return False