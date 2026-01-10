import streamlit as st
import requests
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:3000/api"

# Page configuration
st.set_page_config(
    page_title="Yoga Wellness Assistant",
    page_icon="🧘",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    
    .safety-warning {
        background-color: #fee2e2;
        border: 2px solid #ef4444;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }
    
    .safety-warning-header {
        color: #dc2626;
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }
    
    .safety-recommendation {
        background-color: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 0.8rem;
        margin: 0.5rem 0;
    }
    
    .safety-disclaimer {
        background-color: #dbeafe;
        border: 1px solid #3b82f6;
        border-radius: 8px;
        padding: 0.8rem;
        margin: 0.5rem 0;
    }
    
    .source-box {
        background-color: #f0fdf4;
        border: 1px solid #22c55e;
        border-radius: 8px;
        padding: 0.8rem;
        margin: 0.5rem 0;
    }
    
    .chat-message {
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem 0;
    }
    
    .user-message {
        background-color: #e0e7ff;
        border-left: 4px solid #6366f1;
    }
    
    .assistant-message {
        background-color: #f3f4f6;
        border-left: 4px solid #10b981;
    }
    
    .response-time {
        font-size: 0.8rem;
        color: #6b7280;
        text-align: right;
    }
    
    .keyword-tag {
        display: inline-block;
        background-color: #fecaca;
        color: #991b1b;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin: 0.2rem;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'session_id' not in st.session_state:
    st.session_state.session_id = f"session_{int(time.time())}"

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
        return {"success": False, "error": "Cannot connect to backend. Make sure the server is running."}
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Request timed out. Please try again."}
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

def display_safety_warning(safety_info: dict):
    """Display safety warning block"""
    st.markdown("""
    <div class="safety-warning">
        <div class="safety-warning-header">⚠️ SAFETY NOTICE</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Warning message
    st.error(safety_info.get('warning', 'This query has been flagged for safety reasons.'))
    
    # Detected keywords
    keywords = safety_info.get('detectedKeywords', [])
    if keywords:
        st.markdown("**Detected health-related terms:**")
        keyword_html = " ".join([f'<span class="keyword-tag">{kw}</span>' for kw in keywords])
        st.markdown(keyword_html, unsafe_allow_html=True)
    
    # Recommendation
    recommendation = safety_info.get('recommendation', '')
    if recommendation:
        st.markdown("""
        <div class="safety-recommendation">
            <strong>🌿 Safe Alternatives:</strong>
        </div>
        """, unsafe_allow_html=True)
        st.info(recommendation)
    
    # Disclaimer
    disclaimer = safety_info.get('disclaimer', '')
    if disclaimer:
        st.markdown("""
        <div class="safety-disclaimer">
            <strong>⚕️ Professional Guidance:</strong>
        </div>
        """, unsafe_allow_html=True)
        st.warning(disclaimer)

def display_sources(sources: list):
    """Display source attribution"""
    if sources:
        with st.expander("📚 Sources Used", expanded=False):
            for i, source in enumerate(sources, 1):
                st.markdown(f"""
                <div class="source-box">
                    <strong>Source {i}:</strong> {source.get('title', 'Unknown')} 
                    <br><small>Category: {source.get('category', 'N/A')} | 
                    Relevance: {source.get('similarity', 0):.2%}</small>
                </div>
                """, unsafe_allow_html=True)

def display_chat_message(role: str, content: str, metadata: dict = None):
    """Display a chat message"""
    if role == "user":
        st.markdown(f"""
        <div class="chat-message user-message">
            <strong>🙋 You:</strong><br>{content}
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="chat-message assistant-message">
            <strong>🧘 Yoga Assistant:</strong>
        </div>
        """, unsafe_allow_html=True)
        
        # Check for safety info
        if metadata and metadata.get('isUnsafe'):
            display_safety_warning(metadata.get('safetyInfo', {}))
        
        # Display answer (without the safety parts if they're already shown)
        answer = content
        if metadata and metadata.get('isUnsafe'):
            # The safety info is already displayed, show a cleaner version
            st.markdown(answer)
        else:
            st.markdown(answer)
        
        # Display sources
        if metadata and metadata.get('sources'):
            display_sources(metadata['sources'])
        
        # Display response time
        if metadata and metadata.get('responseTime'):
            st.markdown(f"""
            <div class="response-time">
                ⏱️ Response time: {metadata['responseTime']}ms
            </div>
            """, unsafe_allow_html=True)

# Main UI
st.markdown("""
<div class="main-header">
    <h1>🧘 Ask Me Anything About Yoga</h1>
    <p>Your AI-powered yoga wellness assistant with safety-aware responses</p>
</div>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("ℹ️ About")
    st.markdown("""
    This AI assistant helps you learn about:
    - 🧘 Yoga poses (Asanas)
    - 🌬️ Breathing techniques (Pranayama)
    - 🧠 Meditation practices
    - 💪 Wellness & fitness
    
    **Safety Features:**
    - Automatic detection of health-sensitive queries
    - Safe alternative recommendations
    - Professional consultation advisories
    """)
    
    st.divider()
    
    st.header("💡 Example Questions")
    example_questions = [
        "What are the benefits of Surya Namaskar?",
        "How do I do downward facing dog correctly?",
        "What is pranayama and how do I practice it?",
        "I'm a beginner, where should I start?",
        "What poses help with back pain?",
        "Can you explain the eight limbs of yoga?"
    ]
    
    for q in example_questions:
        if st.button(q, key=f"example_{q}", use_container_width=True):
            st.session_state.example_query = q
    
    st.divider()
    
    st.header("⚠️ Safety Examples")
    st.caption("These queries will trigger safety warnings:")
    safety_examples = [
        "I am pregnant, can I do yoga?",
        "Yoga poses for high blood pressure",
        "I had recent surgery, what poses are safe?"
    ]
    
    for q in safety_examples:
        if st.button(q, key=f"safety_{q}", use_container_width=True):
            st.session_state.example_query = q
    
    st.divider()
    
    if st.button("🗑️ Clear Chat History", use_container_width=True):
        st.session_state.chat_history = []
        st.rerun()
    
    # RAG Status
    st.divider()
    st.header("📊 System Status")
    try:
        status_response = requests.get(f"{API_BASE_URL}/rag/status", timeout=5)
        if status_response.ok:
            status = status_response.json().get('data', {})
            st.success("✅ Backend Connected")
            st.metric("Knowledge Base Articles", status.get('totalArticles', 'N/A'))
            st.metric("Vector Chunks", status.get('totalChunks', 'N/A'))
        else:
            st.error("❌ Backend Error")
    except:
        st.error("❌ Backend Offline")

# Main chat area
col1, col2 = st.columns([3, 1])

with col1:
    # Check for example query
    default_query = ""
    if 'example_query' in st.session_state:
        default_query = st.session_state.example_query
        del st.session_state.example_query
    
    # Query input
    query = st.text_area(
        "Ask your yoga question:",
        value=default_query,
        height=100,
        placeholder="e.g., What are the benefits of meditation? How do I do tree pose?",
        key="query_input"
    )
    
    col_btn1, col_btn2 = st.columns([1, 4])
    with col_btn1:
        submit_button = st.button("🔍 Ask", type="primary", use_container_width=True)

# Display chat history
st.divider()
st.subheader("💬 Conversation")

# Display previous messages
for msg in st.session_state.chat_history:
    display_chat_message(msg['role'], msg['content'], msg.get('metadata'))

# Handle new query
if submit_button and query.strip():
    # Add user message to history
    st.session_state.chat_history.append({
        'role': 'user',
        'content': query,
        'timestamp': datetime.now().isoformat()
    })
    
    # Show loading
    with st.spinner("🧘 Consulting the yoga knowledge base..."):
        result = ask_question(query)
    
    if result.get('success'):
        data = result.get('data', {})
        
        # Add assistant response to history
        st.session_state.chat_history.append({
            'role': 'assistant',
            'content': data.get('answer', 'No response received.'),
            'metadata': {
                'isUnsafe': data.get('isUnsafe', False),
                'safetyInfo': data.get('safetyInfo'),
                'sources': data.get('sources', []),
                'responseTime': data.get('responseTime'),
                'queryId': data.get('queryId')
            },
            'timestamp': datetime.now().isoformat()
        })
        
        st.rerun()
    else:
        st.error(f"Error: {result.get('error', 'Unknown error occurred')}")

# Feedback section for last response
if st.session_state.chat_history:
    last_msg = st.session_state.chat_history[-1]
    if last_msg.get('role') == 'assistant' and last_msg.get('metadata', {}).get('queryId'):
        st.divider()
        st.subheader("📝 Feedback")
        
        query_id = last_msg['metadata']['queryId']
        col_fb1, col_fb2, col_fb3 = st.columns([1, 1, 2])
        
        with col_fb1:
            if st.button("👍 Helpful", key="helpful_btn", use_container_width=True):
                result = submit_feedback(query_id, "helpful")
                if result.get('success'):
                    st.success("Thanks for your feedback!")
                else:
                    st.error("Failed to submit feedback")
        
        with col_fb2:
            if st.button("👎 Not Helpful", key="not_helpful_btn", use_container_width=True):
                result = submit_feedback(query_id, "not_helpful")
                if result.get('success'):
                    st.success("Thanks for your feedback!")
                else:
                    st.error("Failed to submit feedback")

# Footer
st.divider()
st.markdown("""
<div style="text-align: center; color: #6b7280; font-size: 0.85rem;">
    <p>⚠️ <strong>Disclaimer:</strong> This AI assistant provides general information about yoga and is not a substitute for professional medical advice. 
    Always consult healthcare professionals for medical concerns.</p>
    <p>Built with ❤️ for wellness and yoga education</p>
</div>
""", unsafe_allow_html=True)
