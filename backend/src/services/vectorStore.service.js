/**
 * Vector Store Service
 * Simple in-memory vector store with cosine similarity search
 * Can be extended to use FAISS, Pinecone, etc.
 */

const fs = require('fs');
const path = require('path');
const { cosineSimilarity } = require('./embedding.service');

class VectorStore {
  constructor() {
    this.vectors = [];      // Array of { id, embedding, metadata }
    this.dimension = null;
    this.indexPath = path.join(__dirname, '../../data/vector_index.json');
  }

  /**
   * Initialize the vector store
   * @param {number} dimension - Embedding dimension
   */
  initialize(dimension) {
    this.dimension = dimension;
    this.vectors = [];
    console.log(`🗄️ Vector store initialized with dimension ${dimension}`);
  }

  /**
   * Add a vector to the store
   * @param {string} id - Unique identifier
   * @param {number[]} embedding - Vector embedding
   * @param {Object} metadata - Associated metadata
   */
  addVector(id, embedding, metadata = {}) {
    if (this.dimension && embedding.length !== this.dimension) {
      throw new Error(`Embedding dimension mismatch: expected ${this.dimension}, got ${embedding.length}`);
    }
    
    this.vectors.push({
      id,
      embedding,
      metadata
    });
  }

  /**
   * Add multiple vectors in batch
   * @param {Object[]} items - Array of { id, embedding, metadata }
   */
  addVectors(items) {
    for (const item of items) {
      this.addVector(item.id, item.embedding, item.metadata);
    }
    console.log(`📥 Added ${items.length} vectors to store (total: ${this.vectors.length})`);
  }

  /**
   * Search for similar vectors
   * @param {number[]} queryEmbedding - Query vector
   * @param {number} topK - Number of results to return
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Object[]} - Array of { id, score, metadata }
   */
  search(queryEmbedding, topK = 5, threshold = 0.5) {
    if (this.vectors.length === 0) {
      return [];
    }

    // Calculate similarities
    const results = this.vectors.map(item => ({
      id: item.id,
      score: cosineSimilarity(queryEmbedding, item.embedding),
      metadata: item.metadata
    }));

    // Filter by threshold and sort by score
    return results
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Get vector by ID
   * @param {string} id - Vector ID
   * @returns {Object|null} - Vector object or null
   */
  getById(id) {
    return this.vectors.find(v => v.id === id) || null;
  }

  /**
   * Save index to disk
   */
  save() {
    const dataDir = path.dirname(this.indexPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const data = {
      dimension: this.dimension,
      vectors: this.vectors,
      createdAt: new Date().toISOString(),
      count: this.vectors.length
    };

    fs.writeFileSync(this.indexPath, JSON.stringify(data));
    console.log(`💾 Saved vector index with ${this.vectors.length} vectors`);
  }

  /**
   * Load index from disk
   * @returns {boolean} - Whether load was successful
   */
  load() {
    try {
      if (!fs.existsSync(this.indexPath)) {
        console.log('⚠️ No vector index found');
        return false;
      }

      const data = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
      this.dimension = data.dimension;
      this.vectors = data.vectors;
      
      console.log(`📂 Loaded vector index with ${this.vectors.length} vectors`);
      return true;
    } catch (error) {
      console.error('Error loading vector index:', error.message);
      return false;
    }
  }

  /**
   * Check if index exists
   * @returns {boolean}
   */
  indexExists() {
    return fs.existsSync(this.indexPath);
  }

  /**
   * Get stats about the vector store
   * @returns {Object}
   */
  getStats() {
    return {
      vectorCount: this.vectors.length,
      dimension: this.dimension,
      indexPath: this.indexPath,
      indexExists: this.indexExists()
    };
  }

  /**
   * Clear all vectors
   */
  clear() {
    this.vectors = [];
    console.log('🗑️ Vector store cleared');
  }
}

// Export singleton instance
const vectorStore = new VectorStore();

module.exports = {
  vectorStore,
  VectorStore
};
