from pypdf import PdfReader
from fastapi import HTTPException, UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
import os

MAX_PAGES = 100
MAX_TXT_SIZE_MB = 10


def validate_txt_or_pdf(filename: str, filepath: str) -> str:
    """
    Validate and load content from PDF or TXT files.
    
    Args:
        filename: Name of the file with extension
        filepath: Full path to the file
    
    Returns:
        str: Raw text content from the file
    
    Raises:
        FileNotFoundError: If file doesn't exist
        TypeError: If file is not PDF or TXT
        Exception: If PDF is too large or has other issues
    """
    # Check if file exists
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    
    # Case-insensitive extension check
    file_lower = filename.lower()
    
    if file_lower.endswith(".pdf"):
        try:
            loader = PyMuPDFLoader(filepath, extract_images=False)
            docs = loader.load()
            
            if not docs:
                raise Exception("PDF file is empty or couldn't be loaded")
            
            page_count = docs[0].metadata.get("total_pages", 0)
            
            if page_count > MAX_PAGES:
                raise Exception(
                    f"Document too large: {page_count} pages. "
                    f"Maximum allowed limit is {MAX_PAGES} pages."
                )
            
            raw_text = docs[0].page_content
            
            if not raw_text or not raw_text.strip():
                raise Exception(
                    "PDF contains no extractable text. "
                    "This might be a scanned document or image-based PDF. "
                    "Please use a PDF with selectable text."
                )
            
            return raw_text
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Check for specific error types and provide user-friendly messages
            if "no extractable text" in error_msg or "scanned document" in error_msg:
                raise Exception(
                    "PDF contains no extractable text. "
                    "Please use a text-based PDF, not a scanned image."
                )
            elif "document too large" in error_msg or "maximum allowed" in error_msg:
                raise  # Re-raise our custom size error as-is
            elif "empty" in error_msg or "couldn't be loaded" in error_msg:
                raise Exception("PDF file is empty or corrupted. Please check the file.")
            elif "password" in error_msg or "encrypted" in error_msg:
                raise Exception("PDF is password-protected. Please upload an unencrypted PDF.")
            elif "pdf" in error_msg and ("invalid" in error_msg or "corrupt" in error_msg):
                raise Exception("PDF file appears to be corrupted or invalid.")
            else:
                # Generic error for any other PyMuPDF failures
                raise Exception(f"Unable to process PDF: {str(e)}")
    
    elif file_lower.endswith(".txt"):
        try:
            # Check file size first
            file_size_mb = get_file_size_mb(filepath)
            if file_size_mb > MAX_TXT_SIZE_MB:
                raise Exception(
                    f"TXT file too large: {file_size_mb}MB. "
                    f"Maximum allowed is {MAX_TXT_SIZE_MB}MB."
                )
            
            with open(filepath, 'r', encoding='utf-8') as txt_file:
                raw_text = txt_file.read()
            
            if not raw_text or not raw_text.strip():
                raise Exception("TXT file is empty")
            
            return raw_text
            
        except UnicodeDecodeError:
            # Try with different encoding if UTF-8 fails
            try:
                with open(filepath, 'r', encoding='latin-1') as txt_file:
                    raw_text = txt_file.read()
                return raw_text
            except Exception as e:
                raise Exception(f"Error reading TXT file with alternative encoding: {str(e)}")
        except Exception as e:
            # Check if it's our size limit exception
            if "too large" in str(e).lower() or "maximum allowed" in str(e).lower():
                raise  # Re-raise size limit error as-is
            raise Exception(f"Error processing TXT file: {str(e)}")
    
    else:
        raise TypeError(
            f"Unsupported file type: {filename}. "
            "Only .pdf and .txt files are supported."
        )

def validate_pdf_upload(file: UploadFile) -> int:
    """
    Validate an uploaded PDF file (for FastAPI).
    
    Args:
        file: UploadFile object from FastAPI
    
    Returns:
        int: Number of pages in the PDF
    
    Raises:
        HTTPException: If PDF is invalid or too large
    """
    try:
        # Read the file content
        reader = PdfReader(file.file)
        num_pages = len(reader.pages)
        
        if num_pages > MAX_PAGES:
            raise HTTPException(
                status_code=400,
                detail=f"PDF too large: {num_pages} pages (limit is {MAX_PAGES})."
            )
        
        # Rewind the file pointer for later processing
        file.file.seek(0)
        return num_pages
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error validating PDF: {str(e)}"
        )


def get_file_size_mb(filepath: str) -> float:
    """
    Get file size in megabytes.
    
    Args:
        filepath: Path to the file
    
    Returns:
        float: File size in MB
    """
    if not os.path.exists(filepath):
        return 0.0
    
    size_bytes = os.path.getsize(filepath)
    size_mb = size_bytes / (1024 * 1024)
    return round(size_mb, 2)


def is_valid_file_type(filename: str) -> bool:
    """
    Check if filename has a valid extension.
    
    Args:
        filename: Name of the file
    
    Returns:
        bool: True if file type is supported
    """
    return filename.lower().endswith(('.pdf', '.txt'))