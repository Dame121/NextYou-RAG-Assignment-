import streamlit as st
import requests

# Configuration
API_URL = "http://localhost:3000/api/ask"
RAG_STATUS_URL = "http://localhost:3000/api/rag/status"
FEEDBACK_URL = "http://localhost:3000/api/feedback"

# Page configuration
st.set_page_config(
    page_title="🧘 Yoga Assistant - RAG",
    page_icon="🧘",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1rem 0;
    }
    .source-box {
        background-color: #e8f4ea;
        padding: 0.8rem;
        border-radius: 8px;
        border-left: 3px solid #4CAF50;
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }
    .safety-warning {
        background-color: #fff3e0;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #ff9800;
        margin: 1rem 0;
    }
    .answer-box {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("<h1 class='main-header'>🧘 Ask Me Anything About Yoga</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #666;'>AI-powered yoga assistant with RAG (Retrieval-Augmented Generation)</p>", unsafe_allow_html=True)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "last_sources" not in st.session_state:
    st.session_state.last_sources = []
if "last_is_unsafe" not in st.session_state:
    st.session_state.last_is_unsafe = False
if "last_query_id" not in st.session_state:
    st.session_state.last_query_id = None

# Sidebar
with st.sidebar:
    st.header("🧘 Yoga RAG Assistant")
    
    # RAG Status
    st.subheader("📊 System Status")
    try:
        status_response = requests.get(RAG_STATUS_URL, timeout=5)
        if status_response.status_code == 200:
            status_data = status_response.json()
            if status_data.get("success"):
                rag_status = status_data["data"]
                st.success("✅ RAG System Online")
                col1, col2 = st.columns(2)
                with col1:
                    st.metric("Vectors", rag_status.get("vectorCount", 0))
                with col2:
                    st.metric("Dim", rag_status.get("dimension", "N/A"))
        else:
            st.warning("⚠️ Could not fetch status")
    except:
        st.error("❌ Backend offline")
    
    st.markdown("---")
    
    st.subheader("💡 Try These Questions")
    example_questions = [
        "Benefits of meditation?",
        "How to do downward dog?",
        "Beginner yoga poses?",
        "What is pranayama?",
        "Yoga for stress relief?",
        "Inversion contraindications?"
    ]
    
    for q in example_questions:
        if st.button(q, key=f"ex_{q}", use_container_width=True):
            st.session_state.pending_query = q
    
    st.markdown("---")
    
    if st.button("🗑️ Clear Chat", use_container_width=True):
        st.session_state.messages = []
        st.session_state.last_sources = []
        st.session_state.last_is_unsafe = False
        st.session_state.last_query_id = None
        st.rerun()
    
    st.markdown("---")
    st.caption("Powered by Ollama 🦙")
    st.caption("RAG with Vector Search")

# Main layout
col_chat, col_sources = st.columns([2, 1])

with col_chat:
    st.subheader("💬 Conversation")
    
    # Chat container
    chat_container = st.container(height=450)
    with chat_container:
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"], avatar="🧑" if msg["role"] == "user" else "🧘"):
                st.markdown(msg["content"])
                if msg["role"] == "assistant" and msg.get("response_time"):
                    st.caption(f"⏱️ {msg['response_time']}")
    
    # Input
    query = st.chat_input("Ask about yoga poses, breathing, meditation...")
    
    # Handle example button clicks
    if "pending_query" in st.session_state:
        query = st.session_state.pending_query
        del st.session_state.pending_query

    if query:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": query})
        
        # Get response
        with st.spinner("🧘 Searching knowledge base..."):
            try:
                response = requests.post(API_URL, json={"query": query}, timeout=120)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        result = data["data"]
                        
                        # Store results
                        st.session_state.last_sources = result.get("sources", [])
                        st.session_state.last_is_unsafe = result.get("isUnsafe", False)
                        st.session_state.last_query_id = result.get("queryId")
                        
                        # Add assistant message
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": result["answer"],
                            "response_time": result.get("responseTime", "N/A"),
                            "sources": result.get("sources", []),
                            "is_unsafe": result.get("isUnsafe", False)
                        })
                    else:
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": "❌ Failed to get response"
                        })
                else:
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": f"❌ Server error: {response.status_code}"
                    })
            except requests.exceptions.ConnectionError:
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": "❌ Cannot connect to backend server"
                })
            except Exception as e:
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": f"❌ Error: {str(e)}"
                })
        
        st.rerun()

with col_sources:
    st.subheader("📚 Sources Used")
    
    sources = st.session_state.last_sources
    is_unsafe = st.session_state.last_is_unsafe
    query_id = st.session_state.last_query_id
    
    if sources:
        for i, source in enumerate(sources):
            title = source.get('title', f'Source {i+1}')
            with st.expander(f"📄 {title[:40]}..." if len(title) > 40 else f"📄 {title}", expanded=(i==0)):
                st.markdown(f"**Source:** {source.get('source', 'Knowledge Base')}")
                st.markdown(f"**Category:** {source.get('category', 'N/A')}")
                score = source.get('relevanceScore', 0)
                if score:
                    st.progress(float(score), text=f"Relevance: {float(score):.0%}")
    else:
        st.info("📝 Ask a question to see sources")
    
    st.markdown("---")
    
    # Safety Status
    st.subheader("🛡️ Safety Check")
    if is_unsafe:
        st.error("""
        ⚠️ **Health-Sensitive Query**
        
        Please consult a healthcare provider for personalized advice.
        """)
    elif query_id:
        st.success("✅ No safety concerns")
    else:
        st.info("Safety status will appear here")
    
    st.markdown("---")
    
    # Feedback
    st.subheader("📝 Was this helpful?")
    if query_id:
        c1, c2 = st.columns(2)
        with c1:
            if st.button("👍 Yes", use_container_width=True):
                try:
                    requests.post(FEEDBACK_URL, json={
                        "queryId": query_id,
                        "rating": "helpful"
                    }, timeout=5)
                    st.success("Thanks!")
                except:
                    pass
        with c2:
            if st.button("👎 No", use_container_width=True):
                try:
                    requests.post(FEEDBACK_URL, json={
                        "queryId": query_id,
                        "rating": "not_helpful"
                    }, timeout=5)
                    st.info("Thanks!")
                except:
                    pass
    else:
        st.caption("Ask a question first")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #888; font-size: 0.8rem;'>
    🧘 Wellness RAG Micro-App | Streamlit + Node.js + MongoDB + Ollama<br>
    ⚠️ For educational purposes only. Consult healthcare professionals for medical advice.
</div>
""", unsafe_allow_html=True)
