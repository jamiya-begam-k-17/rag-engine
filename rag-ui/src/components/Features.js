// src/components/Features.js
import React, { useState } from 'react';

const Features = () => {
  const [activeTab, setActiveTab] = useState('ingestion');

  return (
    <div className="p-8 bg-purple-950 bg-opacity-50">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">⚡ System Capabilities</h1>
      
      <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-4 mb-6">
        <p className="flex items-center text-purple-200">
          <span className="mr-2">ℹ️</span>
          This module demonstrates the technical architecture.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-purple-700">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'ingestion'
                ? 'text-white border-b-2 border-purple-500 bg-purple-800 bg-opacity-30'
                : 'text-purple-300 hover:text-white hover:bg-purple-800 hover:bg-opacity-20'
            }`}
          >
            📥 Ingestion
          </button>
          <button
            onClick={() => setActiveTab('retrieval')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'retrieval'
                ? 'text-white border-b-2 border-purple-500 bg-purple-800 bg-opacity-30'
                : 'text-purple-300 hover:text-white hover:bg-purple-800 hover:bg-opacity-20'
            }`}
          >
            🔍 Retrieval
          </button>
          <button
            onClick={() => setActiveTab('generation')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'generation'
                ? 'text-white border-b-2 border-purple-500 bg-purple-800 bg-opacity-30'
                : 'text-purple-300 hover:text-white hover:bg-purple-800 hover:bg-opacity-20'
            }`}
          >
            ✨ Generation
          </button>
        </div>
      </div>

      <div className="bg-purple-900 bg-opacity-50 rounded-lg p-6 border border-purple-700">
        {activeTab === 'ingestion' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-100">Document Ingestion Pipeline</h2>
            <pre className="bg-purple-950 bg-opacity-50 p-4 rounded overflow-x-auto text-sm text-purple-300">
{`1. Load PDF
2. Clean & Normalize Text
3. Recursive Character Split
4. Generate Embeddings (OpenAI/HuggingFace)
5. Upsert to Vector Store (Pinecone/Chroma)`}
            </pre>
          </div>
        )}
        
        {activeTab === 'retrieval' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-100">Retrieval Strategy</h2>
            <ul className="space-y-2 text-purple-300">
              <li className="flex items-center">
                <span className="mr-2 text-purple-400">•</span>
                <span><strong>Hybrid Search</strong>: Keyword + Semantic</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-purple-400">•</span>
                <span><strong>Re-ranking</strong>: Cross-Encoder implementation</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-purple-400">•</span>
                <span><strong>Context Window</strong>: 4096 tokens</span>
              </li>
            </ul>
          </div>
        )}
        
        {activeTab === 'generation' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-100">LLM Generation</h2>
            <div className="space-y-2">
              <div className="bg-purple-800 bg-opacity-30 border border-purple-600 rounded p-3">
                <span className="font-medium text-purple-200">Model:</span> <span className="text-purple-300">GPT-4o / Claude 3.5 Sonnet</span>
              </div>
              <div className="bg-purple-800 bg-opacity-30 border border-purple-600 rounded p-3">
                <span className="font-medium text-purple-200">Temperature:</span> <span className="text-purple-300">0.3 (Strict Factual)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;