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

module.exports = {
  SAFETY_KEYWORDS,
  SAFETY_MESSAGES,
  SAFE_ALTERNATIVES
};
