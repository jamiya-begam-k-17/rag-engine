// src/pages/HelpFaq.js
import { useState } from "react";
import Card from "../components/Card";

const faqs = [
    {
        q: "Do I need to configure an API key before using the assistant?",
        a: "Yes. On first use, you'll be prompted to enter an API key for your chosen LLM provider (Groq, OpenAI, or Google Gemini). Your key is stored securely in the backend database—never exposed in the frontend. For Groq's free tier, we recommend their llama-3.1-8b-instant model for optimal performance.",
    },
    {
        q: "What's the difference between this web version and the local Streamlit deployment?",
        a: "The web version (deployed on Render) offers universal access without installation but has a 25MB file limit and single-document-per-session constraint due to free-tier hosting. The local Streamlit version runs entirely on your machine, supports documents up to 100 pages, allows saved multi-document sessions, loads API keys from .env (not database), and provides full data privacy—ideal for sensitive documents. Both share the same RAG backend architecture.",
    },
    {
        q: "Is my uploaded document data secure?",
        a: "Absolutely. In the web version, documents are processed server-side but never permanently stored—they're deleted after chunking and embedding. Only vector embeddings remain in ChromaDB. For maximum privacy, use the local Streamlit version where all processing happens on your machine and nothing leaves your computer.",
    },
    {
        q: "What types of documents and knowledge domains are supported?",
        a: "You can upload PDF (up to 100 pages locally, 25MB and 100 pages on web) and TXT files.",
    },
    {
        q: "How does conversation memory work across multiple questions?",
        a: "Each session is assigned a unique ID, and all chat turns (both user questions and assistant responses) are stored in a SQLite database. This allows the system to maintain context throughout your conversation, enabling natural follow-up questions like 'Can you elaborate on that?' or 'What about the second point?'",
    },
    {
        q: "What happens if my document is already uploaded in a previous session?",
        a: "The system uses content-based deduplication via SHA256 hashing. If you upload an identical file, the backend detects this and reuses the existing embeddings from ChromaDB instead of reprocessing—dramatically reducing wait time. You'll see a 'Loaded from Cache' indicator in the UI (This is present when using streamlit). This smart caching works across all sessions.",
    },
    {
        q: "How do I switch between documents in the same session?",
        a: "In the web version, you can only work with one document at a time—click 'Remove Document' in the sidebar to upload a new one (your chat history will reset).",
    },
    {
        q: "What if my PDF has scanned images or is password-protected?",
        a: "The system requires text-selectable PDFs—scanned documents or image-based PDFs won't work without OCR preprocessing. Password-protected or encrypted PDFs are also not supported. If you encounter these issues, try converting your PDF to a text-selectable format or removing password protection before uploading.",
    },
    {
        q: "How accurate are the responses compared to the original document?",
        a: "RAG systems are highly faithful to source material because they inject actual document chunks into the LLM context window—unlike pure LLMs that rely on training data. However, accuracy depends on: (1) Retrieval quality—whether the right chunks are found; (2) Chunk granularity—our default 1500-character chunks balance context and precision; (3) LLM interpretation—the model must correctly synthesize the retrieved information.",
    },
];

const usageSteps = [
    {
        step: 1,
        title: "Configure API Key",
        desc: "On first launch, enter your API key for Groq, OpenAI, or Gemini in the settings modal. Choose your preferred model (e.g., llama-3.1-8b-instant for Groq).",
    },
        {
        step: 2,
        title: "Upload Document",
        desc: "Use the 'Upload PDF or TXT' button in the sidebar to add your own document. Watch the progress as it's chunked, embedded, and indexed.",
    },
    {
        step: 3,
        title: "Navigate to Chat",
        desc: "Click 'Chat Assistant' in the sidebar. You can start chatting with your digitalized document. It's mandatory to upload a document before starting a conversation.",
    },
    {
        step: 4,
        title: "Ask Questions",
        desc: "Type your question in the chat input. The system retrieves relevant chunks and generates a grounded response.",
    },
    {
        step: 5,
        title: "Explore Features",
        desc: "Visit 'Features' to understand the RAG architecture, or check 'About' for team and project information.",
    }
];

