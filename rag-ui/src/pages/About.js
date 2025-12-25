// src/pages/About.js
import Card from "../components/Card";

export default function About() {
    const team = [
        {
            name: "Jamiya",
            role: "Frontend + API Integration + Documentation",
            desc: "Designed and implemented the React + Tailwind interface, FastAPI integration points, and UI-focused documentation.",
        },
        {
            name: "Adarsh",
            role: "Backend & Database",
            desc: "Implemented FastAPI backend, SQLite chat storage, and RAG pipeline integration with vector database.",
        },
        {
            name: "Victor",
            role: "Data & Evaluation",
            desc: "Handled dataset collection/cleaning, retrieval evaluation, and performance tuning.",
        },
        {
            name: "Natalie",
            role: "RAG Core & Testing",
            desc: "Worked on retriever/embeddings, prompt design, and end-to-end testing.",
        },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            <Card title="About the project" badge="Team & context">
                <p className="text-sm text-slate-200">
                    This project is a domain-aware Retrieval-Augmented Generation (RAG)
                    assistant built as part of a ReadyTensor challenge. The goal is to
                    provide grounded answers across multiple technical domains while
                    keeping the system lightweight and developer-friendly.
                </p>
                <p className="text-sm text-slate-200 mt-3">
                    The frontend is built with React and TailwindCSS, focusing on a clean
                    card-based layout and intuitive document workflow. The backend uses
                    FastAPI, SQLite for conversation memory, and a vector database for
                    document retrieval.
                </p>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
                {team.map((member) => (
                    <Card key={member.name} title={member.name} badge={member.role}>
                        <p className="text-xs text-slate-200">{member.desc}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}


// export default function About() {
//     const devs = [
//         {
//             name: "Your Name",
//             role: "Frontend & UX",
//             desc: "Built the React + Tailwind UI, chat experience, and overall interaction flow.",
//         },
//         {
//             name: "Teammate 1",
//             role: "Backend & RAG Pipeline",
//             desc: "Implemented FastAPI endpoints, document ingestion, vector search and model integration.",
//         },
//         {
//             name: "Teammate 2",
//             role: "Infra & Deployment",
//             desc: "Handled deployment, hosting, and environment configuration.",
//         },
//     ];

//     return (
//         <div className="h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 overflow-y-auto">
//             <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
//                 <div>
//                     <h2 className="text-2xl font-semibold text-indigo-100 mb-2">
//                         About the Project
//                     </h2>
//                     <p className="text-sm text-slate-300">
//                         RAG Assistant AI is a retrieval-augmented chatbot built to answer
//                         questions based on your private knowledge base. It combines FastAPI,
//                         a vector database on SQLite, and a modern React + Tailwind UI.
//                     </p>
//                 </div>

//                 <div>
//                     <h3 className="text-sm font-semibold text-indigo-100 mb-2">
//                         Team
//                     </h3>
//                     <div className="grid gap-4 md:grid-cols-3">
//                         {devs.map((dev) => (
//                             <div
//                                 key={dev.name}
//                                 className="
//                   rounded-2xl border border-indigo-500/30
//                   bg-black/30 backdrop-blur-xl p-4
//                 "
//                             >
//                                 <h4 className="text-sm font-semibold text-indigo-50">
//                                     {dev.name}
//                                 </h4>
//                                 <p className="text-[11px] text-indigo-300 mb-1">{dev.role}</p>
//                                 <p className="text-xs text-slate-300">{dev.desc}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div>
//                     <h3 className="text-sm font-semibold text-indigo-100 mb-2">
//                         Tech Stack
//                     </h3>
//                     <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
//                         <li>React + TailwindCSS for the frontend UI.</li>
//                         <li>FastAPI backend with SQLite for quick prototyping.</li>
//                         <li>Vector embeddings + RAG pipeline (can integrate any model).</li>
//                         <li>Deployed frontend on [Netlify/Vercel] and backend on [Railway/Render/etc.].</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// }
