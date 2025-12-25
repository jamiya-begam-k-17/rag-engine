import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB in bytes

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    uploadedFile,
    fileProcessed,
    isProcessing,
    uploaderKey,
    handleFileUpload,
    handleApiKeyUpload,
    removeDocument,
    error,
    backendConnected,
    apiKeyStored,
    selectedModel,
    setSelectedModel,
    documentMetadata // Assuming this exists in context with chunk count, cache status, etc.
  } = useFileContext();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Function to check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const validateFile = (file) => {
    if (!file) return false;
    
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.txt')) {
      setUploadError('Please upload a PDF or TXT file only.');
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size must be less than 200MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    
    setUploadError('');
    return true;
  };

  const processFileUpload = useCallback(async (file) => {
    if (!validateFile(file)) return;
    
    const result = await handleFileUpload(file);
    
    if (result && result.status === 'success') {
      navigate('/chat');
    }
  }, [handleFileUpload, navigate]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      setApiKeyError('API key cannot be empty');
      return;
    }
    
    if (!selectedModel) {
      setApiKeyError('Please select a model first');
      return;
    }
    
    const success = await handleApiKeyUpload(apiKey, selectedModel);
    if (success) {
      setApiKeyError('');
      setShowApiKeyInput(false);
      setApiKey('');
    } else {
      setApiKeyError('Failed to store API key. Please check your key and try again.');
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFileUpload(files[0]);
    }
  }, [processFileUpload]);

  // Update the error state when the context error changes
  useEffect(() => {
    if (error) {
      setUploadError(error);
    } else {
      setUploadError('');
    }
  }, [error]);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Helper function to get model display name
  const getModelDisplayName = (modelId) => {
    const modelNames = {
      // 'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
      // 'gemini-1.5-flash': 'Gemini 1.5 Flash',
      // 'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'llama-3.1-8b-instant': 'Llama 3.1 8B Instant',
      'llama-3.3-70b-versatile': 'Llama 3.3 70B Versatile'
    };
    return modelNames[modelId] || modelId;
  };

  return (
    <div className="w-64 bg-gradient-to-b from-purple-950 to-purple-900 border-r border-purple-800 shadow-2xl flex flex-col h-screen">
      <div className="p-4 border-b border-purple-800 bg-purple-900 bg-opacity-50">
        <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
          🤖 RAG Engine
        </h2>
        <p className="text-xs text-purple-400 font-medium">v1.0 • Agentic AI Edition</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Navigation Menu */}
        <div>
          <h3 className="text-xs font-bold mb-3 text-purple-300 uppercase tracking-wider">Navigation</h3>
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-900/50 border-l-4 border-purple-300' 
                    : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">🏠</span>
                <span className="text-sm font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/chat" 
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive('/chat') 
                    ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-900/50 border-l-4 border-purple-300' 
                    : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">💬</span>
                <span className="text-sm font-medium">Chat Assistant</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/features" 
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive('/features') 
                    ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-900/50 border-l-4 border-purple-300' 
                    : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">⚡</span>
                <span className="text-sm font-medium">Features</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/faq" 
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive('/faq') 
                    ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg shadow-purple-900/50 border-l-4 border-purple-300' 
                    : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">❓</span>
                <span className="text-sm font-medium">Help & FAQ</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-purple-800"></div>
        
        {/* Model Selection Section */}
        <div>
          <h3 className="text-xs font-bold mb-3 text-purple-300 uppercase tracking-wider flex items-center">
            <span className="mr-2">🤖</span>
            Model Selection
            <span className="ml-auto text-red-400 text-lg">*</span>
          </h3>
          <div className="bg-purple-900 bg-opacity-40 border border-purple-700 rounded-lg p-3 shadow-inner">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={apiKeyStored} // FIXED: Disable after API key is stored
              className={`w-full p-2.5 bg-purple-950 bg-opacity-60 border border-purple-700 rounded-lg text-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                apiKeyStored ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-purple-500'
              }`}
            >
              <option value="">-- Select a Model --</option>
              {/* <optgroup label="🔷 Google Gemini">
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </optgroup> */}
              <optgroup label="🦙 Groq">
                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
              </optgroup>
            </select>
            {!selectedModel && !apiKeyStored && (
              <div className="mt-2 flex items-start space-x-2 text-xs text-amber-300">
                <span className="text-base">⚠️</span>
                <p>Please select a model before adding API key</p>
              </div>
            )}
            {apiKeyStored && (
              <div className="mt-2 flex items-start space-x-2 text-xs text-purple-300">
                <span className="text-base">🔒</span>
                <p>Model locked with API key configuration</p>
              </div>
            )}
          </div>
        </div>

        {/* API Key Section */}
        <div>
          <h3 className="text-xs font-bold mb-3 text-purple-300 uppercase tracking-wider flex items-center">
            <span className="mr-2">🔑</span>
            API Key
            <span className="ml-auto text-red-400 text-lg">*</span>
          </h3>
          
          {apiKeyStored ? (
            <div className="bg-gradient-to-br from-emerald-900 to-green-900 bg-opacity-40 border border-green-600 rounded-lg p-3 shadow-lg">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">✓</span>
                <span className="font-semibold text-sm text-green-100">API Key Configured</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center text-green-200">
                  <span className="mr-2">🤖</span>
                  <span className="font-medium">Model:</span>
                  <span className="ml-auto text-green-100 font-semibold">{getModelDisplayName(selectedModel)}</span>
                </div>
                <div className="flex items-center text-green-200">
                  <span className="mr-2">🔐</span>
                  <span className="font-medium">Status:</span>
                  <span className="ml-auto text-green-100 font-semibold">Active</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {!showApiKeyInput ? (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  disabled={!selectedModel}
                  className={`w-full p-3 bg-purple-900 bg-opacity-40 border border-purple-700 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedModel 
                      ? 'text-purple-100 hover:bg-purple-800 hover:border-purple-500 hover:shadow-lg cursor-pointer' 
                      : 'text-purple-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg mr-2">🔑</span>
                  Add API Key
                </button>
              ) : (
                <div className="bg-purple-900 bg-opacity-40 border border-purple-700 rounded-lg p-3 shadow-inner">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${selectedModel.includes('gemini') ? 'Google' : 'Groq'} API key`}
                    className="w-full p-2.5 mb-3 bg-purple-950 bg-opacity-60 border border-purple-700 rounded-lg text-purple-100 placeholder-purple-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {apiKeyError && (
                    <div className="mb-3 p-2 bg-red-900 bg-opacity-30 border border-red-700 rounded text-xs text-red-300 flex items-start">
                      <span className="mr-2">⚠️</span>
                      <span>{apiKeyError}</span>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleApiKeySubmit}
                      className="flex-1 text-xs font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 px-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <span className="mr-1">✅</span>
                      Save Key
                    </button>
                    <button
                      onClick={() => {
                        setShowApiKeyInput(false);
                        setApiKeyError('');
                        setApiKey('');
                      }}
                      className="flex-1 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-3 rounded-lg transition-all duration-200"
                    >
                      <span className="mr-1">❌</span>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {!selectedModel && (
                <div className="mt-2 flex items-start space-x-2 text-xs text-amber-300">
                  <span className="text-base">⚠️</span>
                  <p>Select a model first to add API key</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-purple-800"></div>

        {/* Document Upload Section */}
        <div>
          <h3 className="text-xs font-bold mb-3 text-purple-300 uppercase tracking-wider flex items-center">
            <span className="mr-2">📁</span>
            Document Context
          </h3>
          
          {/* Backend Connection Error */}
          {backendConnected === false && (
            <div className="mb-3 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg text-xs shadow-lg">
              <div className="flex items-start space-x-2 text-red-300">
                <span className="text-lg">🔴</span>
                <div>
                  <p className="font-semibold mb-1">Backend Connection Error</p>
                  <p className="text-red-400">Please ensure the backend server is running on port 8000.</p>
                </div>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            key={uploaderKey}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={backendConnected === false || !apiKeyStored}
          />
          
          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-purple-400 bg-purple-500 bg-opacity-20 scale-105 shadow-xl' 
                : 'border-purple-700 hover:border-purple-500 hover:bg-purple-800 hover:bg-opacity-30'
              }
              ${uploadError || error ? 'border-red-500 bg-red-500 bg-opacity-10' : ''}
              ${backendConnected === false || !apiKeyStored ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => backendConnected !== false && apiKeyStored && fileInputRef.current.click()}
            onDragEnter={backendConnected !== false && apiKeyStored ? handleDragEnter : undefined}
            onDragLeave={backendConnected !== false && apiKeyStored ? handleDragLeave : undefined}
            onDragOver={backendConnected !== false && apiKeyStored ? handleDragOver : undefined}
            onDrop={backendConnected !== false && apiKeyStored ? handleDrop : undefined}
          >
            {isDragging ? (
              <div className="space-y-2">
                <div className="text-4xl animate-bounce">📥</div>
                <p className="text-sm font-semibold text-purple-200">Drop your file here</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <p className="text-sm font-semibold text-purple-100">
                  {backendConnected === false ? 'Backend Not Connected' :
                  !apiKeyStored ? 'API Key Required' :
                  uploadedFile ? 'Click to replace file' : 'Click or drag file here'}
                </p>
                <p className="text-xs text-purple-400">
                  {backendConnected === false ? 'Please start the backend server' :
                  !apiKeyStored ? 'Configure API key first' :
                  'PDF or TXT • Max 25MB'}
                </p>
              </div>
            )}
          </div>

          {/* Upload Error Message */}
          {uploadError && (
            <div className="mt-3 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg text-xs shadow-lg">
              <div className="flex items-start space-x-2 text-red-300">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold mb-1">Upload Error</p>
                  <p className="text-red-400">{uploadError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="mt-3 bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-600 rounded-lg p-4 shadow-xl">
              <div className="flex items-center mb-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-300 border-t-transparent mr-3"></div>
                <span className="text-sm font-semibold text-purple-100">Processing Document...</span>
              </div>
              <div className="space-y-2 text-xs text-purple-300">
                <div className="flex items-center space-x-2 animate-pulse">
                  <span className="text-base">📄</span>
                  <span>Parsing document content</span>
                </div>
                <div className="flex items-center space-x-2 animate-pulse" style={{animationDelay: '0.2s'}}>
                  <span className="text-base">🧠</span>
                  <span>Generating embeddings</span>
                </div>
                <div className="flex items-center space-x-2 animate-pulse" style={{animationDelay: '0.4s'}}>
                  <span className="text-base">💾</span>
                  <span>Storing in vector database</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Document Display - FIXED: Professional Deep Purple UI with Details */}
          {uploadedFile && fileProcessed && (
            <div className="mt-3 bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-600 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-purple-950 bg-opacity-50 px-3 py-2 border-b border-purple-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Active Document</span>
                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">Active</span>
                </div>
              </div>
              
              <div className="p-3 space-y-3">
                {/* File Name */}
                <div>
                  <p className="text-xs text-purple-400 font-medium mb-1">📄 File Name</p>
                  <p className="text-sm text-white font-medium truncate bg-purple-950 bg-opacity-40 px-2 py-1.5 rounded border border-purple-800">
                    {uploadedFile}
                  </p>
                </div>

                {/* Document Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-purple-950 bg-opacity-40 px-2 py-2 rounded border border-purple-800">
                    <p className="text-xs text-purple-400 mb-1">📊 Chunks</p>
                    <p className="text-sm text-white font-bold">
                      {documentMetadata?.chunkCount || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-950 bg-opacity-40 px-2 py-2 rounded border border-purple-800">
                    <p className="text-xs text-purple-400 mb-1">📏 Size</p>
                    <p className="text-sm text-white font-bold">
                      {formatFileSize(documentMetadata?.fileSize)}
                    </p>
                  </div>
                  
                  <div className="bg-purple-950 bg-opacity-40 px-2 py-2 rounded border border-purple-800">
                    <p className="text-xs text-purple-400 mb-1">📃 Pages</p>
                    <p className="text-sm text-white font-bold">
                      {documentMetadata?.pageCount || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-950 bg-opacity-40 px-2 py-2 rounded border border-purple-800">
                    <p className="text-xs text-purple-400 mb-1">💾 Cache</p>
                    <p className={`text-sm font-bold ${documentMetadata?.fromCache ? 'text-green-400' : 'text-blue-400'}`}>
                      {documentMetadata?.fromCache ? '✓ Yes' : '✗ New'}
                    </p>
                  </div>
                </div>

                {/* Additional Metadata */}
                {documentMetadata?.uploadedAt && (
                  <div className="bg-purple-950 bg-opacity-40 px-2 py-2 rounded border border-purple-800">
                    <p className="text-xs text-purple-400 mb-1">🕒 Uploaded</p>
                    <p className="text-xs text-white">
                      {new Date(documentMetadata.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Remove Document Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDocument();
                  }}
                  className="w-full text-xs font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <span className="mr-2">🗑️</span>
                  Remove Document
                </button>
              </div>
            </div>
          )}

          {/* No Document State */}
          {!uploadedFile && !isProcessing && !uploadError && !error && (
            <div className="mt-3 p-3 bg-purple-900 bg-opacity-30 border border-purple-800 rounded-lg text-xs text-purple-300">
              <div className="flex items-start space-x-2">
                <span className="text-base">ℹ️</span>
                <p>
                  {backendConnected === false ? 'Start the backend server to upload documents' : 
                   !apiKeyStored ? 'Configure API key to enable document upload' :
                   'Upload a PDF or TXT file to enable RAG-powered chat'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Upload Requirements */}
      <div className="p-4 border-t border-purple-800 bg-purple-950 bg-opacity-50">
        <div className="bg-purple-900 bg-opacity-40 border border-purple-800 rounded-lg p-3">
          <p className="text-xs font-bold text-purple-200 mb-2 flex items-center">
            <span className="mr-2">📋</span>
            Upload Requirements
          </p>
          <ul className="space-y-1 text-xs text-purple-300">
            <li className="flex items-center">
              <span className="mr-2 text-purple-500">•</span>
              <span><strong>Format:</strong> PDF or TXT only</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-500">•</span>
              <span><strong>Max size:</strong> 25MB</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-500">•</span>
              <span><strong>Max pages:</strong> 100</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-purple-500">•</span>
              <span><strong>Processing:</strong> Local & Secure</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;