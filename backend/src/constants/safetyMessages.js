// Safety messages and recommendations for different conditions

const SAFETY_MESSAGES = {
  // Generic safety message
  generic: {
    warning: "⚠️ Your question touches on an area that can be risky without personalized guidance.",
    recommendation: "We recommend starting with gentle, restorative poses and always listening to your body.",
    disclaimer: "Please consult a doctor or certified yoga therapist before attempting these poses."
  },

  // Category-specific messages
  pregnancy: {
    warning: "⚠️ Pregnancy requires special considerations for yoga practice. Some poses may not be safe during different trimesters.",
    recommendation: "Instead of inversions or deep twists, consider gentle prenatal yoga poses like Cat-Cow, Modified Child's Pose, and gentle hip openers. Prenatal yoga classes with certified instructors are highly recommended.",
    disclaimer: "Please consult your OB-GYN or midwife before starting or continuing any yoga practice during pregnancy."
  },

  cardiovascular: {
    warning: "⚠️ Cardiovascular conditions require careful consideration when practicing yoga. Certain poses may affect blood pressure and heart rate.",
    recommendation: "Instead of vigorous flows or inversions, consider gentle seated poses, supported reclined poses, and slow, mindful breathing exercises (avoid breath retention). Avoid holding poses for extended periods.",
    disclaimer: "Please consult your cardiologist or healthcare provider before practicing yoga with any heart or blood pressure condition."
  },

  musculoskeletal: {
    warning: "⚠️ Musculoskeletal conditions require modified yoga practices to prevent further injury.",
    recommendation: "Instead of weight-bearing or deep stretching poses, consider gentle supported poses with props (blocks, bolsters, straps), chair yoga, or therapeutic yoga. Focus on gentle range of motion rather than deep stretches.",
    disclaimer: "Please consult your orthopedic specialist, physical therapist, or healthcare provider before practicing yoga."
  },

  eyeConditions: {
    warning: "⚠️ Eye conditions, especially glaucoma, can be aggravated by certain yoga poses that increase intraocular pressure.",
    recommendation: "Avoid all inversions (headstand, shoulderstand, forward folds with head below heart), and poses where the head is lower than the heart. Focus on gentle seated poses, standing poses with head upright, and breathing exercises.",
    disclaimer: "Please consult your ophthalmologist before practicing yoga with any eye condition."
  },

  surgeryRecovery: {
    warning: "⚠️ Post-surgical recovery requires careful, gradual return to physical activity including yoga.",
    recommendation: "Instead of active poses, consider gentle breathing exercises, meditation, and very gentle movements approved by your surgeon. Avoid any poses that strain the surgical area. Wait for medical clearance before resuming regular practice.",
    disclaimer: "Please consult your surgeon and follow their specific guidelines for returning to physical activity."
  },

  neurologicalConditions: {
    warning: "⚠️ Neurological conditions require special precautions during yoga practice.",
    recommendation: "Avoid poses that could cause falls or sudden position changes. Practice near a wall or with a chair for support. Focus on gentle, grounding poses and calming breathing exercises. Avoid rapid movements or breath retention.",
    disclaimer: "Please consult your neurologist before practicing yoga with any neurological condition."
  },

  respiratoryConditions: {
    warning: "⚠️ Respiratory conditions require modified breathing practices and gentle physical movements.",
    recommendation: "Avoid breath retention (kumbhaka) and forceful breathing techniques like Kapalabhati. Focus on gentle, natural breathing, and mild poses that don't compress the chest. Ujjayi breathing may be helpful when practiced gently.",
    disclaimer: "Please consult your pulmonologist or healthcare provider before practicing pranayama or yoga."
  },

  otherConditions: {
    warning: "⚠️ Your health condition requires personalized guidance for safe yoga practice.",
    recommendation: "Consider working with a certified yoga therapist who can create a customized practice for your specific needs. Start with gentle, restorative yoga and progress slowly.",
    disclaimer: "Please consult your healthcare provider before starting any yoga practice."
  },

  ageRelated: {
    warning: "⚠️ Yoga for seniors requires modifications to ensure safety and prevent falls.",
    recommendation: "Consider chair yoga, gentle standing poses with wall support, and seated practices. Focus on balance, gentle stretching, and breathing. Avoid poses that risk falls or require getting up and down from the floor frequently.",
    disclaimer: "Please consult your healthcare provider and consider working with a yoga instructor trained in senior/gentle yoga."
  },

  mentalHealth: {
    warning: "⚠️ Mental health conditions may require trauma-informed yoga practices.",
    recommendation: "Consider trauma-informed yoga classes, gentle restorative practices, and meditation with guidance. Avoid intense breathing practices that may trigger anxiety. Focus on grounding poses and body awareness.",
    disclaimer: "Please work with a mental health professional and consider yoga therapists trained in mental health."
  }
};

// Get safety message based on detected categories
const getSafetyMessage = (categories) => {
  if (!categories || categories.length === 0) {
    return SAFETY_MESSAGES.generic;
  }

  // Prioritize certain categories
  const priorityOrder = [
    'pregnancy',
    'cardiovascular',
    'surgeryRecovery',
    'eyeConditions',
    'neurologicalConditions',
    'musculoskeletal',
    'respiratoryConditions',
    'mentalHealth',
    'ageRelated',
    'otherConditions'
  ];

  for (const category of priorityOrder) {
    if (categories.includes(category)) {
      return SAFETY_MESSAGES[category];
    }
  }

  return SAFETY_MESSAGES.generic;
};

// Format complete safety response
const formatSafetyResponse = (categories, keywords) => {
  const message = getSafetyMessage(categories);
  
  return {
    warning: message.warning,
    recommendation: message.recommendation,
    disclaimer: message.disclaimer,
    detectedKeywords: keywords,
    detectedCategories: categories,
    fullMessage: `${message.warning}\n\n${message.recommendation}\n\n${message.disclaimer}`
  };
};

module.exports = {
  SAFETY_MESSAGES,
  getSafetyMessage,
  formatSafetyResponse
};