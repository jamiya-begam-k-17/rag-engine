import os
import chromadb
from typing import List, Dict, Any
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
    #the chunking logic
    def chunk_text(self, doc: str | bytes | Any) -> List[Dict[str, Any]]:
        """Split document into chunks. Accepts str, bytes, or a file-like with .read()."""
        if doc is None:
            return []

        # normalize to text
        if hasattr(doc, "read"):
            text = doc.read()
            if isinstance(text, (bytes, bytearray)):
                text = text.decode("utf-8", errors="replace")
        elif isinstance(doc, (bytes, bytearray)):
            text = doc.decode("utf-8", errors="replace")
        elif isinstance(doc, str):
            text = doc
        else:
            raise TypeError("chunk_text expects str, bytes, or a file-like object")

        if not text:
            return []

        chunked_data = []
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
        )
        chunks = text_splitter.split_text(text)
        for i, chunk in enumerate(chunks):
            chunk_id = f"chunk_{i}"
            chunked_data.append({"id": chunk_id, "text": chunk})

        return chunked_data
    #the embedding logic
    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """Create embeddings for documents."""
        return self.embedding_model.encode(documents).tolist()
    
    #adding documents to the vector db
    def add_documents(self, documents: List) -> None:
        """
        Add documents to the vector database.

        documents: iterable of str | bytes | file-like objects
        """
        print(f"Processing {len(documents)} documents...")
        for doc_idx, doc in enumerate(documents):
            # normalize doc -> text
            if hasattr(doc, "read"):
                text = doc.read()
                if isinstance(text, (bytes, bytearray)):
                    text = text.decode("utf-8", errors="replace")
            elif isinstance(doc, (bytes, bytearray)):
                text = doc.decode("utf-8", errors="replace")
            else:
                text = str(doc)

            if not text.strip():
                print(f"Skipping document {doc_idx}: no content")
                continue

            chunks = self.chunk_text(text)
            for chunk_idx, chunk in enumerate(chunks):
                chunk_id = f"doc_{doc_idx}_chunk_{chunk_idx}"
                embedding = self.embedding_model.encode(chunk["text"])
                # ensure list-of-floats
                emb_list = embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)
                metadata = {
                    "source": f"doc_{doc_idx}",
                    "doc_index": doc_idx,
                    "chunk_index": chunk_idx,
                }
                self.collection.add(
                    ids=[chunk_id],
                    embeddings=[emb_list],
                    documents=[chunk["text"]],
                    metadatas=[metadata]
                )

        print("Documents added to vector database")

    def search(self, query: str | List[str], n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar documents in the vector database.

        Accepts a single query string or a list of query strings.
        Returns a list of result dicts (one per query) with keys:
        'ids', 'documents', 'metadatas', 'distances'.
        """
        # Normalize input to list of queries
        if isinstance(query, str):
            queries = [query]
        else:
            queries = list(query)

        # Get embeddings for all queries (SentenceTransformer returns ndarray)
        embeddings = self.embedding_model.encode(queries)
        # Ensure embeddings is a list-of-lists for chroma
        try:
            emb_list = embeddings.tolist()
        except AttributeError:
            # embeddings already a list
            emb_list = embeddings

        # Query chroma
        results = self.collection.query(
            query_embeddings=emb_list,
            n_results=n_results
        )

        # Normalize chroma response into a list of dicts per query
        ids = results.get("ids", [])
        documents = results.get("documents", [])
        metadatas = results.get("metadatas", [])
        distances = results.get("distances", [])

        out = []
        qcount = len(queries)
        for i in range(qcount):
            out.append({
                "ids": ids[i] if i < len(ids) else [],
                "documents": documents[i] if i < len(documents) else [],
                "metadatas": metadatas[i] if i < len(metadatas) else [],
                "distances": distances[i] if i < len(distances) else [],
            })

        return out
