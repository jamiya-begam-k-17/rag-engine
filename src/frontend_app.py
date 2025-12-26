import streamlit as st
import time
import sys
from pathlib import Path
from langchain_core.output_parsers import StrOutputParser

# Add parent directory to path to import your backend modules
sys.path.append(str(Path(__file__).parent))

from app import RAGAssistant

# 1. Page Configuration
st.set_page_config(
    page_title="RAG Engine",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Session State Management
def init_session_state():
    """Initialize all session state variables with defaults"""
    defaults = {
        'page': 'Home',
        'uploaded_file_name': None,
        'file_processed': False,
        'messages': [],
        'processing': False,
        'uploader_key': 0,
        'assistant': None,
        'upload_result': None,
        'session_id': None,
        'error_message': None
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

init_session_state()

# 3. Initialize RAGAssistant (only once)
@st.cache_resource
def get_rag_assistant():
    """Initialize RAG Assistant from .env file using _initialize_llm()"""
    try:
        # Create assistant without API key
        assistant = RAGAssistant(require_api_key=False)
        
        # Use the existing _initialize_llm() method to load from .env
        llm = assistant._initialize_llm(require_api_key=False)
        
        if llm:
            # LLM was successfully initialized from .env
            assistant.llm = llm
            assistant.chain = assistant.prompt_template | assistant.llm | StrOutputParser()
            
            # Show success message with model info
            if assistant.current_model:
                st.success(f"✅ Loaded API key from .env: {assistant.current_model}")
            else:
                st.success("✅ API key loaded from .env file")
        else:
            # No API key found in .env
            st.error("""
            ❌ No API key found in .env file!
            
            **Please add your API key to `src/.env`:**
            ```
            # For Groq (Recommended - Free)
            GROQ_API_KEY=your_key_here
            GROQ_MODEL=llama-3.1-8b-instant
            
            # OR for Google Gemini
            GOOGLE_API_KEY=your_key_here
            GOOGLE_MODEL=gemini-2.0-flash-exp
            
            # OR for OpenAI
            OPENAI_API_KEY=your_key_here
            OPENAI_MODEL=gpt-4o-mini
            ```
            
            Then restart Streamlit: `streamlit run frontend_app.py`
            """)
            return None
        
        return assistant
        
    except Exception as e:
        st.error(f"Failed to initialize RAG Assistant: {e}")
        import traceback
        st.code(traceback.format_exc())
        return None

# 4. Helper Functions
def save_uploaded_file(uploaded_file):
    """Save uploaded file to data directory and return filepath"""
    try:
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        file_path = data_dir / uploaded_file.name
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        return str(file_path)
    except Exception as e:
        st.error(f"Error saving file: {e}")
        return None

def stream_text(text):
    """Generator to simulate typing effect for responses"""
    for word in text.split(" "):
        yield word + " "
        time.sleep(0.04)

def change_page(page_name):
    """Navigate to different pages"""
    st.session_state.page = page_name
    st.rerun()

def clear_document():
    """Clear the current document and reset session"""
    st.session_state.uploaded_file_name = None
    st.session_state.file_processed = False
    st.session_state.messages = []
    st.session_state.upload_result = None
    st.session_state.session_id = None
    st.session_state.uploader_key += 1
    st.rerun()

# 5. Custom CSS - Glassmorphism & Consistent UI
st.markdown("""
<style>
    /* Global Styles - Keeping Original Background */
    .stApp {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    /* Global Text Color */
    h1, h2, h3, h4, h5, h6, p, span, div, label {
        color: white !important;
    }
    
    /* Feature Cards - Equal Height & Glassmorphism */
    div[data-testid="column"] > div > div > div {
        height: 100%;
    }
    
    .feature-card {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 30px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        height: 280px; /* Fixed height for consistency */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .feature-card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
    
    .feature-icon {
        font-size: 3.5em;
        margin-bottom: 15px;
    }
    
    .feature-title {
        font-size: 1.4em;
        font-weight: 700;
        margin-bottom: 10px;
        color: white !important;
    }
    
    .feature-desc {
        font-size: 0.95em;
        color: rgba(255, 255, 255, 0.9) !important;
        line-height: 1.5;
    }

    /* Chat Input Styling */
    .stChatInputContainer {
        padding-bottom: 20px;
    }
    
    .stChatInput > div {
        background-color: rgba(0, 0, 0, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        border-radius: 12px;
    }
    
    .stChatInput textarea {
        color: white !important;
    }
    
    .stChatInput textarea::placeholder {
        color: rgba(255, 255, 255, 0.7) !important;
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Button Styling */
    .stButton button {
        background: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        backdrop-filter: blur(5px);
        transition: all 0.3s;
    }
    
    .stButton button:hover {
        background: rgba(255, 255, 255, 0.3) !important;
        border-color: white !important;
        transform: scale(1.02);
    }
    
    /* Active Document Box */
    .active-doc-box {
        background: rgba(100, 255, 100, 0.15);
        border: 1px solid rgba(100, 255, 100, 0.3);
        border-radius: 10px;
        padding: 15px;
        margin-top: 15px;
        backdrop-filter: blur(5px);
    }

    /* Expander Styling */
    .streamlit-expanderHeader {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        border-radius: 8px;
    }
    
    .streamlit-expanderContent {
        background-color: rgba(0, 0, 0, 0.1) !important;
        color: white !important;
        border-radius: 0 0 8px 8px;
    }
</style>
""", unsafe_allow_html=True)

# 6. Sidebar Navigation and File Upload
with st.sidebar:
    st.markdown("### 🤖 RAG Engine")
    st.caption("v2.0 • AI-Powered Edition")
    st.markdown("---")
    
    st.markdown("#### Menu")
    if st.button("🏠 Home", use_container_width=True):
        change_page('Home')
    if st.button("💬 Chat Assistant", use_container_width=True):
        change_page('Chat')
    if st.button("⚡ Features", use_container_width=True):
        change_page('Features')
    if st.button("❓ Help & FAQ", use_container_width=True):
        change_page('FAQ')
    
    st.markdown("---")
    
    # File Upload Section
    if not st.session_state.file_processed:
        st.markdown("#### 📄 Document Context")
        st.info("📋 Limits: PDF (100 pages max) • TXT files", icon="ℹ️")
        uploaded_file = st.file_uploader(
            "Upload PDF or TXT",
            type=['pdf', 'txt'],
            label_visibility="collapsed",
            key=f"file_uploader_{st.session_state.uploader_key}"
        )
        
        if uploaded_file:
            if st.session_state.uploaded_file_name != uploaded_file.name:
                st.session_state.uploaded_file_name = uploaded_file.name
                st.session_state.messages = []
                st.session_state.file_processed = False
                st.session_state.error_message = None
                
                # FIX: Get assistant from cached resource function
                assistant = get_rag_assistant()
                
                if assistant:
                    with st.status("📄 Processing Document...", expanded=True) as status:
                        try:
                            st.write("💾 Saving file...")
                            file_path = save_uploaded_file(uploaded_file)
                            
                            if not file_path:
                                raise Exception("Failed to save uploaded file")
                            
                            st.write("🧠 Generating embeddings...")
                            result = assistant.upload_document(file_path)
                            
                            if not result:
                                raise Exception("Upload returned None")
                            
                            if result.get("status") == "error" or "error" in result:
                                error_msg = result.get("error", "Unknown error occurred")
                                st.session_state.error_message = error_msg
                                status.update(label=f"❌ Error: {error_msg}", state="error", expanded=False)
                                st.session_state.file_processed = False
                            else:
                                st.write("💾 Storing in Vector DB...")
                                st.session_state.upload_result = result
                                st.session_state.session_id = result.get("session_id")
                                st.session_state.file_processed = True
                                st.session_state.assistant = assistant  # Store for later use
                                
                                status.update(label="✅ Ready to Chat!", state="complete", expanded=False)
                                time.sleep(1)
                                st.rerun()
                        
                        except Exception as e:
                            error_msg = str(e)
                            st.session_state.error_message = error_msg
                            status.update(label=f"❌ Error: {error_msg}", state="error", expanded=False)
                            st.session_state.file_processed = False
                else:
                    st.error("Failed to initialize RAG Assistant. Check your .env file.")
    
    else:
        # Show active document with Remove button
        st.markdown("#### ✅ Active Document")
        result = st.session_state.upload_result
        st.markdown(f"""
        <div class="active-doc-box">
            <div style='font-weight:600; font-size:14px; margin-bottom:5px;'>📄 {st.session_state.uploaded_file_name}</div>
            <div style='font-size:12px; opacity:0.8;'>
                🧩 Chunks: {result.get('chunk_count', 'N/A')} <br>
                {'🆕 Processed New' if result.get('was_processed') else '♻️ Loaded from Cache'}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.write("") # Spacer
        if st.button("🗑️ Remove Document", type="secondary", use_container_width=True):
            clear_document()

    if st.session_state.error_message:
        st.error(st.session_state.error_message)
    
    st.markdown("---")

# 7. Main Content Area
if st.session_state.page == 'Home':
    st.markdown("""
    <div style='text-align:center; padding:60px 20px;'>
        <h1 style='font-size:3.5em; margin-bottom:20px; text-shadow: 0 4px 10px rgba(0,0,0,0.2);'>🤖 RAG Engine</h1>
        <p style='font-size:1.4em; opacity:0.9; margin-bottom:40px;'>
            The Intelligent Document Assistant. Upload. Analyze. Chat.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Feature Cards with Consistent Height
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <div class="feature-title">Semantic Understanding</div>
            <div class="feature-desc">Understand the meaning behind your queries, not just keyword matching.</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <div class="feature-title">Lightning Fast</div>
            <div class="feature-desc">Instant context retrieval from your uploaded documents using vector search.</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <div class="feature-title">Privacy First</div>
            <div class="feature-desc">Local processing ensures your data stays private and secure on your machine.</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    c1, c2, c3 = st.columns([1, 1, 1])
    with c2:
        if st.button("🚀 Get Started", use_container_width=True, type="primary"):
            change_page('Chat')

elif st.session_state.page == 'Chat':
    st.title("💬 Chat with Your Documents")
    
    # Block interaction if no file uploaded
    if not st.session_state.file_processed:
        st.warning("⚠️ Please upload a PDF or TXT file in the sidebar to initialize the RAG engine.")
        st.info("💡 Once uploaded, you can ask questions about your document!")
        st.stop()
    
    # CHAT LOGIC
    
    # 1. Display all historical messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            # Render sources if they exist in the history
            if message.get("sources"):
                with st.expander("📚 View Sources"):
                    for i, source in enumerate(message["sources"][:3], 1):
                        st.caption(f"**Chunk {i}:** {source[:200]}...")
    
    # Check if a new user input has been submitted
    if user_input := st.chat_input("Ask me anything about your document...", key="chat_input"):
        # Append user message to history and rerun to display it immediately
        st.session_state.messages.append({"role": "user", "content": user_input})
        st.rerun()

    # If the last message was from the user, get the assistant's response
    if st.session_state.messages and st.session_state.messages[-1]["role"] == "user":
        user_message = st.session_state.messages[-1]
        
        with st.chat_message("assistant"):
            with st.spinner("🤖 Getting your answer and related chunks..."):
                # FIX: Get assistant from session_state (now properly initialized) or cache
                assistant = st.session_state.assistant or get_rag_assistant()
                
                if assistant:
                    try:
                        if not st.session_state.session_id:
                            st.error("No active session found. Please re-upload the document.")
                            st.stop()

                        response = assistant.query(user_message["content"], session_id=st.session_state.session_id, n_results=3)
                        
                        if "answer" in response:
                            # Stream response
                            response_placeholder = st.empty()
                            full_response = ""
                            for chunk in stream_text(response["answer"]):
                                full_response += chunk
                                response_placeholder.markdown(full_response + "▌")
                            response_placeholder.markdown(full_response)
                            
                            # Append the complete assistant message to history
                            st.session_state.messages.append({
                                "role": "assistant",
                                "content": full_response,
                                "sources": response.get("sources", [])
                            })
                            # Rerun to let the history loop render the final sources expander
                            st.rerun()
                            
                        else:
                            error_msg = response.get("error", "Unknown error occurred")
                            st.error(f"❌ {error_msg}")
                            # Add error as a message
                            st.session_state.messages.append({"role": "assistant", "content": f"Error: {error_msg}"})
                            st.rerun()
                            
                    except Exception as e:
                        st.error(f"❌ Error: {str(e)}")
                        st.session_state.messages.append({"role": "assistant", "content": f"Error: {str(e)}"})
                        st.rerun()
                else:
                    st.error("Assistant not initialized. Please upload a document again.")
                    st.stop()

elif st.session_state.page == 'Features':
    st.title("⚡ Key Features")
    
    features_list = [
        {"icon": "🎯", "title": "Contextual QA", "desc": "Ask questions in natural language and get precise answers backed by your document content."},
        {"icon": "🔍", "title": "Semantic Search", "desc": "Advanced vector search finds relevant information even when exact keywords don't match."},
        {"icon": "📊", "title": "Source Attribution", "desc": "Every answer includes references to the exact sections of your document for verification."},
        {"icon": "💾", "title": "Smart Caching", "desc": "Documents are processed once and cached for instant subsequent queries without reprocessing."},
        {"icon": "🔄", "title": "Session Management", "desc": "Robust session handling allows for persistent chats and multiple users."},
        {"icon": "🎨", "title": "Multi-Model Support", "desc": "Seamlessly switch between OpenAI, Groq, and Google Gemini models."}
    ]
    
    # Grid Layout for Features
    for i in range(0, len(features_list), 3):
        cols = st.columns(3)
        for j in range(3):
            if i + j < len(features_list):
                feat = features_list[i+j]
                with cols[j]:
                    st.markdown(f"""
                    <div class="feature-card" style="height: 300px;">
                        <div class="feature-icon">{feat['icon']}</div>
                        <div class="feature-title">{feat['title']}</div>
                        <div class="feature-desc">{feat['desc']}</div>
                    </div>
                    """, unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)

elif st.session_state.page == 'FAQ':
    st.title("❓ Help & FAQ")
    
    faqs = [
        {"q": "What file formats are supported?", "a": "Currently we support PDF (MAX 100 pages) and TXT files. PDFs are automatically parsed, chunked and embedded."},
        {"q": "Is my data secure?", "a": "Yes. All processing happens locally on your machine. We only send text chunks to the LLM for answer generation. In our React based frontend also, NONE of your data gets stored."},
        {"q": "How do I switch models?", "a": "You can switch models by changing the API key in your `.env` file. We support OpenAI, Groq, and Gemini. If you are using free tier api keys, Groq should be preferred."},
        {"q": "Can I upload multiple files?", "a": "Currently, the system handles one active document at a time to ensure focused context. Although, if you have already uploaded a file earlier, you don't need to wait again for it to be processed again due to our smart caching."}
    ]
    
    for faq in faqs:
        with st.expander(f"**{faq['q']}**"):
            st.write(faq['a'])