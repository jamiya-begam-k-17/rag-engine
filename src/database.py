import sqlite3
import uuid 
import hashlib
import logging
from typing import Dict, List, Optional

# FIX: Use proper logging instead of print statements
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGDatabase:
    """Handles all database operations for the RAG Engine"""
# ================================================================================
# Database connection and initialization

    def __init__(self, db_path: str = "rag_engine.db"):
        """
        Initializes database connection

        Args:
            db_path: Path to the SQLite database file

        Note:
            Connection is not established until connect() is called
        """
        self.db_path = db_path
        self.conn: Optional[sqlite3.Connection] = None
        self.cursor: Optional[sqlite3.Cursor] = None

    def connect(self):
        """
        Establish connection to SQLite database
        
        This method:
        - Creates connection to database file (creates if doesn't exist)
        - Enables foreign key constraints (OFF by default in SQLite)
        - Sets row_factory for dict-like access to results
        - Creates cursor for executing queries
        
        Must be called before any database operations
        """
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.execute("PRAGMA foreign_keys = ON")
            self.conn.row_factory = sqlite3.Row  # Responsible for dict like behaviour
            self.cursor = self.conn.cursor()
            logger.info(f"Connected to database: {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            raise

    def create_tables(self):
        """
        Create all required database tables if they don't exist
        
        Tables created:
        - sessions: Tracks user browsing sessions
        - documents: Stores unique document metadata
        - session_documents: Many-to-many relationship between sessions and documents
        - messages: Stores chat history for each session
        
        Also creates indexes on foreign keys for query performance
        
        Uses IF NOT EXISTS so it's safe to call multiple times
        """
        try:
            # Table 1: Sessions
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions(
                session_id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT (datetime('now', 'localtime')),
                last_active TIMESTAMP DEFAULT (datetime('now', 'localtime'))
                )
            """)
            
            # Table 2: Documents (tracks unique documents)
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents(
                document_id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                file_hash TEXT NOT NULL UNIQUE,
                upload_timestamp TIMESTAMP DEFAULT (datetime('now', 'localtime')),
                chunk_count INTEGER,
                chromadb_collection_name TEXT,
                processing_status TEXT DEFAULT 'completed'
            )
            """)
            
            # Table 3: Session-Document relationship (many to many)
            self.conn.execute("""
            CREATE TABLE IF NOT EXISTS session_documents(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                document_id TEXT NOT NULL,
                uploaded_at TIMESTAMP DEFAULT (datetime('now', 'localtime')),
                FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
                FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE,
                UNIQUE(session_id, document_id)
            )  
            """)
        
            # Table 4: Messages
            self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages(
                message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT (datetime('now', 'localtime')),
                FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
            )
            """)
            
            # Creates indexes for faster queries
            self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_session
            ON messages(session_id)
            """)

            self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_files_session 
            ON session_documents(session_id)
            """)

            self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_docs_document
            ON session_documents(document_id)
            """)

            # Commit all table creations
            self.conn.commit()
            logger.info("Database tables created/verified successfully")
            
        except sqlite3.Error as e:
            logger.error(f"Error creating tables: {e}")
            raise

    def close(self):
        """Closes the database connection"""
        if self.conn:
            try:
                self.conn.close()
                logger.info("Database connection closed")
            except sqlite3.Error as e:
                logger.error(f"Error closing database: {e}")

# =================================================================================
# Helper Functions

    def compute_checksum(self, file_byte: bytes) -> str:
        """
        Compute SHA256 checksum of file content
        
        Args:
            file_byte: File content as bytes
            
        Returns:
            str: Hexadecimal checksum
        """
        checksum = hashlib.sha256(file_byte).hexdigest()
        return checksum

    def generate_session_id(self) -> str:
        """
        Generate a unique session identifier
        
        Returns:
            str: UUID4 hex string
        """
        session_id = uuid.uuid4().hex
        return session_id

    def generate_document_id(self, file_byte: bytes) -> str:
        """
        Generate deterministic document ID based on content
        
        Args:
            file_byte: File content as bytes
            
        Returns:
            str: UUID5 hex string (deterministic based on content)
        """
        checksum = self.compute_checksum(file_byte)
        doc_id = uuid.uuid5(uuid.NAMESPACE_URL, checksum).hex
        return doc_id

