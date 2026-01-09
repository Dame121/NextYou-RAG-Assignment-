const { SAFETY_KEYWORDS, SAFETY_MESSAGES, SAFE_ALTERNATIVES } = require('../constants/safety.constants');

/**
 * Check if a query contains unsafe keywords
 * @param {string} query - The user's query
 * @returns {Object} - { isUnsafe, detectedKeywords, categories }
 */
const checkSafetyKeywords = (query) => {
  const lowercaseQuery = query.toLowerCase();
  const detectedKeywords = [];
  const categories = [];

  for (const [category, keywords] of Object.entries(SAFETY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowercaseQuery.includes(keyword)) {
        detectedKeywords.push(keyword);
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }
  }

  return {
    isUnsafe: detectedKeywords.length > 0,
    detectedKeywords,
    categories
  };
};

/**
 * Generate a safety warning message based on detected categories
 * @param {string[]} categories - Detected safety categories
 * @returns {string} - Safety warning message
 */
const generateSafetyWarning = (categories) => {
  let warning = SAFETY_MESSAGES.general + "\n\n";

  if (categories.includes('pregnancy')) {
    warning += SAFETY_MESSAGES.pregnancy + "\n\n";
  }

  if (categories.includes('medical_conditions') || categories.includes('age_related')) {
    warning += SAFETY_MESSAGES.medical + "\n\n";
  }

  warning += SAFETY_MESSAGES.consultation + "\n\n";
  warning += SAFETY_MESSAGES.disclaimer;

  return warning;
};

/**
 * Generate safe recommendations based on query content
 * @param {string} query - The user's query
 * @returns {string} - Safe alternative recommendation
 */
const generateSafeRecommendation = (query) => {
  const lowercaseQuery = query.toLowerCase();
  let recommendations = [];

  if (lowercaseQuery.includes('headstand') || lowercaseQuery.includes('inversion') || 
      lowercaseQuery.includes('shoulderstand') || lowercaseQuery.includes('handstand')) {
    recommendations.push(SAFE_ALTERNATIVES.inversions);
  }

  if (lowercaseQuery.includes('backbend') || lowercaseQuery.includes('wheel') || 
      lowercaseQuery.includes('cobra') || lowercaseQuery.includes('upward dog')) {
    recommendations.push(SAFE_ALTERNATIVES.intense_backbends);
  }

  if (lowercaseQuery.includes('twist') || lowercaseQuery.includes('rotation')) {
    recommendations.push(SAFE_ALTERNATIVES.deep_twists);
  }

  if (lowercaseQuery.includes('forward') || lowercaseQuery.includes('fold') || 
      lowercaseQuery.includes('bend')) {
    recommendations.push(SAFE_ALTERNATIVES.intense_forward_bends);
  }

  if (lowercaseQuery.includes('balance') || lowercaseQuery.includes('tree pose') || 
      lowercaseQuery.includes('standing on one')) {
    recommendations.push(SAFE_ALTERNATIVES.balance_poses);
  }

  if (recommendations.length === 0) {
    recommendations.push(SAFE_ALTERNATIVES.general);
  }

  return recommendations.join("\n\n");
};

/**
 * Process query through safety filter
 * @param {string} query - The user's query
 * @returns {Object} - Complete safety analysis
 */
const processSafetyFilter = (query) => {
  const safetyCheck = checkSafetyKeywords(query);

  if (!safetyCheck.isUnsafe) {
    return {
      isUnsafe: false,
      safetyKeywordsDetected: [],
      safetyWarning: '',
      safeRecommendation: ''
    };
  }

  return {
    isUnsafe: true,
    safetyKeywordsDetected: safetyCheck.detectedKeywords,
    safetyWarning: generateSafetyWarning(safetyCheck.categories),
    safeRecommendation: generateSafeRecommendation(query)
  };
};

module.exports = {
  checkSafetyKeywords,
  generateSafetyWarning,
  generateSafeRecommendation,
  processSafetyFilter
};
