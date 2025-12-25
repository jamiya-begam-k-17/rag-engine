// src/components/FAQ.js
import React, { useState } from 'react';

const FAQ = () => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqs = [
    {
      question: "🤖 How does the RAG Engine work?",
      answer: "The RAG (Retrieval-Augmented Generation) Engine processes your documents in three steps: 1) It breaks down your document into smaller chunks, 2) It creates vector embeddings of these chunks for semantic search, and 3) When you ask a question, it retrieves relevant chunks and generates an answer based on that context."
    },
    {
      question: "🔐 Is my data secure?",
      answer: "Yes, all processing happens in ephemeral memory. We do not store your documents permanently on our servers. Your documents are processed locally and the resulting embeddings are stored in a secure vector database. You can remove your document at any time, which deletes all associated data."
    },
    {
      question: "📄 What document formats are supported?",
      answer: "Currently, we support PDF and TXT files. We're working on adding support for additional formats like DOCX, HTML, and Markdown. Each document can be up to 50MB in size, which is approximately 100 pages of text."
    },
    {
      question: "🧠 What models can I use?",
      answer: "We support Google Gemini models (gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-flash, gemini-1.5-pro) and Groq models (llama-3.1-8b-instant, llama-3.3-70b-versatile). Each model has different strengths - Gemini models are great for complex reasoning, while Groq models offer faster response times."
    },
    {
      question: "🎯 How accurate are the answers?",
      answer: "The accuracy depends on several factors: the quality of your document, the specificity of your question, and the model you choose. Our system retrieves the top 5 most relevant chunks for each question, which provides comprehensive context. For best results, ask specific questions about content that exists in your documents."
    },
    {
      question: "🔄 What happens when I upload the same document twice?",
      answer: "Our system uses content hashing to detect duplicate uploads. If you upload the same document again, it won't be reprocessed. Instead, the system will reuse the previously processed chunks and embeddings, saving time and resources. The status will show 'Loaded from Cache' for such documents."
    },
    {
      question: "💾 Can I export my chat history?",
      answer: "Currently, chat history is stored in your session and is available as long as your session is active. We're working on adding export functionality that will allow you to download your conversations in various formats."
    },
    {
      question: "🌐 Does this work offline?",
      answer: "The document processing and vector storage happen on the server side, so an internet connection is required for uploading documents and chatting. However, once a document is processed, the system is optimized for fast responses to minimize latency."
    }
  ];

  return (
    <div className="p-8 bg-purple-950 bg-opacity-50">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">❓ Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-purple-900 bg-opacity-50 rounded-lg overflow-hidden border border-purple-700">
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-purple-800 hover:bg-opacity-30 transition-colors"
            >
              <span className="font-medium text-purple-100">{faq.question}</span>
              <span className="text-purple-400 text-xl">
                {expandedItems[index] ? '−' : '+'}
              </span>
            </button>
            
            {expandedItems[index] && (
              <div className="px-6 py-4 border-t border-purple-700 text-purple-300 bg-purple-800 bg-opacity-20">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;