# ===============================================================================
# Session Operations

    def create_session(self, session_id: str) -> None:
        """
        Create a new session record in the database
        
        Args:
            session_id: Unique session identifier (from generate_session_id)
        """
        try:
            self.cursor.execute("""
            INSERT INTO sessions (session_id, created_at, last_active)
            VALUES (?, datetime('now', 'localtime'), datetime('now', 'localtime'))
            """, (session_id,))
            self.conn.commit()
            logger.info(f"Session created: {session_id[:8]}...")
        except sqlite3.IntegrityError:
            logger.warning(f"Session {session_id[:8]}... already exists")
        except sqlite3.Error as e:
            logger.error(f"Error creating session: {e}")
            raise

    def get_session_info(self, session_id: str) -> Optional[Dict]:
        """
        Get detailed information about a session
        
        Args:
            session_id: Session identifier
        
        Returns:
            Dictionary with session info or None if not found
            {
                'session_id': str,
                'created_at': str,
                'last_active': str,
                'message_count': int,
                'document_count': int
            }
        """
        try:
            self.cursor.execute("""
                SELECT 
                    s.session_id,
                    s.created_at,
                    s.last_active,
                    COUNT(DISTINCT m.message_id) as message_count,
                    COUNT(DISTINCT sd.document_id) as document_count
                FROM sessions s
                LEFT JOIN messages m ON s.session_id = m.session_id
                LEFT JOIN session_documents sd ON s.session_id = sd.session_id
                WHERE s.session_id = ?
                GROUP BY s.session_id
                """, (session_id,))
            
            row = self.cursor.fetchone()
            
            if not row:
                logger.warning(f"Session {session_id[:8]}... not found")
                return None
            
            return {
                'session_id': row['session_id'],
                'created_at': row['created_at'],
                'last_active': row['last_active'],
                'message_count': row['message_count'],
                'document_count': row['document_count']
            }
        except sqlite3.Error as e:
            logger.error(f"Error getting session info: {e}")
            return None
    
    def update_last_active(self, session_id: str) -> None:
        """
        Update the last_active timestamp for a session
        
        Args:
            session_id: Session identifier
        
        Use case:
            Call this whenever user interacts (sends message, uploads file)
            Helps track active sessions and clean up old ones
        """
        try:
            self.cursor.execute("""
                UPDATE sessions
                SET last_active = datetime('now', 'localtime')
                WHERE session_id = ?
                """, (session_id,))
            
            self.conn.commit()
            
            if self.cursor.rowcount > 0:
                logger.debug(f"Updated last_active for session {session_id[:8]}...")
            else:
                logger.warning(f"Session {session_id[:8]}... not found for update")
        except sqlite3.Error as e:
            logger.error(f"Error updating last_active: {e}")
         
