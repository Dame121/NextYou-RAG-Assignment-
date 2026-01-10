# Frontend - ChatGPT-Style Streamlit UI

A modern ChatGPT-style user interface for the Yoga RAG Wellness Assistant built with Streamlit.

## Features

### 🎨 ChatGPT-Style Interface
- **Dark theme** with modern design matching ChatGPT aesthetics
- **Sidebar chat history** with conversation management
- **User/Assistant message bubbles** styled distinctly
- **Smooth animations** and transitions

### 💬 Chat Features
- **Conversation management** - Create, switch, and delete chat sessions
- **Chat history persistence** - View and continue previous conversations
- **New chat button** - Start fresh conversations easily
- **Today/Previous grouping** - Organized chat history

### 📚 RAG Display
- **Source attribution** - View which knowledge base articles were used
- **Relevance scores** - See how relevant each source is
- **Expandable sources section** - Clean UI that doesn't clutter

### ⚠️ Safety Features
- **Red safety warning blocks** - Prominent alerts for unsafe queries
- **Detected keywords display** - Shows what triggered the safety filter
- **Safe alternatives** - Suggestions for safer practices
- **Professional disclaimer** - Reminder to consult healthcare providers

### 👍 Feedback System
- **Helpful/Not Helpful/Neutral** buttons
- **Feedback confirmation** - Visual feedback when submitted
- **Per-message feedback** - Rate each response individually

### 📊 System Status
- **Backend connection status** - Shows if server is online/offline
- **Knowledge base stats** - Number of articles and vectors

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
```

## Requirements

- Python 3.9+
- Backend server running on http://localhost:3000

## UI Components

### Sidebar
- New Chat button
- Chat history with Today/Previous grouping
- Safety demo queries
- System status monitor
- Clear all chats option

### Main Area
- Welcome screen with example queries
- Conversation display with styled messages
- Sources expandable section
- Feedback buttons

### Input Section
- Text area for queries
- Send button
- Always visible at bottom

## Color Scheme

- **Background**: #343541 (Dark gray)
- **Sidebar**: #202123 (Darker gray)
- **User Avatar**: Purple gradient
- **Assistant Avatar**: Green gradient (#10a37f)
- **Safety Warnings**: Red (#ef4444)
- **Sources**: Green (#10b981)
- **Alternatives**: Yellow/Amber (#fbbf24)
- **Disclaimer**: Blue (#3b82f6)