export default function HelpFaq() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <Card title="Getting Started Guide" badge="Quick Start">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {usageSteps.map((item) => (
                        <div 
                            key={item.step}
                            className="rounded-lg border border-purple-900/50 bg-[#0a0020] p-4 hover:border-purple-700/70 transition-all hover:shadow-lg hover:shadow-purple-900/20"
                        >
                            <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">{item.icon}</span>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
                                    {item.step}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-indigo-200 mb-1.5">
                                {item.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Frequently Asked Questions" badge="Common Questions">
                <div className="space-y-2">
                    {faqs.map((f, idx) => {
                        const open = openIndex === idx;
                        return (
                            <div
                                key={f.q}
                                className="rounded-lg border border-purple-900/70 bg-[#06001a] hover:border-purple-700/90 transition-colors"
                            >
                                <button
                                    className="w-full flex justify-between items-center px-4 py-3 text-xs md:text-sm group"
                                    onClick={() => setOpenIndex(open ? -1 : idx)}
                                >
                                    <span className="text-slate-100 text-left font-medium group-hover:text-indigo-200 transition-colors">
                                        {f.q}
                                    </span>
                                    <span className={`text-lg font-bold transition-transform duration-200 ${open ? 'rotate-45 text-indigo-400' : 'text-slate-500'}`}>
                                        +
                                    </span>
                                </button>
                                {open && (
                                    <div className="px-4 pb-4 text-[13px] text-slate-300 leading-relaxed border-t border-purple-900/50 pt-3 mt-1">
                                        {f.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card title="Troubleshooting Tips" badge="Common Issues">
                <div className="space-y-3">
                    <div className="rounded-lg bg-amber-950/30 border border-amber-800/40 p-3">
                        <p className="text-xs font-semibold text-amber-200 mb-1">
                            "No API key configured" error
                        </p>
                        <p className="text-xs text-slate-300">
                            Make sure you've entered a valid API key in the settings modal before uploading documents or asking questions.
                        </p>
                    </div>
                    <div className="rounded-lg bg-red-950/30 border border-red-800/40 p-3">
                        <p className="text-xs font-semibold text-red-200 mb-1">
                            "PDF contains no extractable text"
                        </p>
                        <p className="text-xs text-slate-300">
                            Your PDF might be scanned or image-based. Use a text-selectable PDF or run OCR preprocessing first.
                        </p>
                    </div>
                    <div className="rounded-lg bg-blue-950/30 border border-blue-800/40 p-3">
                        <p className="text-xs font-semibold text-blue-200 mb-1">
                            Slow response times
                        </p>
                        <p className="text-xs text-slate-300">
                            Free-tier hosting may have cold starts (~30s). For faster inference, consider Groq's models or run the local Streamlit version.
                        </p>
                    </div>
                    <div className="rounded-lg bg-purple-950/30 border border-purple-800/40 p-3">
                        <p className="text-xs font-semibold text-purple-200 mb-1">
                            "Session not found" error
                        </p>
                        <p className="text-xs text-slate-300">
                            Your session may have expired or the database was reset. Re-upload your document to create a new session.
                        </p>
                    </div>
                </div>
            </Card>

            <Card title="Best Practices" badge="Tips">
                <ul className="text-sm text-slate-200 space-y-2">
                    <li className="flex items-start">
                        <span className="text-green-400 mr-2 mt-1">✓</span>
                        <div>
                            <span className="font-semibold text-slate-100">Ask specific questions:</span>
                            <span className="text-slate-300"> Instead of "Tell me about the document," try "What are the three main conclusions about topic?".</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-400 mr-2 mt-1">✓</span>
                        <div>
                            <span className="font-semibold text-slate-100">Verify critical information:</span>
                            <span className="text-slate-300"> Always check the 'View Sources' for important claims, especially for technical or legal documents, Which is present in our streamlit version.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-400 mr-2 mt-1">✓</span>
                        <div>
                            <span className="font-semibold text-slate-100">Use follow-up questions:</span>
                            <span className="text-slate-300"> The session memory allows natural conversation flow — "Can you explain that in simpler terms?" works great.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-400 mr-2 mt-1">✓</span>
                        <div>
                            <span className="font-semibold text-slate-100">Keep documents focused:</span>
                            <span className="text-slate-300"> For best results, upload documents that are topically coherent rather than mixing unrelated content.</span>
                        </div>
                    </li>
                </ul>
            </Card>

            <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 p-5">
                <h3 className="text-base font-bold text-indigo-100 mb-2 flex items-center">
                    Need More Power?
                </h3>
                <p className="text-sm text-slate-300 mb-3">
                    For advanced use cases like smart caching,
                    custom embedding models, or maximum data privacy — clone and run the 
                    <span className="font-semibold text-indigo-300"> local Streamlit version</span>. 
                    It provides the full RAG engine on your machine with extended configuration options.
                </p>
                <p className="text-xs text-slate-400">
                    Clone the repository and follow the README instructions for local setup.
                </p>
            </div>
        </div>
    );
}