# ================================================================================
# Document Operations

    def process_file_upload(self, file_bytes: bytes, filename: str) -> Dict:
        """
        Process uploaded file with intelligent deduplication
        
        Args:
            file_bytes: File content as bytes
            filename: Original filename
        
        Returns:
            dict: {
                'session_id': str,
                'document_id': str,
                'collection_name': str,
                'was_processed': bool  # True if new, False if reused
            }
        """
        try:
            # Creating the new session 
            session_id = self.generate_session_id()
            self.create_session(session_id)

            # Generate document_id and file hash for the content
            document_id = self.generate_document_id(file_bytes)
            file_hash = self.compute_checksum(file_bytes)

            # Check if the same document already exists or not
            self.cursor.execute("""
            SELECT document_id, chromadb_collection_name, chunk_count
            FROM documents
            WHERE document_id = ?
            """, (document_id,))

            existing_doc = self.cursor.fetchone()

            if existing_doc:
                # Document exists, can reuse those chunks
                logger.info(f"Document already exists (ID: {document_id[:8]}...)")

                collection_name = existing_doc['chromadb_collection_name']

                # Link this session to the existing document
                self.cursor.execute("""
                    INSERT OR IGNORE INTO session_documents(session_id, document_id)
                    VALUES(?, ?)
                """, (session_id, document_id))

                self.conn.commit()

                return {
                    'session_id': session_id,
                    'document_id': document_id,
                    'collection_name': collection_name,
                    'was_processed': False
                }
            
            else:
                # New document, processing needed
                logger.info(f"New document detected, initializing... (ID: {document_id[:8]}...)")

                collection_name = f"doc_{document_id[:16]}"

                chunk_count = None
                # This is a placeholder (None), will be updated after actual chunking

                # Insert into documents table
                self.cursor.execute("""
                INSERT INTO documents(document_id, filename, file_hash, chunk_count, chromadb_collection_name)
                VALUES(?, ?, ?, ?, ?)
                """, (document_id, filename, file_hash, chunk_count, collection_name))

                # Link to session
                self.cursor.execute("""
                INSERT INTO session_documents(session_id, document_id)
                VALUES(?, ?)
                """, (session_id, document_id))

                self.conn.commit()

                return {
                    'session_id': session_id,
                    'document_id': document_id,
                    'collection_name': collection_name,
                    'was_processed': True
                }
        
        except sqlite3.Error as e:
            logger.error(f"Database error in process_file_upload: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in process_file_upload: {e}")
            raise

    def get_document_by_session(self, session_id: str) -> Optional[Dict]:
        """
        Get the document associated with a session
        
        Args:
            session_id: Session identifier
        
        Returns:
            Dictionary with document info or None if no document
            {
                'document_id': str,
                'file_hash': str,
                'filename': str,
                'chunk_count': int,
                'collection_name': str,
                'status': str,
                'uploaded_at': str
            }
        
        Use case:
            - Know which ChromaDB collection to query during chat
            - Display document info in UI
        """
        try:
            self.cursor.execute("""
                SELECT 
                    d.document_id,
                    d.file_hash,
                    d.filename,
                    d.chunk_count,
                    d.chromadb_collection_name,
                    d.processing_status,
                    sd.uploaded_at
                FROM documents d
                JOIN session_documents sd ON d.document_id = sd.document_id
                WHERE sd.session_id = ?
                """, (session_id,))
            
            row = self.cursor.fetchone()
            
            if not row:
                logger.warning(f"No document found for session {session_id[:8]}...")
                return None
            
            return {
                'document_id': row['document_id'],
                'file_hash': row['file_hash'],
                'filename': row['filename'],
                'chunk_count': row['chunk_count'],
                'collection_name': row['chromadb_collection_name'],
                'status': row['processing_status'],
                'uploaded_at': row['uploaded_at']
            }
        except sqlite3.Error as e:
            logger.error(f"Error getting document by session: {e}")
            return None

    def update_chunk_count(self, document_id: str, chunk_count: int) -> None:
        """
        Update the chunk count for a document
        
        Args:
            document_id: Document identifier
            chunk_count: Number of chunks
        """
        try:
            self.cursor.execute("""
                UPDATE documents SET chunk_count = ? WHERE document_id = ?
            """, (chunk_count, document_id))
            self.conn.commit()
            logger.info(f"Updated chunk count for document {document_id[:8]}... to {chunk_count}")
        except sqlite3.Error as e:
            logger.error(f"Error updating chunk count: {e}")
            raise

    def check_document_exists(self, document_id: str) -> bool:
        """
        Check if a document exists in the database
        
        Args:
            document_id: Document identifier
        
        Returns:
            bool: True if exists, False otherwise
        
        Use case:
            - Validate before processing
            - Check if ChromaDB collection should exist
        """
        try:
            self.cursor.execute("""
                SELECT 1 FROM documents WHERE document_id = ? LIMIT 1
                """, (document_id,))
            
            exists = self.cursor.fetchone() is not None
            
            if exists:
                logger.debug(f"Document {document_id[:8]}... exists")
            else:
                logger.debug(f"Document {document_id[:8]}... not found")
            
            return exists
        except sqlite3.Error as e:
            logger.error(f"Error checking document existence: {e}")
            return False

