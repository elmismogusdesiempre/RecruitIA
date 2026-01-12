
export enum InterviewStyle {
  PSYCHOLOGICAL = 'Psychological / Behavioral',
  TECHNICAL = 'Technical / Skills-based',
  EXECUTIVE = 'Executive / Leadership',
  CULTURAL = 'Cultural Fit',
  GENERAL = 'General Screening'
}

export enum AppLanguage {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  PORTUGUESE = 'Portuguese'
}

export interface JobConfig {
  companyName: string;
  companyLogoUrl: string; // Placeholder or uploaded
  companyCulture: string; // Internal context for AI tone
  jobTitle: string;
  jobDescription: string; // Extracted text from upload
  jobDescriptionLink?: string; // Google Drive Link
  
  // New specific fields for the summary card
  salary?: string;
  schedule?: string;
  experience?: string;
  jobSummary?: string; // AI Generated 15-word summary

  interviewerProfile: string; // Extracted text from upload
  interviewerProfileLink?: string; // Google Drive Link
  interviewerName?: string; // Name of the AI persona
  interviewStyle: InterviewStyle;
  questionCount: number;
  officeLocation: string; // For Maps grounding
  language: AppLanguage;
  candidateName: string;
  candidateResume: string; // Text content if pasted
  candidateResumeLink?: string; // Google Drive Link
  resumeFile?: {
    mimeType: string;
    data: string; // Base64 string
  };
  modelSelection: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ReportData {
  candidateSummary: string;
  detailedAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  score: number;
  hiringRecommendation: string;
  groundingLinks?: Array<{ title: string; uri: string }>;
}

export type AppView = 
  | 'role-selection' 
  | 'admin-dashboard' 
  | 'admin-settings' 
  | 'admin-report' 
  | 'candidate-interview' 
  | 'candidate-success';
