// src/pages/Features.js
import Card from "../components/Card";

export default function Features() {
    const features = [
        {
            title: "Intelligent Context Modes",
            desc: "Seamlessly ask document-specific questions. When you select a PDF, responses become precisely grounded in your uploaded content.",
        },
        {
            title: "Persistent Conversation Memory (Present in Streamlit Version)",
            desc: "SQLite-backed session management ensures your conversations maintain coherent context across multiple queries, enabling natural follow-up questions.",
        },
        {
            title: "Advanced Vector Retrieval",
            desc: "Documents are intelligently chunked and embedded into a high-performance vector store using semantic embeddings, retrieving the most relevant context for each query.",
        },
        {
            title: "Multi-Model LLM Support (Present in Streamlit Version)",
            desc: "Choose from industry-leading AI providers: Groq (ultra-fast), OpenAI (GPT-4 class), and Google Gemini. Switch models on-the-fly to match your needs.",
        },
        {
            title: "Citation-Backed Responses (Present in Streamlit Version)",
            desc: "Every answer includes source attribution with exact document snippets, allowing you to verify claims and understand the reasoning behind each response.",
        },
    ];

    const deploymentFeatures = [
        {
            title: "Web Version (Current)",
            features: [
                "Cloud-deployed on Render's free tier for universal access",
                "No installation required—use from any device with a browser",
                "API keys stored securely in backend database",
                "Session-based document processing",
            ],
            limitations: [
                "25MB file size limit per upload",
                "Single document per session (reupload to switch)",
                "API keys persist in database for 15 mins if no activity, or resets at reload",
                "Limited embedding models and chunk sizes",
                "No control over vector database persistence",
                "Limited smart caching"
                ,
            ]
        },
        {
            title: "Local Streamlit Version",
            features: [
                "Run entirely on your machine—complete data privacy",
                "API keys loaded from .env file (never stored in database)",
                "Support for larger documents (up to 100 pages)",
                "Customizable embedding models and chunk sizes",
                "Full control over vector database persistence",
            ],
            benefits: [
                "Zero cloud dependency for sensitive documents",
                "Faster processing with local hardware",
                "Extended configuration options",
            ]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card title="Retrieval-Augmented Generation (RAG) System" badge="Architecture Overview">
                <p className="text-sm text-slate-200 leading-relaxed">
                    This assistant implements a demo of near production-grade RAG architecture that combines
                    the reasoning capabilities of Large Language Models with the precision of
                    semantic search. Unlike pure LLM chatbots that rely solely on training data,
                    our system retrieves relevant context from your documents in real-time,
                    ensuring responses are grounded in your actual content.
                </p>
                <p className="text-sm text-slate-200 mt-3 leading-relaxed">
                    The backend orchestrates document indexing, vector search, and context
                    injection—while the frontend provides an intuitive interface for document
                    management, multi-model selection, and transparent source attribution.
                </p>
            </Card>

            <Card title="Core Capabilities" badge="Features">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((f) => (
                        <div 
                            key={f.title}
                            className="rounded-lg border border-purple-900/50 bg-[#0a0020] p-4 hover:border-purple-700/70 transition-colors"
                        >
                            <h3 className="text-sm font-semibold text-indigo-200 mb-2">
                                {f.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Deployment Options" badge="Web vs Local">
                <div className="grid gap-4 md:grid-cols-2">
                    {deploymentFeatures.map((deployment) => (
                        <div 
                            key={deployment.title}
                            className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/40 p-5"
                        >
                            <h3 className="text-base font-bold text-indigo-100 mb-3">
                                {deployment.title}
                            </h3>
                            
                            {deployment.features && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-green-300 mb-1.5">
                                        ✓ Features:
                                    </p>
                                    <ul className="text-xs text-slate-300 space-y-1">
                                        {deployment.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-green-400 mr-1.5 mt-0.5">•</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {deployment.benefits && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-blue-300 mb-1.5">
                                        Benefits:
                                    </p>
                                    <ul className="text-xs text-slate-300 space-y-1">
                                        {deployment.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-blue-400 mr-1.5 mt-0.5">•</span>
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {deployment.limitations && (
                                <div>
                                    <p className="text-xs font-semibold text-amber-300 mb-1.5">
                                        Limitations:
                                    </p>
                                    <ul className="text-xs text-slate-300 space-y-1">
                                        {deployment.limitations.map((limitation, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-amber-400 mr-1.5 mt-0.5">•</span>
                                                <span>{limitation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-blue-950/30 border border-blue-800/40">
                    <p className="text-xs text-blue-200">
                        <span className="font-semibold">Security Note:</span> Your API keys
                        are stored in the backend database. They are never
                        exposed in the frontend or transmitted over unencrypted channels. For
                        maximum privacy with sensitive documents, we recommend using the local
                        Streamlit version where all data stays on your machine.
                    </p>
                </div>
            </Card>

            <Card title="How It Works" badge="RAG Pipeline">
                <ol className="text-sm text-slate-200 space-y-3">
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                            1
                        </span>
                        <div>
                            <span className="font-semibold text-indigo-200">Document Upload:</span>
                            <span className="text-slate-300"> You upload a PDF or TXT file through the interface.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                            2
                        </span>
                        <div>
                            <span className="font-semibold text-indigo-200">Smart Chunking:</span>
                            <span className="text-slate-300"> The backend splits the document into semantic chunks (~1500 characters) with overlap for context preservation.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                            3
                        </span>
                        <div>
                            <span className="font-semibold text-indigo-200">Vector Embedding:</span>
                            <span className="text-slate-300"> Each chunk is converted into a high-dimensional vector using Sentence Transformers and stored in ChromaDB.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                            4
                        </span>
                        <div>
                            <span className="font-semibold text-indigo-200">Query Processing:</span>
                            <span className="text-slate-300"> When you ask a question, the system retrieves the top-K (3 in our case) most semantically similar chunks.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                            5
                        </span>
                        <div>
                            <span className="font-semibold text-indigo-200">Context Injection:</span>
                            <span className="text-slate-300"> Retrieved chunks are injected into the LLM prompt as context, constraining responses to your document.</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                            6
                        </span>
                        <div>
                            <span className="font-semibold text-indigo-200">Cited Response:</span>
                            <span className="text-slate-300"> The LLM generates a grounded answer based totally on your uploaded documents.</span>
                        </div>
                    </li>
                </ol>
            </Card>
        </div>
    );
}