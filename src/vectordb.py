import os
import chromadb
from typing import List, Dict, Any, Union
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter


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

        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path="./chroma_db")

        # Load embedding model
        print(f"Loading embedding model: {self.embedding_model_name}")
        self.embedding_model = SentenceTransformer(self.embedding_model_name)

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "RAG document collection"},
        )

        print(f"Vector database initialized with collection: {self.collection_name}")

    def chunk_text(self, text: Union[str, bytes], chunk_size: int = 500, chunk_overlap: int = 100) -> List[str]:
        """
        Split text into chunks using RecursiveCharacterTextSplitter.

        Args:
            text: Input text (str or bytes)
            chunk_size: Approximate number of characters per chunk
            chunk_overlap: Number of overlapping characters between chunks

        Returns:
            List[str]: list of text chunks
        """
        if text is None:
            return []

        if isinstance(text, (bytes, bytearray)):
            try:
                text = text.decode("utf-8")
            except Exception:
                text = text.decode("utf-8", errors="replace")

        if not isinstance(text, str):
            text = str(text)

        if not text.strip():
            return []

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunks = text_splitter.split_text(text)
        return chunks

    def add_documents(self, documents: List[Union[str, bytes, Dict[str, Any]]], document_id: str | None = None) -> int:
        """
        Add documents to the vector database.

        If document_id is provided it will be used when creating chunk IDs and metadata.
        Returns: total number of chunks added
        """
        total_chunks = 0
        print(f"Processing {len(documents)} documents...")
        for doc_idx, doc in enumerate(documents):
            # Normalize document -> text and get optional metadata
            metadata_base: Dict[str, Any] = {}
            if isinstance(doc, dict):
                raw = doc.get("content", "")
                metadata_base = doc.get("metadata", {}) or {}
            else:
                raw = doc

            if isinstance(raw, (bytes, bytearray)):
                try:
                    raw_text = raw.decode("utf-8")
                except Exception:
                    raw_text = raw.decode("utf-8", errors="replace")
            else:
                raw_text = str(raw)

            if not raw_text.strip():
                print(f"Skipping document {doc_idx}: no content")
                continue

            chunks = self.chunk_text(raw_text)
            if not chunks:
                print(f"No chunks generated for document {doc_idx}")
                continue

            # Create embeddings for all chunks of this document in one call
            embeddings = self.embedding_model.encode(chunks)
            try:
                emb_list = embeddings.tolist()
            except Exception:
                emb_list = list(embeddings)

            # Use provided document_id when available to build stable chunk ids
            ids = [
                (f"{document_id}_chunk_{i}" if document_id else f"doc_{doc_idx}_chunk_{i}")
                for i in range(len(chunks))
            ]
            metadatas = [
                {
                    **metadata_base,
                    "source": (document_id if document_id else f"doc_{doc_idx}"),
                    "doc_index": doc_idx,
                    "chunk_index": i,
                }
                for i in range(len(chunks))
            ]

            self.collection.add(
                ids=ids,
                embeddings=emb_list,
                documents=chunks,
                metadatas=metadatas,
            )
            total_chunks += len(chunks)

        print("Documents added to vector database")
        return total_chunks

    def search(self, query: Union[str, List[str]], n_results: int = 5) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Search for similar documents in the vector database.

        Args:
            query: single query string or list of query strings
            n_results: number of results per query

        Returns:
            If query is a string -> dict with keys: 'ids','documents','metadatas','distances'
            If query is a list -> list of such dicts (one per query)
        """
        single_query = isinstance(query, str)
        queries = [query] if single_query else list(query)

        # Encode queries as list
        query_embeddings = self.embedding_model.encode(queries)
        try:
            emb_list = query_embeddings.tolist()
        except Exception:
            emb_list = list(query_embeddings)

        results = self.collection.query(
            query_embeddings=emb_list,
            n_results=n_results,
        )

        ids = results.get("ids", [])
        documents = results.get("documents", [])
        metadatas = results.get("metadatas", [])
        distances = results.get("distances", [])

        qcount = len(queries)
        out: List[Dict[str, Any]] = []
        for i in range(qcount):
            out.append({
                "ids": ids[i] if i < len(ids) else [],
                "documents": documents[i] if i < len(documents) else [],
                "metadatas": metadatas[i] if i < len(metadatas) else [],
                "distances": distances[i] if i < len(distances) else [],
            })

        return out[0] if single_query else out
