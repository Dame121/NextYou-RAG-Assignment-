// Safety service for detecting and handling unsafe queries

const { detectSafetyKeywords } = require('../constants/safetyKeywords');
const { formatSafetyResponse, getSafetyMessage } = require('../constants/safetyMessages');

class SafetyService {
  /**
   * Check if a query contains safety-related keywords
   * @param {string} query - The user's query
   * @returns {Object} - Safety check result
   */
  checkQuery(query) {
    if (!query || typeof query !== 'string') {
      return {
        isUnsafe: false,
        keywords: [],
        categories: [],
        safetyResponse: null
      };
    }

    const detection = detectSafetyKeywords(query);

    if (!detection.isUnsafe) {
      return {
        isUnsafe: false,
        keywords: [],
        categories: [],
        safetyResponse: null
      };
    }

    const safetyResponse = formatSafetyResponse(
      detection.categories,
      detection.keywords
    );

    return {
      isUnsafe: true,
      keywords: detection.keywords,
      categories: detection.categories,
      safetyResponse
    };
  }

  /**
   * Generate a safe AI response for unsafe queries
   * @param {string} query - The original query
   * @param {Object} safetyCheck - The safety check result
   * @param {string} ragContext - The RAG context (optional)
   * @returns {string} - Safe response with warnings
   */
  generateSafeResponse(query, safetyCheck, ragContext = '') {
    const { safetyResponse, categories } = safetyCheck;
    const message = getSafetyMessage(categories);

    let response = `${message.warning}\n\n`;

    // Add some helpful context if available
    if (ragContext) {
      response += `**General Information (for educational purposes only):**\n`;
      response += `Based on general yoga knowledge, here's some context that might be helpful:\n\n`;
      response += `${ragContext}\n\n`;
      response += `---\n\n`;
    }

    response += `**Safe Alternatives:**\n${message.recommendation}\n\n`;
    response += `**Important Notice:**\n${message.disclaimer}\n\n`;
    response += `---\n`;
    response += `*This response has been flagged for safety because your query mentioned: ${safetyCheck.keywords.join(', ')}*`;

    return response;
  }

  /**
   * Get alternative safe poses for common risky poses
   * @param {string} riskyPose - The risky pose mentioned
   * @param {string} condition - The health condition
   * @returns {string[]} - Array of safer alternatives
   */
  getSafeAlternatives(riskyPose, condition) {
    const alternatives = {
      headstand: ['Legs Up the Wall (Viparita Karani)', 'Supported Child\'s Pose', 'Gentle Forward Fold with support'],
      shoulderstand: ['Legs Up the Wall', 'Supported Bridge Pose', 'Reclined Bound Angle Pose'],
      'wheel pose': ['Supported Bridge Pose', 'Cobra Pose', 'Cat-Cow Stretches'],
      'deep twist': ['Gentle Seated Twist', 'Supine Twist with knees together', 'Simple neck rotations'],
      'crow pose': ['Malasana (Squat)', 'Plank with knees down', 'Chair pose'],
      'hot yoga': ['Gentle Hatha Yoga', 'Restorative Yoga', 'Yin Yoga'],
      'power yoga': ['Gentle Flow', 'Hatha Yoga', 'Restorative Yoga'],
      inversions: ['Legs Up the Wall', 'Supported Shoulderstand against wall', 'Gentle forward folds']
    };

    const lowerPose = riskyPose.toLowerCase();
    
    for (const [pose, alts] of Object.entries(alternatives)) {
      if (lowerPose.includes(pose)) {
        return alts;
      }
    }

    // Default safe alternatives
    return [
      'Gentle Cat-Cow Stretches',
      'Supported Child\'s Pose',
      'Seated Meditation',
      'Gentle Breathing Exercises (without retention)'
    ];
  }
}

module.exports = new SafetyService();
