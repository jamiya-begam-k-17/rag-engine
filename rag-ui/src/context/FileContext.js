import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as api from '../services/api';

// Initial state
const initialState = {
  uploadedFile: null,
  fileProcessed: false,
  isProcessing: false,
  newlyProcessed: false,
  wasProcessed: null,
  sessionId: null,
  uploaderKey: 0,
  error: null,
  backendConnected: null,
  apiKey: '',
  apiKeyStored: false,
  selectedModel: '', // Empty by default to force selection
  documentMetadata: null, // ADDED: Store document metadata
};

// Action types
const ActionTypes = {
  SET_PROCESSING: 'SET_PROCESSING',
  SET_FILE_PROCESSED: 'SET_FILE_PROCESSED',
  SET_ERROR: 'SET_ERROR',
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_UPLOADER_KEY: 'SET_UPLOADER_KEY',
  SET_BACKEND_CONNECTION: 'SET_BACKEND_CONNECTION',
  SET_API_KEY: 'SET_API_KEY',
  SET_API_KEY_STORED: 'SET_API_KEY_STORED',
  SET_SELECTED_MODEL: 'SET_SELECTED_MODEL',
  SET_DOCUMENT_METADATA: 'SET_DOCUMENT_METADATA', // ADDED
  RESET_FILE: 'RESET_FILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.payload,
      };
    case ActionTypes.SET_FILE_PROCESSED:
      return {
        ...state,
        uploadedFile: action.payload.filename,
        fileProcessed: true,
        isProcessing: false,
        newlyProcessed: action.payload.newlyProcessed,
        wasProcessed: action.payload.wasProcessed,
        sessionId: action.payload.session_id,
        error: null,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
      };
    case ActionTypes.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload,
      };
    case ActionTypes.SET_UPLOADER_KEY:
      return {
        ...state,
        uploaderKey: state.uploaderKey + 1,
      };
    case ActionTypes.SET_BACKEND_CONNECTION:
      return {
        ...state,
        backendConnected: action.payload,
      };
    case ActionTypes.SET_API_KEY:
      return {
        ...state,
        apiKey: action.payload,
      };
    case ActionTypes.SET_API_KEY_STORED:
      return {
        ...state,
        apiKeyStored: action.payload,
      };
    case ActionTypes.SET_SELECTED_MODEL:
      return {
        ...state,
        selectedModel: action.payload,
      };
    case ActionTypes.SET_DOCUMENT_METADATA: // ADDED
      return {
        ...state,
        documentMetadata: action.payload,
      };
    case ActionTypes.RESET_FILE:
      return {
        ...state,
        uploadedFile: null,
        fileProcessed: false,
        newlyProcessed: false,
        wasProcessed: null,
        sessionId: null,
        documentMetadata: null, // ADDED: Clear metadata on reset
        error: null,
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const FileContext = createContext();

// Provider component
export const FileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.healthCheck();
        dispatch({ type: ActionTypes.SET_BACKEND_CONNECTION, payload: true });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_BACKEND_CONNECTION, payload: false });
      }
    };

    checkBackend();
    
    // Check API key status AND get the model
    const checkApiKey = async () => {
      try {
        const result = await api.checkApiKeyStatus();
        if (result.success) {
          dispatch({ type: ActionTypes.SET_API_KEY_STORED, payload: result.has_api_key });
          // If API key exists, also set the model
          if (result.model) {
            dispatch({ type: ActionTypes.SET_SELECTED_MODEL, payload: result.model });
          }
        } else {
          console.error('Failed to check API key status:', result.error);
          dispatch({ type: ActionTypes.SET_API_KEY_STORED, payload: false });
        }
      } catch (error) {
        console.error('Failed to check API key status:', error);
        dispatch({ type: ActionTypes.SET_API_KEY_STORED, payload: false });
      }
    };
    
    checkApiKey();
  }, []);

  // UPDATED: Handle file upload - now retrieves and stores metadata
  const handleFileUpload = async (file) => {
    dispatch({ type: ActionTypes.SET_PROCESSING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const result = await api.uploadFile(file);
      
      // Store file processing result
      dispatch({
        type: ActionTypes.SET_FILE_PROCESSED,
        payload: {
          filename: file.name,
          newlyProcessed: result.newlyProcessed || true,
          wasProcessed: result.wasProcessed || null,
          session_id: result.session_id,
        },
      });

      // ADDED: Store document metadata from backend response
      const metadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        // Backend response fields
        chunkCount: result.chunk_count || result.chunkCount || result.chunks || 0,
        pageCount: result.page_count || result.pageCount || result.pages || 0,
        fromCache: result.from_cache || result.fromCache || result.was_processed || false,
        processingTime: result.processing_time || result.processingTime || 0,
        // Additional fields
        uploadedAt: new Date().toISOString(),
        sessionId: result.session_id,
      };

      dispatch({
        type: ActionTypes.SET_DOCUMENT_METADATA,
        payload: metadata,
      });

      // Return the result for auto-redirect
      return { 
        status: 'success', 
        session_id: result.session_id,
        metadata: metadata 
      };
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return { status: 'error', error: error.message };
    }
  };

  // Handle API key upload - accepts model parameter
  const handleApiKeyUpload = async (apiKey, model) => {
    dispatch({ type: ActionTypes.SET_API_KEY, payload: apiKey });
    
    try {
      // Pass the selected model to the API
      const result = await api.storeApiKey(apiKey, model);
      if (result.status === 'success') {
        dispatch({ type: ActionTypes.SET_API_KEY_STORED, payload: true });
        return true;
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.message || 'Failed to store API key' });
        return false;
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // UPDATED: Remove document - also clears metadata
  const removeDocument = () => {
    dispatch({ type: ActionTypes.RESET_FILE });
    dispatch({ type: ActionTypes.SET_UPLOADER_KEY });
  };

  // Clear newly processed flag
  const clearNewlyProcessedFlag = () => {
    dispatch({
      type: ActionTypes.SET_FILE_PROCESSED,
      payload: {
        filename: state.uploadedFile,
        newlyProcessed: false,
        wasProcessed: state.wasProcessed,
        session_id: state.sessionId,
      },
    });
  };

  // Select the model
  const setSelectedModel = (model) => {
    dispatch({
      type: ActionTypes.SET_SELECTED_MODEL,
      payload: model,
    });
  };

  // ADDED: Fetch document metadata by session ID (useful for reloading)
  const fetchDocumentMetadata = async (sessionId) => {
    try {
      const docInfo = await api.getDocumentInfo(sessionId);
      
      if (docInfo) {
        const metadata = {
          fileName: docInfo.filename || docInfo.file_name || 'Unknown',
          fileSize: docInfo.file_size || docInfo.fileSize || 0,
          fileType: docInfo.file_type || docInfo.fileType || 'application/pdf',
          chunkCount: docInfo.chunk_count || docInfo.chunkCount || 0,
          pageCount: docInfo.page_count || docInfo.pageCount || 0,
          fromCache: docInfo.from_cache || docInfo.fromCache || false,
          processingTime: docInfo.processing_time || docInfo.processingTime || 0,
          uploadedAt: docInfo.uploaded_at || docInfo.uploadedAt || new Date().toISOString(),
          sessionId: sessionId,
        };

        dispatch({
          type: ActionTypes.SET_DOCUMENT_METADATA,
          payload: metadata,
        });

        return metadata;
      }
    } catch (error) {
      console.error('Failed to fetch document metadata:', error);
      return null;
    }
  };

  // Context value
  const value = {
    ...state,
    handleFileUpload,
    handleApiKeyUpload,
    removeDocument,
    clearNewlyProcessedFlag,
    setSelectedModel,
    fetchDocumentMetadata, // ADDED: Export the new function
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

// Hook to use the context
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};