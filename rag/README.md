# RAG Resources

This folder contains the knowledge base and RAG-related resources.

## Knowledge Base

The `knowledge_base/articles.json` file contains 34 curated yoga articles covering:

| Category | Count | Description |
|----------|-------|-------------|
| Asanas | 15 | Yoga poses (beginner to advanced) |
| Pranayama | 5 | Breathing techniques |
| Benefits | 3 | Physical and mental benefits |
| Contraindications | 4 | Safety warnings and modifications |
| Beginner | 2 | Getting started guides |
| Advanced | 2 | Advanced practice guides |
| General | 3 | Yoga philosophy and styles |

## Sources

Articles are based on:
- Traditional Hatha Yoga teachings
- Iyengar Yoga methodology
- Ashtanga Vinyasa tradition
- Yoga therapy guidelines
- Prenatal yoga guidelines

## Adding New Articles

To add new articles, edit `knowledge_base/articles.json` and follow this schema:

```json
{
  "articleId": "unique-id",
  "title": "Article Title",
  "content": "Full article content...",
  "category": "asanas|pranayama|benefits|contraindications|beginner|advanced|general",
  "tags": ["tag1", "tag2"],
  "source": "Source citation",
  "difficulty": "beginner|intermediate|advanced|all-levels",
  "safetyNotes": "Safety considerations..."
}
```

After adding articles, re-run the initialization script:

```bash
cd backend
npm run init-rag
```
