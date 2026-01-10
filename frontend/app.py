import streamlit as st
import requests
import time

# Configuration
API_URL = "http://localhost:3000/api/ask"

# Page configuration
st.set_page_config(
    page_title="🧘 Yoga Assistant",
    page_icon="🧘",
    layout="centered"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1rem 0;
    }
    .response-box {
        background-color: #f0f7f0;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #4CAF50;
        margin: 1rem 0;
    }
    .safety-warning {
        background-color: #fff3e0;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #ff9800;
        margin: 1rem 0;
    }
    .stats-box {
        background-color: #e3f2fd;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("<h1 class='main-header'>🧘 Ask Me Anything About Yoga</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #666;'>Your AI-powered yoga assistant for poses, breathing, meditation, and wellness</p>", unsafe_allow_html=True)

st.divider()

# Initialize session state for chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"], avatar="🧑" if message["role"] == "user" else "🧘"):
        st.markdown(message["content"])
        if message["role"] == "assistant" and "response_time" in message:
            st.caption(f"⏱️ Response time: {message['response_time']}")

# Chat input
if prompt := st.chat_input("Ask a yoga question... (e.g., 'What is the best pose for back pain?')"):
    # Add user message to chat
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user", avatar="🧑"):
        st.markdown(prompt)
    
    # Get AI response
    with st.chat_message("assistant", avatar="🧘"):
        with st.spinner("🧘 Consulting the yoga wisdom..."):
            try:
                response = requests.post(
                    API_URL,
                    json={"query": prompt},
                    timeout=120
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("success"):
                        result = data["data"]
                        answer = result["answer"]
                        response_time = result.get("responseTime", "N/A")
                        is_unsafe = result.get("isUnsafe", False)
                        
                        # Display safety warning if applicable
                        if is_unsafe:
                            st.warning("⚠️ Safety Notice")
                        
                        # Display the answer
                        st.markdown(answer)
                        st.caption(f"⏱️ Response time: {response_time}")
                        
                        # Add to session state
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": answer,
                            "response_time": response_time,
                            "is_unsafe": is_unsafe
                        })
                    else:
                        error_msg = "Failed to get a response from the server."
                        st.error(error_msg)
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": f"❌ {error_msg}"
                        })
                else:
                    error_msg = f"Server error: {response.status_code}"
                    st.error(error_msg)
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": f"❌ {error_msg}"
                    })
                    
            except requests.exceptions.ConnectionError:
                error_msg = "Cannot connect to the backend server. Make sure it's running on http://localhost:3000"
                st.error(error_msg)
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": f"❌ {error_msg}"
                })
            except requests.exceptions.Timeout:
                error_msg = "Request timed out. The server took too long to respond."
                st.error(error_msg)
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": f"❌ {error_msg}"
                })
            except Exception as e:
                error_msg = f"An error occurred: {str(e)}"
                st.error(error_msg)
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": f"❌ {error_msg}"
                })

# Sidebar
with st.sidebar:
    st.header("🧘 Yoga Assistant")
    st.markdown("---")
    
    st.subheader("💡 Example Questions")
    example_questions = [
        "What are the benefits of meditation?",
        "How do I do a proper sun salutation?",
        "Best yoga poses for beginners?",
        "How can yoga help with stress?",
        "What is pranayama breathing?",
        "Yoga poses for back pain relief?"
    ]
    
    for q in example_questions:
        if st.button(q, key=q, use_container_width=True):
            st.session_state.example_query = q
            st.rerun()
    
    st.markdown("---")
    
    # Clear chat button
    if st.button("🗑️ Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.rerun()
    
    st.markdown("---")
    st.caption("Powered by Ollama 🦙")
    st.caption("Backend: Node.js + MongoDB")

# Handle example query selection
if "example_query" in st.session_state:
    query = st.session_state.example_query
    del st.session_state.example_query
    
    # Add user message
    st.session_state.messages.append({"role": "user", "content": query})
    
    # Get response
    try:
        response = requests.post(API_URL, json={"query": query}, timeout=120)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                result = data["data"]
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": result["answer"],
                    "response_time": result.get("responseTime", "N/A")
                })
    except:
        st.session_state.messages.append({
            "role": "assistant",
            "content": "❌ Failed to get response"
        })
    
    st.rerun()
