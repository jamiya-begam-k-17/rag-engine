import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFileContext } from '../context/FileContext';
import * as api from '../services/api';

const Chat = () => {
  const { 
    uploadedFile, 
    fileProcessed, 
    newlyProcessed, 
    wasProcessed,
    clearNewlyProcessedFlag, 
    sessionId,
    selectedModel,
    apiKey,
    apiKeyStored
  } = useFileContext();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Load messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      const loadMessages = async () => {
        try {
          const messages = await api.getMessages(sessionId);
          setMessages(messages);
        } catch (error) {
          console.error('Failed to load messages:', error);
          setChatError(error.message);
        }
      };
      
      loadMessages();
    }
  }, [sessionId]);
  
  // Welcome message with suggested questions
  const getWelcomeMessage = useCallback(() => ({
    role: 'assistant',
    content: `Hello! I've loaded your document and I'm ready to help. Ask me anything about its contents!`
  }), [uploadedFile]);

  // Show welcome message when a new file is processed
  useEffect(() => {
    if (newlyProcessed && uploadedFile) {
      setMessages([getWelcomeMessage()]);
      clearNewlyProcessedFlag();
    }
  }, [newlyProcessed, uploadedFile, clearNewlyProcessedFlag, getWelcomeMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    // Check if API key is stored
    if (!apiKeyStored) {
      setChatError("API key is required. Please add an API key in the sidebar.");
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userQuestion = input;
    setInput('');
    setIsLoading(true);
    setChatError(null);

    try {
      // Save user message to backend
      await api.sendMessage(sessionId, 'user', userQuestion);

      // Query the document for response
      const response = await api.queryDocument(sessionId, userQuestion, selectedModel, apiKey);
      
      // Get the response text from the response
      const responseText = response.text || response.response || response.answer || "";
      
      // Simulate streaming response
      setIsStreaming(true);
      let currentText = '';
      const words = responseText.split(' ');
      
      words.forEach((word, index) => {
        setTimeout(() => {
          currentText += (index > 0 ? ' ' : '') + word;
          setStreamingText(currentText);
          
          if (index === words.length - 1) {
            const assistantMessage = { role: 'assistant', content: responseText };
            setMessages(prev => [...prev, assistantMessage]);
            
            // Save assistant message to backend
            api.sendMessage(sessionId, 'assistant', responseText)
              .catch(error => console.error('Failed to save assistant message:', error));
            
            setStreamingText('');
            setIsStreaming(false);
            setIsLoading(false);
          }
        }, index * 40);
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatError(error.message);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  if (!fileProcessed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="border-2 border-dashed border-purple-600 rounded-lg p-16 text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">⏳ Waiting for Document</h2>
          <p className="text-purple-300 mb-6">
            Please upload a PDF file in the sidebar to initialize the RAG engine.
          </p>
          <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-sm text-purple-200">
            <p className="font-medium mb-2">📋 Upload Requirements:</p>
            <ul className="space-y-1 text-xs">
              <li>• Format: PDF or TXT only</li>
              <li>• Max size: 25MB</li>
              <li>• Max pages: 100</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!apiKeyStored) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="border-2 border-dashed border-purple-600 rounded-lg p-16 text-center max-w-md">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">API Key Required</h2>
          <p className="text-purple-300 mb-6">
            Please add an API key in the sidebar to start chatting with the RAG engine.
          </p>
          <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-sm text-purple-200">
            <p className="font-medium mb-2">🔑 API Key Requirements:</p>
            <ul className="space-y-1 text-xs">
              <li>• Required for chat functionality</li>
              <li>• Stored securely in .env file</li>
              <li>• Used for all RAG operations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-purple-800 bg-purple-900 bg-opacity-30">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">💬 Chat Interface</h1>
        {uploadedFile && (
          <p className="text-sm text-purple-300 mt-1">
            Chatting with: <span className="text-purple-400 font-medium">{uploadedFile}</span>
            {wasProcessed === false && <span className="ml-2 text-xs bg-purple-800 px-2 py-1 rounded">Duplicate Document</span>}
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-purple-950 bg-opacity-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl px-4 py-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-purple-600 bg-opacity-30 border-l-4 border-purple-400'
                : 'bg-purple-900 bg-opacity-50 border border-purple-700'
            }`}>
              <div className="flex items-start">
                <span className="mr-2 text-xl">{message.role === 'user' ? '👤' : '🤖'}</span>
                <div className="whitespace-pre-wrap text-purple-100">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-purple-900 bg-opacity-50 border border-purple-700">
              <div className="flex items-start">
                <span className="mr-2 text-xl">🤖</span>
                <div className="whitespace-pre-wrap text-purple-100">{streamingText}</div>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !isStreaming && (
          <div className="mb-4 flex justify-start">
            <div className="px-4 py-3 rounded-lg bg-purple-900 bg-opacity-50 border border-purple-700">
              <div className="flex items-center">
                <span className="mr-2 text-xl">🤖</span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300 mr-2"></div>
                <span className="text-purple-200">🔍 Analyzing document nodes...</span>
              </div>
            </div>
          </div>
        )}
        
        {chatError && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-sm text-red-300">
            <span className="font-medium">Error:</span> {chatError}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-purple-800 bg-purple-900 bg-opacity-30">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about your document..."
            className="flex-1 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-l-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-purple-100 placeholder-purple-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-3 rounded-r-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;