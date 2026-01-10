/**
 * RAG Initialization Script
 * Run this script to build the vector index from the knowledge base
 * 
 * Usage: node scripts/initRAG.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initializeRAG, getRAGStatus, loadKnowledgeBase } = require('../src/services/rag.service');

const main = async () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🧘 Yoga RAG Pipeline Initialization 🧘             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Show current status
    console.log('📊 Current RAG Status:');
    const statusBefore = getRAGStatus();
    console.log(`   - Initialized: ${statusBefore.initialized}`);
    console.log(`   - Vector Count: ${statusBefore.vectorCount || 0}`);
    console.log(`   - Index Exists: ${statusBefore.indexExists}\n`);

    // Load and show knowledge base info
    console.log('📚 Loading Knowledge Base...');
    const articles = loadKnowledgeBase();
    console.log(`   - Total Articles: ${articles.length}`);
    
    // Count by category
    const categories = {};
    articles.forEach(a => {
      categories[a.category] = (categories[a.category] || 0) + 1;
    });
    console.log('   - Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`     • ${cat}: ${count} articles`);
    });
    console.log('');

    // Initialize RAG pipeline
    console.log('🚀 Initializing RAG Pipeline...\n');
    const stats = await initializeRAG();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ Initialization Complete                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Final RAG Status:');
    console.log(`   - Vector Count: ${stats.vectorCount}`);
    console.log(`   - Dimension: ${stats.dimension}`);
    console.log(`   - Index Path: ${stats.indexPath}`);
    console.log('\n🎉 The RAG pipeline is ready to use!');
    console.log('   Start the server with: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

main();
