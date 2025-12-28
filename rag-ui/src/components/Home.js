// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-8 bg-purple-950 bg-opacity-50">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-12 rounded-xl border border-purple-700 text-center mb-8 shadow-xl">
        <h1 className="text-5xl font-bold mb-4">
          RAG <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Engine</span>
        </h1>
        <p className="text-xl text-purple-200 mt-4">
          The Intelligent Document Assistant. Upload. Analyze. Chat.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <Link to="/chat" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-lg text-lg font-medium transition-all transform hover:scale-105">
          Start New Session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-900 bg-opacity-50 p-6 rounded-lg border border-purple-700 hover:border-purple-500 transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-purple-100">Semantic Search</h3>
          <p className="text-purple-300">
            Understand the meaning behind your queries, not just keyword matching.
          </p>
        </div>
        
        <div className="bg-purple-900 bg-opacity-50 p-6 rounded-lg border border-purple-700 hover:border-purple-500 transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-purple-100">Real-time RAG</h3>
          <p className="text-purple-300">
            Instant context retrieval from your uploaded PDF documents.
          </p>
        </div>
        
        <div className="bg-purple-900 bg-opacity-50 p-6 rounded-lg border border-purple-700 hover:border-purple-500 transition-all hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-purple-100">Secure Core</h3>
          <p className="text-purple-300">
            Local-first processing, ensures your data stays private and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;