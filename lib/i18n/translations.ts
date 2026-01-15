// Translation files for English and Khmer

export type Language = "en" | "km";

export interface Translations {
  // Navbar
  nav: {
    home: string;
    checkSymptoms: string;
    history: string;
    signIn: string;
    signUp: string;
    getStarted: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
  };
  // Footer
  footer: {
    copyright: string;
    tagline: string;
  };
  // Landing Page
  landing: {
    title: string;
    subtitle1: string;
    subtitle2: string;
    getStarted: string;
    signIn: string;
    poweredBy: string;
    combining: string;
    neuralNetworks: string;
    neuralNetworksDesc: string;
    instantAnalysis: string;
    instantAnalysisDesc: string;
    dataDriven: string;
    dataDrivenDesc: string;
    mlAtFinest: string;
    mlDescription: string;
    deepNeural: string;
    nlp: string;
    continuousLearning: string;
    modelAccuracy: string;
    trainingData: string;
    responseTime: string;
    readyToExperience: string;
    joinThousands: string;
    startJourney: string;
  };
  // Home Page (Authenticated)
  home: {
    title: string;
    description: string;
    checkSymptoms: string;
    checkSymptomsDesc: string;
    getStarted: string;
    viewHistory: string;
    viewHistoryDesc: string;
    whyChoose: string;
    aiPowered: string;
    instantResults: string;
    trackHistory: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      checkSymptoms: "Check Symptoms",
      history: "History",
      signIn: "Sign In",
      signUp: "Sign Up",
      getStarted: "Get Started",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
    },
    footer: {
      copyright: "© 2026 Red Rose Symptom Checker. All rights reserved.",
      tagline: "AI-powered symptom diagnosis and health tracking",
    },
    landing: {
      title: "Red Rose AI Diagnosis",
      subtitle1: "Where Nature's Beauty Meets",
      subtitle2: "Machine Learning Intelligence",
      getStarted: "Get Started",
      signIn: "Sign In",
      poweredBy: "Powered by Advanced AI",
      combining:
        "Combining the elegance of red roses with cutting-edge machine learning technology",
      neuralNetworks: "Neural Networks",
      neuralNetworksDesc:
        "Deep learning algorithms trained on thousands of symptom patterns to provide accurate diagnoses",
      instantAnalysis: "Instant Analysis",
      instantAnalysisDesc:
        "Real-time symptom processing with machine learning models that learn and improve continuously",
      dataDriven: "Data-Driven Insights",
      dataDrivenDesc:
        "Advanced analytics powered by machine learning to track patterns and provide personalized recommendations",
      mlAtFinest: "Machine Learning at its Finest",
      mlDescription:
        "Our AI system uses state-of-the-art machine learning algorithms to analyze symptoms with precision. Just like a red rose blooms with care, our models have been carefully trained and refined.",
      deepNeural: "Deep neural networks for pattern recognition",
      nlp: "Natural language processing for symptom understanding",
      continuousLearning: "Continuous learning from user feedback",
      modelAccuracy: "Model Accuracy",
      trainingData: "Training Data",
      responseTime: "Response Time",
      readyToExperience: "Ready to Experience AI-Powered Diagnosis?",
      joinThousands:
        "Join thousands of users who trust Red Rose AI for accurate symptom analysis",
      startJourney: "Start Your Journey →",
    },
    home: {
      title: "Red Rose Symptom Checker",
      description:
        "Get AI-powered symptom diagnosis and track your health history with confidence.",
      checkSymptoms: "Check Symptoms",
      checkSymptomsDesc:
        "Select your symptoms and get an instant AI-powered diagnosis with recommendations.",
      getStarted: "Get Started →",
      viewHistory: "View History",
      viewHistoryDesc:
        "Review your past diagnoses and track your health journey over time.",
      whyChoose: "Why Choose Our Symptom Checker?",
      aiPowered: "AI-Powered",
      instantResults: "Instant Results",
      trackHistory: "Track History",
    },
  },
  km: {
    nav: {
      home: "ទំព័រដើម",
      checkSymptoms: "ពិនិត្យរោគសញ្ញា",
      history: "ប្រវត្តិ",
      signIn: "ចូល",
      signUp: "ចុះឈ្មោះ",
      getStarted: "ចាប់ផ្តើម",
    },
    common: {
      loading: "កំពុងផ្ទុក...",
      error: "កំហុស",
      success: "ជោគជ័យ",
      cancel: "បោះបង់",
      confirm: "បញ្ជាក់",
      save: "រក្សាទុក",
      delete: "លុប",
      edit: "កែប្រែ",
      close: "បិទ",
    },
    footer: {
      copyright: "© ២០២៦ Red Rose Symptom Checker។ រក្សាសិទ្ធិទាំងអស់។",
      tagline: "ការវិនិច្ឆ័យរោគសញ្ញាដោយ AI និងការតាមដានសុខភាព",
    },
    landing: {
      title: "Red Rose AI Diagnosis",
      subtitle1: "កន្លែងដែលភាពស្រស់ស្អាតរបស់ធម្មជាតិជួប",
      subtitle2: "បញ្ញាសិប្បនិម្មិត Machine Learning",
      getStarted: "ចាប់ផ្តើម",
      signIn: "ចូល",
      poweredBy: "ដំណើរការដោយ AI កម្រិតខ្ពស់",
      combining:
        "រួមបញ្ចូលភាពស្រស់ស្អាតរបស់ផ្កាកុលាបក្រហមជាមួយបច្ចេកវិទ្យា machine learning ទំនើប",
      neuralNetworks: "Neural Networks",
      neuralNetworksDesc:
        "ក្បួនដោះស្រាយ deep learning ដែលបានបណ្តុះបណ្តាលលើរាប់ពាន់លំនាំរោគសញ្ញាដើម្បីផ្តល់ការវិនិច្ឆ័យដែលត្រឹមត្រូវ",
      instantAnalysis: "ការវិភាគភ្លាមៗ",
      instantAnalysisDesc:
        "ការដំណើរការរោគសញ្ញាពេលវេលាពិតជាមួយម៉ូដែល machine learning ដែលរៀនសូត្រ និងកែលម្អបន្ត",
      dataDriven: "ការយល់ដឹងដែលផ្អែកលើទិន្នន័យ",
      dataDrivenDesc:
        "ការវិភាគកម្រិតខ្ពស់ដែលដំណើរការដោយ machine learning ដើម្បីតាមដានលំនាំ និងផ្តល់ការណែនាំផ្ទាល់ខ្លួន",
      mlAtFinest: "Machine Learning នៅកម្រិតល្អបំផុត",
      mlDescription:
        "ប្រព័ន្ធ AI របស់យើងប្រើប្រាស់ក្បួនដោះស្រាយ machine learning ទំនើបបំផុតដើម្បីវិភាគរោគសញ្ញាដោយភាពត្រឹមត្រូវ។ ដូចជាផ្កាកុលាបក្រហមដែលរីកស្គុះស្គាយដោយការថែទាំ ម៉ូដែលរបស់យើងត្រូវបានបណ្តុះបណ្តាល និងកែលម្អដោយប្រុងប្រយ័ត្ន។",
      deepNeural: "Neural networks ជ្រៅសម្រាប់ការស្គាល់លំនាំ",
      nlp: "ការដំណើរការភាសាធម្មជាតិសម្រាប់ការយល់ដឹងរោគសញ្ញា",
      continuousLearning: "ការរៀនសូត្របន្តពីមតិកែលម្អអ្នកប្រើប្រាស់",
      modelAccuracy: "ភាពត្រឹមត្រូវរបស់ម៉ូដែល",
      trainingData: "ទិន្នន័យបណ្តុះបណ្តាល",
      responseTime: "ពេលវេលាឆ្លើយតប",
      readyToExperience:
        "តើអ្នករួចរាល់ហើយឬនៅក្នុងការសាកល្បងការវិនិច្ឆ័យដោយ AI?",
      joinThousands:
        "ចូលរួមជាមួយអ្នកប្រើប្រាស់រាប់ពាន់នាក់ដែលទុកចិត្ត Red Rose AI សម្រាប់ការវិភាគរោគសញ្ញាដែលត្រឹមត្រូវ",
      startJourney: "ចាប់ផ្តើមដំណើរការរបស់អ្នក →",
    },
    home: {
      title: "Red Rose Symptom Checker",
      description:
        "ទទួលបានការវិនិច្ឆ័យរោគសញ្ញាដោយ AI និងតាមដានប្រវត្តិសុខភាពរបស់អ្នកដោយទំនុកចិត្ត។",
      checkSymptoms: "ពិនិត្យរោគសញ្ញា",
      checkSymptomsDesc:
        "ជ្រើសរើសរោគសញ្ញារបស់អ្នក និងទទួលបានការវិនិច្ឆ័យដោយ AI ភ្លាមៗជាមួយការណែនាំ។",
      getStarted: "ចាប់ផ្តើម →",
      viewHistory: "មើលប្រវត្តិ",
      viewHistoryDesc:
        "ពិនិត្យការវិនិច្ឆ័យកាលពីមុនរបស់អ្នក និងតាមដានដំណើរការសុខភាពរបស់អ្នកតាមពេលវេលា។",
      whyChoose: "ហេតុអ្វីបានជាត្រូវជ្រើសរើស Symptom Checker របស់យើង?",
      aiPowered: "ដំណើរការដោយ AI",
      instantResults: "លទ្ធផលភ្លាមៗ",
      trackHistory: "តាមដានប្រវត្តិ",
    },
  },
};
