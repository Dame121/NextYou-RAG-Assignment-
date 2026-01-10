"""
Yoga RAG Wellness Assistant - Frontend
A beautiful Streamlit UI for the Yoga RAG Micro-App
"""

import streamlit as st
import requests
import time
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
# CUSTOM CSS - Enhanced UI/UX
# =============================================================================
st.markdown("""
<style>
    /* Import Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    /* Global Styles */
    .stApp {
        font-family: 'Poppins', sans-serif;
    }
    
    /* Main Header */
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    
    .main-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .main-header p {
        font-size: 1.1rem;
        opacity: 0.95;
        margin: 0;
    }
    
    /* Query Input Box */
    .query-container {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        margin-bottom: 1.5rem;
    }
    
    /* Answer Card */
    .answer-card {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        margin: 1rem 0;
        border-left: 5px solid #10b981;
        animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Safety Warning Card */
    .safety-card {
        background: linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1rem 0;
        border-left: 5px solid #ef4444;
        box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
        animation: shake 0.5s ease-in-out, fadeIn 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .safety-header {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #dc2626;
        font-weight: 700;
        font-size: 1.3rem;
        margin-bottom: 1rem;
    }
    
    .safety-icon {
        font-size: 1.5rem;
    }
    
    /* Keyword Tags */
    .keyword-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 1rem 0;
    }
    
    .keyword-tag {
        background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
        color: #991b1b;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        display: inline-block;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
    }
    
    /* Safe Alternatives Box */
    .alternatives-box {
        background: linear-gradient(145deg, #fefce8 0%, #fef3c7 100%);
        border-radius: 12px;
        padding: 1rem;
        margin: 1rem 0;
        border-left: 4px solid #f59e0b;
    }
    
    .alternatives-header {
        color: #b45309;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    /* Disclaimer Box */
    .disclaimer-box {
        background: linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%);
        border-radius: 12px;
        padding: 1rem;
        margin: 1rem 0;
        border-left: 4px solid #3b82f6;
    }
    
    .disclaimer-header {
        color: #1d4ed8;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    /* Sources Card */
    .sources-card {
        background: linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%);
        border-radius: 12px;
        padding: 1rem;
        margin: 0.5rem 0;
        border-left: 4px solid #22c55e;
    }
    
    .source-item {
        background: white;
        border-radius: 8px;
        padding: 0.8rem;
        margin: 0.5rem 0;
        border: 1px solid #bbf7d0;
        transition: transform 0.2s ease;
    }
    
    .source-item:hover {
        transform: translateX(5px);
    }
    
    .source-title {
        font-weight: 600;
        color: #166534;
    }
    
    .source-meta {
        font-size: 0.8rem;
        color: #6b7280;
        margin-top: 4px;
    }
    
    /* Relevance Badge */
    .relevance-badge {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    /* Chat Messages */
    .user-bubble {
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
        border-radius: 20px 20px 5px 20px;
        padding: 1rem 1.5rem;
        margin: 1rem 0;
        margin-left: 20%;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
    }
    
    .user-label {
        color: #4f46e5;
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
    }
    
    /* Feedback Section */
    .feedback-section {
        background: linear-gradient(145deg, #fafafa 0%, #f3f4f6 100%);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1rem 0;
        text-align: center;
    }
    
    .feedback-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 1rem;
    }
    
    /* Response Time Badge */
    .response-time {
        background: #f3f4f6;
        color: #6b7280;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        display: inline-block;
        margin-top: 1rem;
    }
    
    /* Sidebar Styling */
    .sidebar-header {
        color: #4f46e5;
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }
    
    .example-btn {
        transition: all 0.2s ease;
    }
    
    .example-btn:hover {
        transform: scale(1.02);
    }
    
    /* Status Cards */
    .status-card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        margin: 0.5rem 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .status-online {
        color: #10b981;
        font-weight: 600;
    }
    
    .status-offline {
        color: #ef4444;
        font-weight: 600;
    }
    
    /* Footer */
    .footer {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
        font-size: 0.85rem;
        border-top: 1px solid #e5e7eb;
        margin-top: 2rem;
    }
    
    /* Loading Animation */
    .loading-dots {
        display: inline-block;
    }
    
    .loading-dots::after {
        content: '';
        animation: dots 1.5s infinite;
    }
    
    @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
    }
    
    /* Hide Streamlit Branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Custom Button Styles */
    .stButton > button {
        border-radius: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# SESSION STATE
# =============================================================================
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'session_id' not in st.session_state:
    st.session_state.session_id = f"session_{int(time.time())}"
if 'feedback_given' not in st.session_state:
    st.session_state.feedback_given = set()

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

def submit_feedback(query_id: str, rating: str, comment: str = "") -> dict:
    """Submit feedback for a response"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/feedback",
            json={"queryId": query_id, "rating": rating, "comment": comment},
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
    st.markdown("""
    <div class="safety-card">
        <div class="safety-header">
            <span class="safety-icon">⚠️</span>
            <span>SAFETY NOTICE</span>
        </div>
    """, unsafe_allow_html=True)
    
    # Warning message
    warning = safety_info.get('warning', 'This query has been flagged for safety reasons.')
    st.markdown(f"<p style='color: #991b1b; font-size: 1rem;'>{warning}</p>", unsafe_allow_html=True)
    
    # Show detected keywords
    detected_keywords = keywords or safety_info.get('detectedKeywords', [])
    if detected_keywords:
        st.markdown("<p style='font-weight: 600; color: #7f1d1d; margin-top: 1rem;'>🔍 Detected Health-Related Terms:</p>", unsafe_allow_html=True)
        keyword_html = '<div class="keyword-container">'
        for kw in detected_keywords:
            keyword_html += f'<span class="keyword-tag">{kw}</span>'
        keyword_html += '</div>'
        st.markdown(keyword_html, unsafe_allow_html=True)
    
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Safe Alternatives
    recommendation = safety_info.get('recommendation', '')
    if recommendation:
        st.markdown(f"""
        <div class="alternatives-box">
            <div class="alternatives-header">🌿 Safe Alternatives</div>
            <p style="margin: 0; color: #92400e;">{recommendation}</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Professional Disclaimer
    disclaimer = safety_info.get('disclaimer', 'Please consult a doctor or certified yoga therapist before attempting these poses.')
    st.markdown(f"""
    <div class="disclaimer-box">
        <div class="disclaimer-header">⚕️ Professional Guidance Recommended</div>
        <p style="margin: 0; color: #1e40af;">{disclaimer}</p>
    </div>
    """, unsafe_allow_html=True)

def render_sources(sources: list):
    """Render sources used in the response"""
    if not sources:
        return
    
    st.markdown("""
    <div class="sources-card">
        <p style="font-weight: 600; color: #166534; margin-bottom: 0.5rem;">📚 Sources Used</p>
    """, unsafe_allow_html=True)
    
    for i, source in enumerate(sources, 1):
        title = source.get('title', 'Unknown Source')
        category = source.get('category', 'General')
        similarity = source.get('similarity', 0)
        
        st.markdown(f"""
        <div class="source-item">
            <span class="source-title">Source {i}: {title}</span>
            <div class="source-meta">
                Category: {category} &nbsp;|&nbsp; 
                <span class="relevance-badge">{similarity:.0%} relevant</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("</div>", unsafe_allow_html=True)

def render_answer_card(answer: str, metadata: dict):
    """Render the answer with proper styling"""
    is_unsafe = metadata.get('isUnsafe', False)
    safety_info = metadata.get('safetyInfo', {})
    sources = metadata.get('sources', [])
    response_time = metadata.get('responseTime', 0)
    
    # If unsafe, show safety warning first
    if is_unsafe:
        render_safety_warning(safety_info)
    
    # Answer card
    st.markdown('<div class="answer-card">', unsafe_allow_html=True)
    st.markdown("**🧘 Yoga Assistant:**")
    st.markdown(answer)
    
    if response_time:
        st.markdown(f'<span class="response-time">⏱️ Response time: {response_time}ms</span>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Sources
    if sources:
        with st.expander("📚 View Sources Used", expanded=True):
            render_sources(sources)

def render_user_message(content: str):
    """Render user message bubble"""
    st.markdown(f"""
    <div class="user-bubble">
        <div class="user-label">🙋 You asked:</div>
        <p style="margin: 0;">{content}</p>
    </div>
    """, unsafe_allow_html=True)

def render_feedback_section(query_id: str):
    """Render feedback section"""
    if query_id in st.session_state.feedback_given:
        st.success("✅ Thanks for your feedback!")
        return
    
    st.markdown("""
    <div class="feedback-section">
        <div class="feedback-title">Was this answer helpful?</div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1, 1])
    
    with col1:
        if st.button("👍 Helpful", key=f"helpful_{query_id}", use_container_width=True):
            result = submit_feedback(query_id, "helpful")
            if result.get('success'):
                st.session_state.feedback_given.add(query_id)
                st.rerun()
    
    with col2:
        if st.button("👎 Not Helpful", key=f"not_helpful_{query_id}", use_container_width=True):
            result = submit_feedback(query_id, "not_helpful")
            if result.get('success'):
                st.session_state.feedback_given.add(query_id)
                st.rerun()
    
    with col3:
        if st.button("😐 Neutral", key=f"neutral_{query_id}", use_container_width=True):
            result = submit_feedback(query_id, "neutral")
            if result.get('success'):
                st.session_state.feedback_given.add(query_id)
                st.rerun()

# =============================================================================
# SIDEBAR
# =============================================================================
with st.sidebar:
    # Logo/Title
    st.markdown("## 🧘 Yoga Assistant")
    st.markdown("---")
    
    # About Section
    st.markdown("### ℹ️ About")
    st.markdown("""
    Your AI-powered wellness companion for all things yoga:
    
    - 🧘 **Asanas** - Yoga poses & techniques
    - 🌬️ **Pranayama** - Breathing practices  
    - 🧠 **Meditation** - Mindfulness guidance
    - 💪 **Wellness** - Fitness & health tips
    """)
    
    st.markdown("---")
    
    # Example Questions
    st.markdown("### 💡 Try These Questions")
    
    examples = [
        "What are the benefits of Surya Namaskar?",
        "How do I do tree pose correctly?",
        "What is pranayama?",
        "Yoga poses for beginners",
        "Benefits of meditation"
    ]
    
    for q in examples:
        if st.button(f"📝 {q[:30]}...", key=f"ex_{q}", use_container_width=True):
            st.session_state.example_query = q
    
    st.markdown("---")
    
    # Safety Examples
    st.markdown("### ⚠️ Safety Demo")
    st.caption("Try these to see safety warnings:")
    
    safety_examples = [
        "I am pregnant, can I do yoga?",
        "Yoga for high blood pressure",
        "Poses after hernia surgery"
    ]
    
    for q in safety_examples:
        if st.button(f"🔴 {q[:25]}...", key=f"safe_{q}", use_container_width=True):
            st.session_state.example_query = q
    
    st.markdown("---")
    
    # System Status
    st.markdown("### 📊 System Status")
    status = get_system_status()
    
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
    
    st.markdown("---")
    
    # Clear History
    if st.button("🗑️ Clear Chat", use_container_width=True):
        st.session_state.chat_history = []
        st.session_state.feedback_given = set()
        st.rerun()

# =============================================================================
# MAIN CONTENT
# =============================================================================

# Header
st.markdown("""
<div class="main-header">
    <h1>🧘 Ask Me Anything About Yoga</h1>
    <p>AI-powered wellness assistant with safety-aware responses</p>
</div>
""", unsafe_allow_html=True)

# Query Input Section
st.markdown('<div class="query-container">', unsafe_allow_html=True)

# Check for example query
default_query = ""
if 'example_query' in st.session_state:
    default_query = st.session_state.example_query
    del st.session_state.example_query

# Input
query = st.text_area(
    "🔍 Ask your yoga question:",
    value=default_query,
    height=100,
    placeholder="e.g., What are the benefits of meditation? How do I do downward dog pose?",
    key="query_input"
)

# Submit Button
col1, col2, col3 = st.columns([1, 1, 2])
with col1:
    submit = st.button("🚀 Get Answer", type="primary", use_container_width=True)
with col2:
    if st.button("🔄 Clear", use_container_width=True):
        st.session_state.chat_history = []
        st.rerun()

st.markdown('</div>', unsafe_allow_html=True)

# =============================================================================
# PROCESS QUERY
# =============================================================================
if submit and query.strip():
    # Add to history
    st.session_state.chat_history.append({
        'role': 'user',
        'content': query,
        'timestamp': datetime.now().isoformat()
    })
    
    # Show loading
    with st.spinner("🧘 Consulting the yoga knowledge base..."):
        start_time = time.time()
        result = ask_question(query)
        elapsed = int((time.time() - start_time) * 1000)
    
    if result.get('success'):
        data = result.get('data', {})
        
        # Add response to history
        st.session_state.chat_history.append({
            'role': 'assistant',
            'content': data.get('answer', 'No response received.'),
            'metadata': {
                'isUnsafe': data.get('isUnsafe', False),
                'safetyInfo': data.get('safetyInfo', {}),
                'sources': data.get('sources', []),
                'responseTime': data.get('responseTime', elapsed),
                'queryId': data.get('queryId')
            },
            'timestamp': datetime.now().isoformat()
        })
        
        st.rerun()
    else:
        st.error(f"❌ Error: {result.get('error', 'Unknown error')}")

# =============================================================================
# DISPLAY CONVERSATION
# =============================================================================
if st.session_state.chat_history:
    st.markdown("---")
    st.markdown("### 💬 Conversation")
    
    for i, msg in enumerate(st.session_state.chat_history):
        if msg['role'] == 'user':
            render_user_message(msg['content'])
        else:
            render_answer_card(msg['content'], msg.get('metadata', {}))
            
            # Feedback for last message
            if i == len(st.session_state.chat_history) - 1:
                query_id = msg.get('metadata', {}).get('queryId')
                if query_id:
                    render_feedback_section(query_id)

# =============================================================================
# FOOTER
# =============================================================================
st.markdown("""
<div class="footer">
    <p>⚠️ <strong>Disclaimer:</strong> This AI assistant provides general information about yoga. 
    It is not a substitute for professional medical advice. Always consult healthcare professionals for medical concerns.</p>
    <p style="margin-top: 1rem;">Built with ❤️ using RAG Pipeline • Ollama • MongoDB • Streamlit</p>
</div>
""", unsafe_allow_html=True)
