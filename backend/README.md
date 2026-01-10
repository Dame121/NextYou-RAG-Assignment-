# Backend - Node.js Express API

Express.js backend with RAG pipeline integration.

## Features

- RESTful API for yoga queries
- RAG pipeline with vector search
- Safety detection and filtering
- MongoDB logging
- Ollama LLM integration

## Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Initialize RAG pipeline
npm run init-rag

# Start development server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (hot reload) |
| `npm run init-rag` | Build vector index from knowledge base |

## API Endpoints

- `POST /api/ask` - Submit a yoga question
- `GET /api/ask/history` - Get query history
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/stats` - Get feedback statistics
- `GET /api/rag/status` - Check RAG status
- `GET /health` - Health check

## Environment Variables

See `.env.example` for required configuration.
