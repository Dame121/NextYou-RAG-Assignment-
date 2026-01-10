/**
 * Chunking Service
 * Handles text chunking strategies for the RAG pipeline
 */

/**
 * Chunk text into smaller pieces with overlap
 * @param {string} text - The text to chunk
 * @param {Object} options - Chunking options
 * @returns {string[]} - Array of text chunks
 */
const chunkText = (text, options = {}) => {
  const {
    chunkSize = 500,        // Target chunk size in characters
    chunkOverlap = 50,      // Overlap between chunks
    separator = '\n'        // Preferred split point
  } = options;

  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // If we're not at the end, try to find a good break point
    if (endIndex < text.length) {
      // Look for separator within the chunk
      const lastSeparator = text.lastIndexOf(separator, endIndex);
      
      // If we found a separator after the start, use it
      if (lastSeparator > startIndex + chunkSize / 2) {
        endIndex = lastSeparator + 1;
      } else {
        // Look for sentence endings
        const lastPeriod = text.lastIndexOf('. ', endIndex);
        if (lastPeriod > startIndex + chunkSize / 2) {
          endIndex = lastPeriod + 2;
        }
      }
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    // Move start index forward, accounting for overlap
    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
};

/**
 * Chunk an article into semantic chunks with metadata
 * @param {Object} article - Article object from knowledge base
 * @param {Object} options - Chunking options
 * @returns {Object[]} - Array of chunk objects with metadata
 */
const chunkArticle = (article, options = {}) => {
  const chunks = chunkText(article.content, options);
  
  return chunks.map((chunkText, index) => ({
    chunkId: `${article.articleId}-chunk-${index}`,
    articleId: article.articleId,
    title: article.title,
    content: chunkText,
    category: article.category,
    tags: article.tags || [],
    source: article.source || 'Self-written',
    difficulty: article.difficulty || 'all-levels',
    safetyNotes: article.safetyNotes || '',
    chunkIndex: index,
    totalChunks: chunks.length
  }));
};

/**
 * Chunk all articles from knowledge base
 * @param {Object[]} articles - Array of article objects
 * @param {Object} options - Chunking options
 * @returns {Object[]} - Array of all chunk objects
 */
const chunkAllArticles = (articles, options = {}) => {
  const allChunks = [];
  
  for (const article of articles) {
    const articleChunks = chunkArticle(article, options);
    allChunks.push(...articleChunks);
  }
  
  console.log(`📄 Chunked ${articles.length} articles into ${allChunks.length} chunks`);
  return allChunks;
};

module.exports = {
  chunkText,
  chunkArticle,
  chunkAllArticles
};
