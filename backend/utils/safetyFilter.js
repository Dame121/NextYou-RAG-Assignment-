// Safety keywords for detecting unsafe queries
const SAFETY_KEYWORDS = {
  pregnancy: [
    'pregnant', 'pregnancy', 'first trimester', 'second trimester', 'third trimester',
    'expecting', 'prenatal', 'expecting a baby', 'with child', 'gestational'
  ],
  medical_conditions: [
    'hernia', 'glaucoma', 'high blood pressure', 'hypertension', 'low blood pressure',
    'heart disease', 'heart condition', 'cardiac', 'surgery', 'recent surgery',
    'post surgery', 'after surgery', 'knee injury', 'back injury', 'spine injury',
    'slipped disc', 'herniated disc', 'sciatica', 'arthritis', 'osteoporosis',
    'vertigo', 'dizziness', 'epilepsy', 'seizure', 'diabetes', 'asthma',
    'carpal tunnel', 'rotator cuff', 'torn ligament', 'fracture', 'broken bone'
  ],
  age_related: [
    'elderly', 'senior citizen', 'old age', 'aging', 'geriatric'
  ],
  mental_health: [
    'anxiety disorder', 'panic attacks', 'severe depression', 'ptsd'
  ]
};

// Safety warning messages
const SAFETY_MESSAGES = {
  general: "Your question touches on an area that can be risky without personalized guidance.",
  pregnancy: "Yoga during pregnancy requires special modifications and supervision. Many poses are contraindicated, especially inversions and deep twists.",
  medical: "Given your health condition, certain yoga practices may need to be modified or avoided entirely.",
  consultation: "Please consult a doctor or certified yoga therapist before attempting these poses.",
  disclaimer: "This information is for educational purposes only and should not replace professional medical advice."
};

// Safe alternatives for risky practices
const SAFE_ALTERNATIVES = {
  inversions: "Instead of headstands or shoulderstands, consider gentle supine poses like Legs-Up-The-Wall (Viparita Karani) with proper support.",
  intense_backbends: "Instead of deep backbends, try gentle chest openers like supported Bridge pose with a block.",
  deep_twists: "Instead of deep twists, practice gentle seated twists with mindful breathing.",
  intense_forward_bends: "Instead of intense forward folds, try supported forward bends with bent knees.",
  balance_poses: "Instead of challenging balance poses, practice near a wall for support.",
  general: "Focus on gentle breathing exercises (pranayama), meditation, and restorative poses under professional guidance."
};

/**
 * Check if a query contains unsafe keywords
 * @param {string} query - The user's query
 * @returns {Object} - { isUnsafe, detectedKeywords, categories }
 */
const checkSafetyKeywords = (query) => {
  const lowercaseQuery = query.toLowerCase();
  const detectedKeywords = [];
  const categories = [];

  // Check each category
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

  // If no specific recommendation, provide general guidance
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
  SAFETY_KEYWORDS,
  SAFETY_MESSAGES,
  SAFE_ALTERNATIVES,
  checkSafetyKeywords,
  generateSafetyWarning,
  generateSafeRecommendation,
  processSafetyFilter
};
