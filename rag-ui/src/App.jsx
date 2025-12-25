// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Chat from './components/Chat';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Sidebar from './components/Sidebar';
import { FileProvider } from './context/FileContext';
import './App.css';

function App() {
  return (
    <FileProvider>
      <Router>
        <div className="flex h-screen bg-purple-950 text-white">
          <Sidebar />
          <MainContent />
        </div>
      </Router>
    </FileProvider>
  );
}

function MainContent() {
  return (
    <div className="flex-1 overflow-y-auto">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/features" element={<Features />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </div>
  );
}

export default App;
