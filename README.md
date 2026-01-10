# Wellness RAG Micro-App: "Ask Me Anything About Yoga" 🧘

A full-stack AI micro-product that answers yoga & fitness related queries using a RAG (Retrieval-Augmented Generation) pipeline.

## 🎯 Project Overview

This application provides intelligent, context-aware answers about yoga poses, breathing techniques, meditation practices, and wellness topics. It uses RAG to retrieve relevant information from a curated knowledge base before generating responses, ensuring accurate and grounded answers.

### Key Features

- **RAG Pipeline**: Retrieves relevant context from 34 yoga articles before generating responses
- **Safety Detection**: Automatically flags queries about pregnancy, medical conditions, and other health-sensitive topics
- **Source Attribution**: Shows which knowledge base articles were used for each answer
- **Feedback System**: Users can rate responses as helpful or not helpful
- **MongoDB Logging**: All queries, responses, and interactions are logged for analysis

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Streamlit (Python) |
| **Backend** | Node.js + Express |
| **Database** | MongoDB |
| **Vector Store** | In-memory with cosine similarity |
| **Embeddings** | Ollama (nomic-embed-text) |
| **LLM** | Ollama (custom yoga model) |

## 📁 Project Structure

```
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── constants/      # Safety keywords & messages
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic & RAG pipeline
│   │   └── app.js          # Express app entry point
│   ├── scripts/
│   │   └── initRAG.js      # RAG initialization script
│   └── package.json
│
├── frontend/               # Streamlit UI
│   ├── app.py             # Main Streamlit application
│   └── requirements.txt   # Python dependencies
│
├── rag/                    # RAG resources
│   └── knowledge_base/
│       └── articles.json  # 34 yoga articles
│
└── README.md
```

## 🚀 Quick Start (Easiest Way)

### Prerequisites
Make sure these are running before starting:
- **MongoDB**: `mongod`
- **Ollama**: `ollama serve`

### One-Click Start

**Option 1: PowerShell Script (Recommended)**
```powershell
.\start.ps1
```

**Option 2: Batch File (Double-click)**
```
start.bat
```

**Option 3: Manual Start**
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && streamlit run app.py
```

### Stop All Services
```powershell
.\stop.ps1
```

### Access Points
- 🎨 **Frontend**: http://localhost:8501
- 🔧 **Backend API**: http://localhost:3000
- 💚 **Health Check**: http://localhost:3000/health

---

## 🛠️ Full Setup Instructions

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running locally or connection string)
- Ollama with models:
  - `nomic-embed-text` (for embeddings)
  - `yoga` or any LLM model (for generation)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yoga-rag-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Initialize RAG pipeline (generates embeddings)
npm run init-rag

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Streamlit
streamlit run app.py
```

### 4. Access the Application

- **Frontend**: http://localhost:8501
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ask` | Submit a yoga question |
| GET | `/api/ask/history` | Get query history |
| POST | `/api/feedback` | Submit feedback for a response |
| GET | `/api/feedback/stats` | Get feedback statistics |
| GET | `/api/rag/status` | Check RAG pipeline status |
| GET | `/health` | Health check |

### Example Request

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the benefits of meditation?"}'
```

## 🔒 Safety Logic

The system implements a safety layer that detects potentially risky queries:

### Detected Categories
- **Pregnancy**: "pregnant", "trimester", "prenatal"
- **Medical Conditions**: "hernia", "glaucoma", "high blood pressure", "surgery"
- **Age-Related**: "elderly", "senior citizen"

### Safety Response Behavior
When an unsafe query is detected:
1. Query is flagged with `isUnsafe: true`
2. Safety warning is included in response
3. Safer alternatives are suggested
4. User is advised to consult healthcare professionals

## 📚 RAG Pipeline Design

### 1. Knowledge Base
- 34 curated yoga articles
- Categories: asanas, pranayama, benefits, contraindications, beginner, advanced, general

### 2. Chunking Strategy
- Chunk size: 500 characters
- Overlap: 50 characters
- Preserves sentence boundaries when possible

### 3. Embeddings
- Model: `nomic-embed-text` via Ollama
- Dimension: 768
- Total vectors: 66 chunks

### 4. Retrieval
- Cosine similarity search
- Top-K: 5 chunks
- Similarity threshold: 0.3

### 5. Prompt Construction
- System prompt with yoga instructor persona
- Retrieved context formatted with source attribution
- Safety-aware prompting for flagged queries

## 📊 Data Models

### QueryLog Schema
```javascript
{
  userQuery: String,
  retrievedChunks: [{
    chunkId: String,
    title: String,
    content: String,
    source: String,
    similarityScore: Number
  }],
  aiAnswer: String,
  isUnsafe: Boolean,
  safetyKeywordsDetected: [String],
  safetyWarning: String,
  safeRecommendation: String,
  responseTime: Number,
  sessionId: String,
  createdAt: Date
}
```

### Feedback Schema
```javascript
{
  queryId: ObjectId,
  rating: String, // 'helpful' | 'not_helpful'
  comment: String,
  createdAt: Date
}
```

## 🎬 Demo

[Add demo video link here]

## 🤖 AI Tools & Prompts Used

This project was built with assistance from GitHub Copilot. Key prompts used:

1. "Connect to the ollama model called yoga and make it work using the ollama package"
2. "Create a simple UI using streamlit to test the backend"
3. "Implement the RAG design following the assessment requirements"

## 📄 License

ISC

## ⚠️ Disclaimer

This application is for educational purposes only. The information provided should not replace professional medical advice. Always consult healthcare professionals for medical concerns.

---

Built with ❤️ for wellness and yoga education
