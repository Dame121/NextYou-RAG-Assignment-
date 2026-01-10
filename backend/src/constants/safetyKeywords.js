// Enhanced safety keywords for detecting potentially risky queries

const SAFETY_KEYWORDS = {
  pregnancy: [
    'pregnant',
    'pregnancy',
    'first trimester',
    'second trimester',
    'third trimester',
    'trimester',
    'prenatal',
    'postnatal',
    'postpartum',
    'expecting',
    'expecting a baby',
    'baby bump',
    'morning sickness',
    'gestational',
    'conceived',
    'conception',
    'maternity',
    'breastfeeding',
    'nursing mother'
  ],

  cardiovascular: [
    'high blood pressure',
    'hypertension',
    'low blood pressure',
    'hypotension',
    'heart disease',
    'heart condition',
    'heart attack',
    'cardiac',
    'cardiovascular',
    'arrhythmia',
    'palpitations',
    'stroke',
    'blood clot',
    'thrombosis',
    'aneurysm'
  ],

  musculoskeletal: [
    'hernia',
    'herniated disc',
    'slipped disc',
    'back injury',
    'spine injury',
    'spinal cord',
    'scoliosis',
    'sciatica',
    'arthritis',
    'osteoporosis',
    'fracture',
    'broken bone',
    'torn ligament',
    'torn muscle',
    'rotator cuff',
    'knee injury',
    'hip replacement',
    'joint replacement',
    'carpal tunnel',
    'tendonitis'
  ],

  eyeConditions: [
    'glaucoma',
    'detached retina',
    'retinal detachment',
    'eye surgery',
    'lasik',
    'cataract',
    'eye pressure',
    'macular degeneration'
  ],

  surgeryRecovery: [
    'recent surgery',
    'post surgery',
    'post-surgery',
    'after surgery',
    'recovering from surgery',
    'surgical',
    'operation',
    'post-operative',
    'postoperative',
    'stitches',
    'incision'
  ],

  neurologicalConditions: [
    'epilepsy',
    'seizure',
    'vertigo',
    'dizziness',
    'migraine',
    'concussion',
    'head injury',
    'brain injury',
    'multiple sclerosis',
    'parkinsons',
    "parkinson's",
    'neuropathy'
  ],

  respiratoryConditions: [
    'asthma',
    'copd',
    'bronchitis',
    'emphysema',
    'breathing difficulty',
    'shortness of breath',
    'respiratory condition',
    'lung disease',
    'pneumonia'
  ],

  otherConditions: [
    'diabetes',
    'diabetic',
    'kidney disease',
    'liver disease',
    'cancer',
    'tumor',
    'chemotherapy',
    'radiation therapy',
    'autoimmune',
    'lupus',
    'fibromyalgia',
    'chronic fatigue',
    'chronic pain',
    'infection',
    'fever',
    'inflammation',
    'swelling'
  ],

  ageRelated: [
    'elderly',
    'senior citizen',
    'senior',
    'old age',
    'aging',
    'aged',
    '70 years',
    '80 years',
    '90 years',
    'geriatric'
  ],

  mentalHealth: [
    'anxiety',
    'depression',
    'anxiety disorder',
    'panic attack',
    'panic disorder',
    'ptsd',
    'trauma',
    'severe depression',
    'clinical depression',
    'bipolar',
    'schizophrenia',
    'stress',
    'mental health',
    'suicidal',
    'self-harm'
  ]
};

// Flatten all keywords for quick lookup
const ALL_SAFETY_KEYWORDS = Object.values(SAFETY_KEYWORDS).flat();

// Function to detect safety keywords in a query
const detectSafetyKeywords = (query) => {
  const lowerQuery = query.toLowerCase();
  const detectedKeywords = [];
  const detectedCategories = new Set();

  for (const [category, keywords] of Object.entries(SAFETY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
        detectedCategories.add(category);
      }
    }
  }

  return {
    isUnsafe: detectedKeywords.length > 0,
    keywords: [...new Set(detectedKeywords)],
    categories: [...detectedCategories]
  };
};

module.exports = {
  SAFETY_KEYWORDS,
  ALL_SAFETY_KEYWORDS,
  detectSafetyKeywords
};