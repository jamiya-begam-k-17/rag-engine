// src/pages/HelpFaq.js
import { useState } from "react";
import Card from "../components/Card";

const faqs = [
    {
        q: "Do I need to upload a document before chatting?",
        a: "No. The assistant supports a global mode that uses the default multi-domain corpus. When you select or upload a specific document, answers become more tightly grounded to that document.",
    },
    {
        q: "What types of documents are preloaded?",
        a: "The backend includes corpora from AI, biotech, climate science, quantum computing, space exploration, sustainable energy, plus additional sample documents provided by ReadyTensor.",
    },
    {
        q: "How is my conversation stored?",
        a: "Chat turns are stored in a lightweight SQLite database on the backend. This allows the assistant to maintain context within a session while keeping the system simple and portable.",
    },
    {
        q: "Which models can I choose?",
        a: "From the UI you can select Groq, OpenAI, or Gemini. The backend maps these options to specific model IDs and routes calls to the appropriate provider.",
    },
];

export default function HelpFaq() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <Card title="How to use the assistant" badge="Quick guide">
                <ol className="list-decimal list-inside text-sm text-slate-200 space-y-1.5">
                    <li>
                        Go to the <span className="font-semibold">Chat</span> page from the
                        left sidebar.
                    </li>
                    <li>
                        Optionally upload one or more PDFs using{" "}
                        <span className="font-semibold">Add Doc</span>. They will appear in{" "}
                        <span className="font-semibold">My docs</span>.
                    </li>
                    <li>
                        Click a document in the list to focus the assistant on that file.
                        The center column will show a preview placeholder.
                    </li>
                    <li>
                        Type your question in the chat bar. Answers are generated using the
                        selected model (Groq/OpenAI/Gemini) and, when available, the most
                        relevant chunks from your docs.
                    </li>
                    <li>
                        Switch to <span className="font-semibold">Features</span> to see
                        architecture details, or <span className="font-semibold">About</span>{" "}
                        to view team information.
                    </li>
                </ol>
            </Card>

            <Card title="FAQ" badge="Common questions">
                <div className="space-y-2">
                    {faqs.map((f, idx) => {
                        const open = openIndex === idx;
                        return (
                            <div
                                key={f.q}
                                className="rounded-lg border border-purple-900/70 bg-[#06001a]"
                            >
                                <button
                                    className="w-full flex justify-between items-center px-3 py-2 text-xs md:text-sm"
                                    onClick={() => setOpenIndex(open ? -1 : idx)}
                                >
                                    <span className="text-slate-100 text-left">{f.q}</span>
                                    <span className="text-xs text-slate-400">
                                        {open ? "−" : "+"}
                                    </span>
                                </button>
                                {open && (
                                    <div className="px-3 pb-3 text-[13px] text-slate-200">
                                        {f.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
