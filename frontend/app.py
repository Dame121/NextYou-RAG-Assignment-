"""
Yoga RAG Wellness Assistant - Frontend
A ChatGPT-style Streamlit UI for the Yoga RAG Micro-App
"""

import streamlit as st
import requests
import time
import uuid
from datetime import datetime

# =============================================================================
# CONFIGURATION
# =============================================================================
API_BASE_URL = "http://localhost:3000/api"

# =============================================================================
# PAGE CONFIG
# =============================================================================
st.set_page_config(
    page_title="🧘 Yoga Wellness Assistant",
    page_icon="🧘",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =============================================================================
# CUSTOM CSS - ChatGPT-Style UI
# =============================================================================
st.markdown("""
<style>
    /* Import Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Global Styles */
    .stApp {
        font-family: 'Inter', sans-serif;
        background-color: #343541;
    }
    
    /* Hide default Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Sidebar Styling - Dark Theme */
    [data-testid="stSidebar"] {
        background-color: #202123;
        border-right: 1px solid #4d4d4f;
    }
    
    [data-testid="stSidebar"] .stMarkdown {
        color: #ececf1;
    }
    
    [data-testid="stSidebar"] h1, 
    [data-testid="stSidebar"] h2, 
    [data-testid="stSidebar"] h3 {
        color: #ececf1 !important;
    }
    
    /* Chat History Item Styling */
    .chat-history-item {
        background: #2a2b32;
        border-radius: 8px;
        padding: 10px 12px;
        color: #ececf1;
        margin: 4px 0;
        cursor: pointer;
        font-size: 0.85rem;
        border: 1px solid #3d3d42;
        transition: all 0.2s;
    }
    
    .chat-history-item:hover {
        background: #3d3d42;
        border-color: #565869;
    }
    
    .chat-history-active {
        background: #444654 !important;
        border-color: #10a37f !important;
    }
    
    /* Main Chat Container */
    .main-container {
        max-width: 900px;
        margin: 0 auto;
        padding-bottom: 180px;
    }
    
    /* User Message */
    .user-message {
        background-color: #343541;
        padding: 24px 0;
        border-bottom: 1px solid #444654;
    }
    
    .user-message-content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        gap: 16px;
        align-items: flex-start;
    }
    
    .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
    }
    
    .user-text {
        color: #ececf1;
        line-height: 1.7;
        flex: 1;
        padding-top: 4px;
    }
    
    /* Assistant Message */
    .assistant-message {
        background-color: #444654;
        padding: 24px 0;
        border-bottom: 1px solid #444654;
    }
    
    .assistant-message-content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        gap: 16px;
        align-items: flex-start;
    }
    
    .assistant-avatar {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        flex-shrink: 0;
    }
    
    .assistant-text {
        color: #d1d5db;
        line-height: 1.75;
        flex: 1;
        padding-top: 4px;
    }
    
    /* Safety Warning Card - Red Block */
    .safety-card {
        background: linear-gradient(145deg, #7f1d1d 0%, #991b1b 100%);
        border-radius: 12px;
        padding: 1.25rem;
        margin: 1rem 0;
        border-left: 5px solid #ef4444;
        box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
    }
    
    .safety-header {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fecaca;
        font-weight: 700;
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
    }
    
    .safety-text {
        color: #fecaca;
        font-size: 0.95rem;
        line-height: 1.6;
    }
    
    /* Keyword Tags */
    .keyword-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0.75rem 0;
    }
    
    .keyword-tag {
        background: rgba(254, 202, 202, 0.2);
        color: #fecaca;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 500;
        border: 1px solid rgba(254, 202, 202, 0.3);
    }
    
    /* Safe Alternatives Box */
    .alternatives-box {
        background: rgba(251, 191, 36, 0.15);
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
        border-left: 4px solid #fbbf24;
    }
    
    .alternatives-header {
        color: #fcd34d;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
    }
    
    .alternatives-text {
        color: #fef3c7;
        font-size: 0.9rem;
    }
    
    /* Disclaimer Box */
    .disclaimer-box {
        background: rgba(59, 130, 246, 0.15);
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
        border-left: 4px solid #3b82f6;
    }
    
    .disclaimer-header {
        color: #93c5fd;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
    }
    
    .disclaimer-text {
        color: #bfdbfe;
        font-size: 0.9rem;
    }
    
    /* Sources Card */
    .sources-card {
        background: rgba(16, 185, 129, 0.1);
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
        border-left: 4px solid #10b981;
    }
    
    .sources-header {
        color: #6ee7b7;
        font-weight: 600;
        margin-bottom: 0.75rem;
        font-size: 0.95rem;
    }
    
    .source-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin: 0.5rem 0;
        border: 1px solid rgba(110, 231, 183, 0.2);
        transition: all 0.2s ease;
    }
    
    .source-item:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(4px);
    }
    
    .source-title {
        font-weight: 600;
        color: #a7f3d0;
        font-size: 0.9rem;
    }
    
    .source-meta {
        font-size: 0.8rem;
        color: #9ca3af;
        margin-top: 4px;
    }
    
    .relevance-badge {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 600;
    }
    
    /* Response Time */
    .response-time {
        color: #6b7280;
        font-size: 0.75rem;
        margin-top: 0.75rem;
    }
    
    /* Welcome Screen */
    .welcome-container {
        text-align: center;
        padding: 80px 20px 40px 20px;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .welcome-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #ececf1;
        margin-bottom: 0.5rem;
    }
    
    .welcome-subtitle {
        font-size: 1.1rem;
        color: #8e8ea0;
        margin-bottom: 2rem;
    }
    
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 2rem;
        max-width: 700px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .feature-card {
        background: #444654;
        border-radius: 12px;
        padding: 16px;
        text-align: left;
        transition: all 0.2s;
        cursor: pointer;
        border: 1px solid transparent;
    }
    
    .feature-card:hover {
        border-color: #565869;
        background: #4a4b59;
    }
    
    .feature-icon {
        font-size: 1.3rem;
        margin-bottom: 8px;
    }
    
    .feature-title {
        color: #ececf1;
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 4px;
    }
    
    .feature-desc {
        color: #8e8ea0;
        font-size: 0.8rem;
    }
    
    /* System Status in Sidebar */
    .status-card {
        background: #2a2b32;
        border-radius: 8px;
        padding: 12px;
        margin-top: 16px;
    }
    
    .status-online {
        color: #10b981;
        font-weight: 600;
        font-size: 0.85rem;
    }
    
    .status-offline {
        color: #ef4444;
        font-weight: 600;
        font-size: 0.85rem;
    }
    
    /* Custom Streamlit overrides */
    .stTextArea textarea {
        background-color: #40414f !important;
        color: #ececf1 !important;
        border: 1px solid #565869 !important;
        border-radius: 12px !important;
        font-size: 1rem !important;
    }
    
    .stTextArea textarea:focus {
        border-color: #10a37f !important;
        box-shadow: 0 0 0 1px #10a37f !important;
    }
    
    .stTextInput input {
        background-color: #40414f !important;
        color: #ececf1 !important;
        border: 1px solid #565869 !important;
        border-radius: 12px !important;
    }
    
    .stButton > button {
        border-radius: 10px !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
    }
    
    .stButton > button:hover {
        transform: translateY(-1px) !important;
    }
    
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%) !important;
        border: none !important;
        color: white !important;
    }
    
    .stButton > button[kind="secondary"] {
        background: #40414f !important;
        border: 1px solid #565869 !important;
        color: #ececf1 !important;
    }
    
    /* Expander styling */
    .streamlit-expanderHeader {
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 8px !important;
        color: #ececf1 !important;
    }
    
    .streamlit-expanderContent {
        background: transparent !important;
        border: none !important;
    }
    
    /* Disclaimer footer */
    .disclaimer-footer {
        text-align: center;
        padding: 12px 20px;
        color: #6b7280;
        font-size: 0.75rem;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.5;
    }
    
    /* Date divider in chat history */
    .history-divider {
        color: #8e8ea0;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 12px 0 6px 0;
        font-weight: 600;
    }
    
    /* Loading animation */
    .loading-text {
        color: #9ca3af;
        font-style: italic;
    }
    
    /* Feedback success message */
    .feedback-success {
        color: #10b981;
        font-size: 0.85rem;
        padding: 8px 0;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# SESSION STATE INITIALIZATION
# =============================================================================
if 'conversations' not in st.session_state:
    # List of conversations: [{id, title, messages, created_at}]
    st.session_state.conversations = []
    
if 'current_conversation_id' not in st.session_state:
    st.session_state.current_conversation_id = None
    
if 'session_id' not in st.session_state:
    st.session_state.session_id = f"session_{int(time.time())}"
    
if 'feedback_given' not in st.session_state:
    st.session_state.feedback_given = set()

if 'pending_query' not in st.session_state:
    st.session_state.pending_query = None

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def generate_conversation_id():
    """Generate a unique conversation ID"""
    return str(uuid.uuid4())[:8]

def get_current_conversation():
    """Get the current active conversation"""
    if st.session_state.current_conversation_id:
        for conv in st.session_state.conversations:
            if conv['id'] == st.session_state.current_conversation_id:
                return conv
    return None

def create_new_conversation(first_message=None):
    """Create a new conversation"""
    conv_id = generate_conversation_id()
    title = first_message[:30] + "..." if first_message and len(first_message) > 30 else (first_message or "New Chat")
    
    conversation = {
        'id': conv_id,
        'title': title,
        'messages': [],
        'created_at': datetime.now().isoformat()
    }
    
    st.session_state.conversations.insert(0, conversation)
    st.session_state.current_conversation_id = conv_id
    return conversation

def add_message_to_conversation(role, content, metadata=None):
    """Add a message to the current conversation"""
    conv = get_current_conversation()
    if conv:
        message = {
            'role': role,
            'content': content,
            'metadata': metadata or {},
            'timestamp': datetime.now().isoformat()
        }
        conv['messages'].append(message)
        
        # Update title if this is the first user message
        if role == 'user' and len(conv['messages']) == 1:
            conv['title'] = content[:30] + "..." if len(content) > 30 else content

def delete_conversation(conv_id):
    """Delete a conversation"""
    st.session_state.conversations = [c for c in st.session_state.conversations if c['id'] != conv_id]
    if st.session_state.current_conversation_id == conv_id:
        st.session_state.current_conversation_id = None

# =============================================================================
# API FUNCTIONS
# =============================================================================
def ask_question(query: str) -> dict:
    """Send question to the backend API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/ask",
            json={"query": query, "sessionId": st.session_state.session_id},
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Cannot connect to backend. Please ensure the server is running on port 3000."}
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Request timed out. The server might be processing a complex query."}
    except Exception as e:
        return {"success": False, "error": str(e)}

def submit_feedback(query_id: str, is_helpful: bool, comment: str = "") -> dict:
    """Submit feedback for a response"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/feedback",
            json={"queryId": query_id, "isHelpful": is_helpful, "comment": comment},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_system_status() -> dict:
    """Get RAG system status"""
    try:
        response = requests.get(f"{API_BASE_URL}/rag/status", timeout=5)
        if response.ok:
            return response.json()
        return {"success": False}
    except:
        return {"success": False}

# =============================================================================
# UI COMPONENTS
# =============================================================================
def render_safety_warning(safety_info: dict, keywords: list = None):
    """Render the safety warning block with red styling"""
    warning = safety_info.get('warning', 'This query has been flagged for safety reasons.')
    detected_keywords = keywords or safety_info.get('detectedKeywords', [])
    recommendation = safety_info.get('recommendation', '')
    disclaimer = safety_info.get('disclaimer', 'Please consult a doctor or certified yoga therapist before attempting these poses.')
    
    st.markdown(f"""
    <div class="safety-card">
        <div class="safety-header">
            <span>⚠️</span>
            <span>SAFETY NOTICE</span>
        </div>
        <p class="safety-text">{warning}</p>
    """, unsafe_allow_html=True)
    
    # Show detected keywords
    if detected_keywords:
        keyword_html = '<p style="font-weight: 600; color: #fecaca; margin-top: 0.75rem; font-size: 0.9rem;">🔍 Detected Health-Related Terms:</p>'
        keyword_html += '<div class="keyword-container">'
        for kw in detected_keywords:
            keyword_html += f'<span class="keyword-tag">{kw}</span>'
        keyword_html += '</div>'
        st.markdown(keyword_html, unsafe_allow_html=True)
    
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Safe Alternatives
    if recommendation:
        st.markdown(f"""
        <div class="alternatives-box">
            <div class="alternatives-header">🌿 Safe Alternatives</div>
            <p class="alternatives-text">{recommendation}</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Professional Disclaimer
    st.markdown(f"""
    <div class="disclaimer-box">
        <div class="disclaimer-header">⚕️ Professional Guidance Recommended</div>
        <p class="disclaimer-text">{disclaimer}</p>
    </div>
    """, unsafe_allow_html=True)

def render_sources(sources: list):
    """Render sources used in the response"""
    if not sources:
        return
    
    st.markdown('<div class="sources-card">', unsafe_allow_html=True)
    st.markdown('<p class="sources-header">📚 Sources Used</p>', unsafe_allow_html=True)
    
    for source in sources:
        source_id = source.get('id', 1)
        title = source.get('title', 'Unknown Source')
        category = source.get('category', 'General')
        chunk_id = source.get('chunkId', '')
        relevance = source.get('relevance', 0)
        
        st.markdown(f"""
        <div class="source-item">
            <span class="source-title">Source {source_id}: {title}</span>
            <div class="source-meta">
                Category: {category} &nbsp;|&nbsp; 
                <span class="relevance-badge">{relevance}% relevant</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("</div>", unsafe_allow_html=True)

def render_user_message(content: str):
    """Render user message in ChatGPT style"""
    st.markdown(f"""
    <div class="user-message">
        <div class="user-message-content">
            <div class="user-avatar">You</div>
            <div class="user-text">{content}</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_assistant_message(content: str, metadata: dict):
    """Render assistant message with sources and safety warnings"""
    is_unsafe = metadata.get('isUnsafe', False)
    safety_info = metadata.get('safetyInfo', {})
    sources = metadata.get('sources', [])
    response_time = metadata.get('responseTime', 0)
    
    st.markdown(f"""
    <div class="assistant-message">
        <div class="assistant-message-content">
            <div class="assistant-avatar">🧘</div>
            <div class="assistant-text">
    """, unsafe_allow_html=True)
    
    # If unsafe, show safety warning first
    if is_unsafe:
        render_safety_warning(safety_info)
    
    # Main answer
    st.markdown(content)
    
    # Sources section - display prominently
    if sources:
        render_sources(sources)
    
    # Response time
    if response_time:
        st.markdown(f'<p class="response-time">⏱️ Response time: {response_time}ms</p>', unsafe_allow_html=True)
    
    st.markdown("""
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_feedback_section(query_id: str, message_index: int):
    """Render feedback section"""
    feedback_key = f"{query_id}_{message_index}"
    
    if feedback_key in st.session_state.feedback_given:
        st.markdown('<p class="feedback-success">✅ Thanks for your feedback!</p>', unsafe_allow_html=True)
        return
    
    col1, col2, col3 = st.columns([1, 1, 3])
    
    with col1:
        if st.button("👍 Helpful", key=f"helpful_{feedback_key}", use_container_width=True):
            result = submit_feedback(query_id, True)
            if result.get('success'):
                st.session_state.feedback_given.add(feedback_key)
                st.rerun()
    
    with col2:
        if st.button("👎 Not Helpful", key=f"not_helpful_{feedback_key}", use_container_width=True):
            result = submit_feedback(query_id, False)
            if result.get('success'):
                st.session_state.feedback_given.add(feedback_key)
                st.rerun()

def render_welcome_screen():
    """Render the welcome screen when no conversation is active"""
    st.markdown("""
    <div class="welcome-container">
        <div class="welcome-title">🧘 Yoga Wellness Assistant</div>
        <div class="welcome-subtitle">Your AI-powered guide for yoga, wellness, and mindfulness</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Feature cards as clickable examples
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🧘</div>
            <div class="feature-title">Yoga Poses</div>
            <div class="feature-desc">Learn about asanas, their benefits, and proper techniques</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("What are the benefits of Surya Namaskar?", key="ex1", use_container_width=True):
            st.session_state.pending_query = "What are the benefits of Surya Namaskar?"
            st.rerun()
        
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🌬️</div>
            <div class="feature-title">Breathing Practices</div>
            <div class="feature-desc">Explore pranayama techniques for better health</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("What is pranayama and how do I practice it?", key="ex2", use_container_width=True):
            st.session_state.pending_query = "What is pranayama and how do I practice it?"
            st.rerun()
    
    with col2:
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <div class="feature-title">Meditation</div>
            <div class="feature-desc">Discover mindfulness and meditation practices</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("How do I start a meditation practice?", key="ex3", use_container_width=True):
            st.session_state.pending_query = "How do I start a meditation practice?"
            st.rerun()
        
        st.markdown("""
        <div class="feature-card">
            <div class="feature-icon">💪</div>
            <div class="feature-title">For Beginners</div>
            <div class="feature-desc">Get started with yoga fundamentals</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("What yoga poses are best for beginners?", key="ex4", use_container_width=True):
            st.session_state.pending_query = "What yoga poses are best for beginners?"
            st.rerun()
    
    st.markdown("""
    <div class="disclaimer-footer">
        ⚠️ <strong>Disclaimer:</strong> This AI assistant provides general information about yoga. 
        It is not a substitute for professional medical advice. Always consult healthcare professionals for medical concerns.
    </div>
    """, unsafe_allow_html=True)

# =============================================================================
# SIDEBAR - Chat History
# =============================================================================
with st.sidebar:
    # New Chat Button
    st.markdown("### 🧘 Yoga Assistant")
    
    if st.button("➕ New Chat", use_container_width=True, type="primary"):
        st.session_state.current_conversation_id = None
        st.rerun()
    
    st.markdown("---")
    
    # Chat History
    st.markdown("### 💬 Chat History")
    
    if not st.session_state.conversations:
        st.markdown('<p style="color: #8e8ea0; font-size: 0.85rem;">No conversations yet.<br>Start a new chat to begin!</p>', unsafe_allow_html=True)
    else:
        # Group by today/previous
        today = datetime.now().date()
        today_convs = []
        older_convs = []
        
        for conv in st.session_state.conversations:
            conv_date = datetime.fromisoformat(conv['created_at']).date()
            if conv_date == today:
                today_convs.append(conv)
            else:
                older_convs.append(conv)
        
        # Today's conversations
        if today_convs:
            st.markdown('<p class="history-divider">Today</p>', unsafe_allow_html=True)
            for conv in today_convs:
                is_active = conv['id'] == st.session_state.current_conversation_id
                btn_type = "primary" if is_active else "secondary"
                
                col1, col2 = st.columns([5, 1])
                with col1:
                    if st.button(f"💬 {conv['title']}", key=f"conv_{conv['id']}", use_container_width=True):
                        st.session_state.current_conversation_id = conv['id']
                        st.rerun()
                with col2:
                    if st.button("🗑️", key=f"del_{conv['id']}"):
                        delete_conversation(conv['id'])
                        st.rerun()
        
        # Older conversations
        if older_convs:
            st.markdown('<p class="history-divider">Previous</p>', unsafe_allow_html=True)
            for conv in older_convs:
                col1, col2 = st.columns([5, 1])
                with col1:
                    if st.button(f"💬 {conv['title']}", key=f"conv_{conv['id']}", use_container_width=True):
                        st.session_state.current_conversation_id = conv['id']
                        st.rerun()
                with col2:
                    if st.button("🗑️", key=f"del_{conv['id']}"):
                        delete_conversation(conv['id'])
                        st.rerun()
    
    st.markdown("---")
    
    # Safety Demo Section
    st.markdown("### ⚠️ Safety Demo")
    st.markdown('<p style="color: #8e8ea0; font-size: 0.8rem;">Try these to see safety warnings:</p>', unsafe_allow_html=True)
    
    safety_examples = [
        "I am pregnant, can I do yoga?",
        "Yoga for high blood pressure",
        "Poses after hernia surgery"
    ]
    
    for q in safety_examples:
        if st.button(f"🔴 {q[:22]}...", key=f"safe_{q}", use_container_width=True):
            st.session_state.pending_query = q
            st.rerun()
    
    st.markdown("---")
    
    # System Status
    st.markdown("### 📊 System Status")
    status = get_system_status()
    
    st.markdown('<div class="status-card">', unsafe_allow_html=True)
    if status.get('success'):
        data = status.get('data', {})
        st.markdown('<p class="status-online">✅ Backend Online</p>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Articles", data.get('totalArticles', 34))
        with col2:
            st.metric("Vectors", data.get('totalChunks', 66))
    else:
        st.markdown('<p class="status-offline">❌ Backend Offline</p>', unsafe_allow_html=True)
        st.caption("Start the backend server first")
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Clear All Chats
    if st.session_state.conversations:
        if st.button("🗑️ Clear All Chats", use_container_width=True):
            st.session_state.conversations = []
            st.session_state.current_conversation_id = None
            st.session_state.feedback_given = set()
            st.rerun()

# =============================================================================
# MAIN CONTENT AREA
# =============================================================================

# Check for pending query (from sidebar buttons)
if st.session_state.pending_query:
    query = st.session_state.pending_query
    st.session_state.pending_query = None
    
    # Create new conversation if needed
    if not st.session_state.current_conversation_id:
        create_new_conversation(query)
    
    # Add user message
    add_message_to_conversation('user', query)
    
    # Get response
    with st.spinner("🧘 Thinking..."):
        start_time = time.time()
        result = ask_question(query)
        elapsed = int((time.time() - start_time) * 1000)
    
    if result.get('success'):
        data = result.get('data', {})
        metadata = {
            'isUnsafe': data.get('isUnsafe', False),
            'safetyInfo': data.get('safetyInfo', {}),
            'sources': data.get('sources', []),
            'responseTime': data.get('responseTime', elapsed),
            'queryId': data.get('queryId')
        }
        add_message_to_conversation('assistant', data.get('answer', 'No response received.'), metadata)
    else:
        add_message_to_conversation('assistant', f"❌ Error: {result.get('error', 'Unknown error')}", {})
    
    st.rerun()

# Display conversation or welcome screen
conv = get_current_conversation()

if not conv or not conv['messages']:
    render_welcome_screen()
else:
    # Render messages
    st.markdown('<div class="main-container">', unsafe_allow_html=True)
    
    for i, msg in enumerate(conv['messages']):
        if msg['role'] == 'user':
            render_user_message(msg['content'])
        else:
            render_assistant_message(msg['content'], msg.get('metadata', {}))
            
            # Feedback for the last assistant message
            if i == len(conv['messages']) - 1 and msg['role'] == 'assistant':
                query_id = msg.get('metadata', {}).get('queryId')
                if query_id:
                    render_feedback_section(query_id, i)
    
    st.markdown('</div>', unsafe_allow_html=True)

# =============================================================================
# INPUT SECTION (Always at bottom)
# =============================================================================
st.markdown("---")

# Input container
with st.container():
    col1, col2 = st.columns([6, 1])
    
    with col1:
        query = st.text_area(
            "Ask about yoga...",
            placeholder="Ask anything about yoga, meditation, breathing practices, or wellness...",
            height=80,
            key="query_input",
            label_visibility="collapsed"
        )
    
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)
        submit = st.button("ASK", type="primary", use_container_width=True)

# Process query
if submit and query.strip():
    # Create new conversation if needed
    if not st.session_state.current_conversation_id:
        create_new_conversation(query)
    
    # Add user message
    add_message_to_conversation('user', query)
    
    # Get response
    with st.spinner("🧘 Consulting the yoga knowledge base..."):
        start_time = time.time()
        result = ask_question(query)
        elapsed = int((time.time() - start_time) * 1000)
    
    if result.get('success'):
        data = result.get('data', {})
        metadata = {
            'isUnsafe': data.get('isUnsafe', False),
            'safetyInfo': data.get('safetyInfo', {}),
            'sources': data.get('sources', []),
            'responseTime': data.get('responseTime', elapsed),
            'queryId': data.get('queryId')
        }
        add_message_to_conversation('assistant', data.get('answer', 'No response received.'), metadata)
    else:
        add_message_to_conversation('assistant', f"❌ Error: {result.get('error', 'Unknown error')}", {})
    
    st.rerun()

# Footer disclaimer
st.markdown("""
<div class="disclaimer-footer">
    Built with ❤️ using RAG Pipeline • Ollama • MongoDB • Streamlit
</div>
""", unsafe_allow_html=True)