# =================================================================================
# Message Operations (CRUD)

    def add_message(self, session_id: str, role: str, content: str) -> Optional[int]:
        """
        Add a message to the chat history
        
        Args:
            session_id: Session identifier
            role: 'user' or 'assistant'
            content: Message text
        
        Returns:
            int: The message_id of the inserted message, or None on error
        
        Raises:
            ValueError: If role is not 'user' or 'assistant'
        """
        if role not in ['user', 'assistant']:
            raise ValueError(f"Invalid Role: {role}. MUST be 'user' or 'assistant'")
        
        try:
            # Insert message
            self.cursor.execute("""
            INSERT INTO messages(session_id, role, content, timestamp)
            VALUES(?, ?, ?, datetime('now', 'localtime'))
            """, (session_id, role, content))

            # Get the ID of the inserted message
            message_id = self.cursor.lastrowid

            # Commit the transaction
            self.conn.commit()

            logger.info(f"Message added (ID: {message_id}, Role: {role})")

            return message_id
        except sqlite3.Error as e:
            logger.error(f"Error adding message: {e}")
            return None
    
    def get_messages(self, session_id: str, limit: Optional[int] = None) -> List[Dict]:
        """
        Retrieve all messages for a session
        
        Args:
            session_id: Session identifier
            limit: Optional limit on number of messages to retrieve
        
        Returns:
            List of message dictionaries, ordered by timestamp (oldest first)
            Each dict contains: message_id, session_id, role, content, timestamp
        
        Example:
            messages = db.get_messages('abc123')
            for msg in messages:
                print(f"{msg['role']}: {msg['content']}")
        """
        try:
            query = """
            SELECT message_id, session_id, role, content, timestamp
            FROM messages
            WHERE session_id = ?
            ORDER BY timestamp ASC
            """
            if limit:
                query += f" LIMIT {int(limit)}"  # FIX: Ensure limit is integer
            
            self.cursor.execute(query, (session_id,))

            # Fetch all rows
            rows = self.cursor.fetchall()

            # Convert sqlite3.Row objects to dictionaries
            messages = []
            for row in rows:
                messages.append({
                    'message_id': row['message_id'],
                    'session_id': row['session_id'],
                    'role': row['role'],
                    'content': row['content'],
                    'timestamp': row['timestamp']
                })

            logger.info(f"Retrieved {len(messages)} messages for session {session_id[:8]}...")
        
            return messages
        except sqlite3.Error as e:
            logger.error(f"Error getting messages: {e}")
            return []
    
    def get_last_n_messages(self, session_id: str, n: int = 5) -> List[Dict]:
        """
        Get the last N messages from a session
        
        Use cases:
            - Context window management: Only send recent messages to LLM
            - Performance: Don't load entire chat history every time

        Args:
            session_id: Session identifier
            n: Number of recent messages to retrieve
        
        Returns:
            List of last N messages, ordered oldest to newest (for chat display)
        """
        try:
            self.cursor.execute("""
                SELECT message_id, session_id, role, content, timestamp
                FROM messages
                WHERE session_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (session_id, n))
            
            rows = self.cursor.fetchall()
            
            messages = []
            for row in rows:
                messages.append({
                    'message_id': row['message_id'],
                    'session_id': row['session_id'],
                    'role': row['role'],
                    'content': row['content'],
                    'timestamp': row['timestamp']
                })
            
            # Reverse so oldest message is first (chat display order)
            return messages[::-1]
        except sqlite3.Error as e:
            logger.error(f"Error getting last N messages: {e}")
            return []
        