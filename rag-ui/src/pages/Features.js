// src/pages/Features.js
import Card from "../components/Card";

export default function Features() {
    const features = [
        {
            title: "RAG over multi-domain corpora",
            desc: "Pre-indexed datasets from AI, biotech, climate science, quantum computing, space exploration, sustainable energy, and sample docs.",
        },
        {
            title: "Hybrid chat modes",
            desc: "Global mode without documents, and doc-aware mode when a specific PDF or domain is selected.",
        },
        {
            title: "Session-aware context",
            desc: "Backend stores chat turns in SQLite so conversations can stay coherent across multiple questions.",
        },
        {
            title: "Vector search retrieval",
            desc: "Documents are chunked and embedded into a vector store (e.g., Chroma). Queries retrieve top-K relevant chunks for the LLM.",
        },
        {
            title: "Configurable LLM provider",
            desc: "Supports Groq, OpenAI, and Gemini. The model selector in the UI maps to backend configuration.",
        },
        {
            title: "Explainable responses",
            desc: "Answers can be enriched with cited snippets and metadata so users know why the model responded a certain way.",
        },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            <Card title="What this RAG assistant does" badge="Feature overview">
                <p className="text-sm text-slate-200">
                    This assistant is built as a Retrieval-Augmented Generation (RAG)
                    system. Instead of answering only from the model’s training data, it
                    queries a curated set of documents and uses those results as context
                    for each answer.
                </p>
                <p className="text-sm text-slate-200 mt-3">
                    The backend handles indexing, retrieval and generation. The frontend
                    you are viewing focuses on clean UX, multi-document management, and
                    clear separation between global and document-grounded answers.
                </p>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
                {features.map((f) => (
                    <Card key={f.title} title={f.title}>
                        <p className="text-xs text-slate-200">{f.desc}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}


// export default function Features() {
//     const cards = [
//         {
//             title: "RAG-powered Answers",
//             desc: "Ask natural language questions and get answers grounded strictly in your uploaded knowledge base.",
//             tag: "Retrieval Augmented Generation",
//         },
//         {
//             title: "Multi-document Search",
//             desc: "Combine PDFs, text files, FAQs and more. The assistant searches across all of them instantly.",
//             tag: "Vector Search",
//         },
//         {
//             title: "Source-aware Replies",
//             desc: "Every answer can be linked back to its original document snippets so users can verify the context.",
//             tag: "Citations",
//         },
//         {
//             title: "Developer Friendly API",
//             desc: "Backend built with FastAPI + SQLite so it’s easy to modify, extend, or plug into other systems.",
//             tag: "FastAPI Backend",
//         },
//         {
//             title: "Privacy First",
//             desc: "Your documents stay on your backend. The model only sees chunks needed to answer the current query.",
//             tag: "On-your-server",
//         },
//         {
//             title: "Simple UX",
//             desc: "ChatGPT-style interface so users don’t need training. Just type a question and press send.",
//             tag: "Clean UI",
//         },
//     ];

//     return (
//         <div className="h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 overflow-y-auto">
//             <div className="max-w-5xl mx-auto px-4 py-6">
//                 <h2 className="text-2xl font-semibold text-indigo-100 mb-2">
//                     Features & Usage
//                 </h2>
//                 <p className="text-sm text-slate-300 mb-6 max-w-xl">
//                     This RAG Assistant is designed to sit on top of your private
//                     documents and provide trustworthy, citation-backed answers.
//                 </p>

//                 <div className="grid gap-4 md:grid-cols-2">
//                     {cards.map((card) => (
//                         <div
//                             key={card.title}
//                             className="
//                 rounded-2xl border border-indigo-500/30
//                 bg-black/30 backdrop-blur-xl p-4
//                 shadow-[0_0_24px_rgba(56,189,248,0.15)]
//               "
//                         >
//                             <div className="text-[11px] uppercase tracking-wide text-indigo-300/80 mb-1">
//                                 {card.tag}
//                             </div>
//                             <h3 className="text-sm font-semibold text-indigo-50 mb-1">
//                                 {card.title}
//                             </h3>
//                             <p className="text-xs text-slate-300">{card.desc}</p>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="mt-8">
//                     <h3 className="text-sm font-semibold text-indigo-100 mb-2">
//                         How to use the assistant
//                     </h3>
//                     <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
//                         <li>Upload documents to the backend (admin/dev side).</li>
//                         <li>Backend chunks + embeds documents into a vector store.</li>
//                         <li>User opens the Chat page and asks a question.</li>
//                         <li>
//                             Backend retrieves top-k relevant chunks and sends them to the
//                             model.
//                         </li>
//                         <li>
//                             Model generates an answer, grounded in those chunks, and sends it
//                             back to the UI.
//                         </li>
//                         <li>User sees the answer in the chat with optional citations.</li>
//                     </ol>
//                 </div>
//             </div>
//         </div>
//     );
// }
