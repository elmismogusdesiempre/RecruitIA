import { Content, GoogleGenAI, Type, Chat } from "@google/genai";
import { JobConfig, Message, ReportData } from "../types";
import { QuotaManager, QuotaExceededError } from "./quotaManager";

// Type definition for process to satisfy TS compiler in browser environment
declare const process: {
  env: {
    API_KEY: string;
  }
};

// Initialize the client. API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a punchy 15-word summary of the job for the intro card.
 */
export const generateJobSummary = async (description: string, additionalContext?: string, language: string = 'English'): Promise<string> => {
  if (!description) return "";
  
  try {
    QuotaManager.checkAndIncrement('FLASH');
    
    const prompt = `
      Role: Senior Recruiter Copywriter.
      Task: Analyze the job description and create a VERY SHORT (approx 15 words) summary for a candidate card.
      
      Requirements:
      - Extract and combine the most important details: Job Title, Company, Location, Salary (if present), and Key Requirement.
      - Style: Bold, direct, and professional.
      - Length: Strictly under 20 words.
      - Output Language: ${language}.
      - Output: Just the text string. No labels.
      
      Job Description:
      ${description}
      
      ${additionalContext ? `Additional known details: ${additionalContext}` : ''}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
    });
    
    return response.text?.trim() || "Exciting opportunity available. Apply now to discuss your fit for this role.";
  } catch (e) {
    if (e instanceof QuotaExceededError) throw e;
    console.error("Summary generation failed", e);
    return "Great career opportunity. Please review the details and apply.";
  }
};

/**
 * Generates the system instruction based on the job configuration.
 */
const createSystemInstruction = (config: JobConfig, locationDetails?: string): string => {
  return `
    You are ${config.interviewerName ? config.interviewerName : "a professional interviewer"} representing ${config.companyName}.
    
    CRITICAL: You must align your tone, vocabulary, and demeanor to the Company Culture described here:
    "${config.companyCulture || "Standard professional business environment."}"
    (e.g., if the culture is "cool/informal", be friendly and relaxed. If "conservative", be formal and strictly professional).

    Your specific persona instructions are: ${config.interviewerProfile || "Professional, polite, and observant."}
    ${config.interviewerProfileLink ? `Refer to the interviewer profile in this Google Drive link (if accessible, otherwise ask user): ${config.interviewerProfileLink}` : ''}
    
    You are interviewing a candidate named: ${config.candidateName || "the candidate"}.
    Position: ${config.jobTitle}.
    
    JOB DETAILS (Use this to answer candidate questions):
    - Salary: ${config.salary || "Not specified publicly (say depends on experience)"}
    - Schedule: ${config.schedule || "Standard business hours"}
    - Experience Required: ${config.experience || "Not specified"}
    
    Job Description context: ${config.jobDescription}
    ${config.jobDescriptionLink ? `Additional Job Description context via Google Drive link: ${config.jobDescriptionLink}` : ''}
    
    ${config.candidateResume ? `Candidate Resume Text: ${config.candidateResume}` : ''}
    ${config.candidateResumeLink ? `Candidate Resume Drive Link: ${config.candidateResumeLink}` : ''}
    ${config.resumeFile ? 'NOTE: The candidate\'s CV has been provided as a file in the chat history. Use it to ask specific questions about their experience.' : ''}
    
    Interview Style: ${config.interviewStyle}.
    Target number of interview questions: ${config.questionCount}.
    
    Language: ${config.language}. You MUST conduct the entire interview in ${config.language}.
    
    ${locationDetails ? `Office Location Context: ${locationDetails}` : ''}

    Rules:
    1. Start by welcoming the candidate (use their name if known) and briefly mentioning the role in ${config.language}.
    2. Ask ONE interview question at a time. Do not overwhelm the candidate.
    3. Listen to their answer. If it's too brief, ask a polite follow-up.
    4. Move to the next topic when satisfied.
    5. Maintain a tone appropriate for the ${config.interviewStyle} style AND the company culture described above.
    
    PHASE 2 - CANDIDATE Q&A (IMPORTANT):
    6. After you have asked approximately ${config.questionCount} interview questions, STOP evaluating.
    7. Ask the candidate clearly: "Do you have any questions for me about the role, the company, or the details?" (Translate this to ${config.language}).
    8. Answer their questions based *strictly* on the provided Job Details, Salary, Schedule, and Description. Be helpful.
    9. If they ask something not in the context, politely say you don't have that specific detail but the HR team can clarify later.
    10. Continue answering questions until the candidate explicitly indicates they are finished (e.g., "No more questions", "I'm good", "All clear").
    
    TERMINATION:
    11. ONLY when the candidate confirms they have no further questions, thank them warmly and say exactly "INTERVIEW_COMPLETE" to end the session.
  `;
};

/**
 * Gets location details using Maps Grounding to provide context to the AI.
 */
export const getOfficeContext = async (locationQuery: string): Promise<string> => {
  if (!locationQuery) return "";
  
  try {
    // Check Flash Quota (Maps grounding usually uses Flash or similar efficient models)
    QuotaManager.checkAndIncrement('FLASH');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Describe the location and immediate surroundings of: ${locationQuery}. What is this area known for?`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    return response.text || "";
  } catch (error) {
    if (error instanceof QuotaExceededError) throw error;
    console.error("Maps grounding failed", error);
    return "";
  }
};

/**
 * Starts a chat session.
 */
export const startInterviewSession = async (config: JobConfig) => {
  // Optional: Fetch location context first if provided
  let locationContext = "";
  if (config.officeLocation) {
    // We catch quota error here to allow interview to proceed without maps if maps quota failed
    try {
        locationContext = await getOfficeContext(config.officeLocation);
    } catch (e) {
        if (e instanceof QuotaExceededError) {
            console.warn("Maps quota exceeded, proceeding without location context.");
        }
    }
  }

  // Prepare history with Resume if available
  const history: Content[] = [];

  if (config.resumeFile) {
    history.push({
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: config.resumeFile.mimeType,
            data: config.resumeFile.data
          }
        },
        {
          text: "Here is the candidate's CV/Resume. Please review it to tailor the interview questions."
        }
      ]
    });
    history.push({
      role: 'model',
      parts: [{ text: "I have reviewed the CV. I am ready to interview the candidate based on their specific experience and the job requirements." }]
    });
  }

  // Determine model to use. Default to Flash if not specified.
  const selectedModel = config.modelSelection || "gemini-3-flash-preview";

  // NOTE: Initialization of chat object itself does not consume quota until sendMessage is called.
  const chat = ai.chats.create({
    model: selectedModel,
    history: history,
    config: {
      systemInstruction: createSystemInstruction(config, locationContext),
      temperature: 0.7, // Balanced creativity and adherence
    },
  });

  return chat;
};

/**
 * Generates a structured report based on the interview transcript.
 * Uses Search Grounding to verify any company/tech claims if possible (simulated context).
 */
export const generateInterviewReport = async (
  config: JobConfig,
  messages: Message[]
): Promise<ReportData> => {
  // Check Flash Quota (Report generation uses Flash)
  QuotaManager.checkAndIncrement('FLASH');

  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const prompt = `
    Analyze the following interview transcript for the ${config.jobTitle} role at ${config.companyName}.
    Candidate Name: ${config.candidateName || "Candidate"}
    
    Transcript:
    ${transcript}
    
    Please provide a structured evaluation in JSON format including:
    - candidateSummary: A professional summary of the candidate's performance.
    - detailedAnalysis: A comprehensive paragraph analyzing how the candidate answered specific questions, their depth of knowledge, and how they handled any counter-questions or pressure.
    - strengths: An array of strings listing key strengths.
    - weaknesses: An array of strings listing areas for improvement.
    - score: A number from 1-100 representing overall fit.
    - hiringRecommendation: A string (Strong Hire, Hire, Leaning Hire, Leaning No Hire, No Hire).
    
    IMPORTANT: Write the content of the summary, strengths, weaknesses and recommendation in ${config.language}.
    
    Use Google Search to verify if any specific technologies or past companies mentioned are real and relevant (if specific obscure names are used).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Fast model for summarization
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateSummary: { type: Type.STRING },
            detailedAnalysis: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER },
            hiringRecommendation: { type: Type.STRING },
          },
          required: ["candidateSummary", "detailedAnalysis", "strengths", "weaknesses", "score", "hiringRecommendation"]
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    
    // Extract grounding chunks if available
    const groundingLinks: Array<{ title: string; uri: string }> = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          groundingLinks.push({ title: chunk.web.title || "Source", uri: chunk.web.uri });
        }
      });
    }

    return { ...data, groundingLinks };

  } catch (error) {
    if (error instanceof QuotaExceededError) throw error; // Re-throw quota errors
    console.error("Report generation failed", error);
    return {
      candidateSummary: "Failed to generate report due to an error.",
      detailedAnalysis: "Analysis unavailable.",
      strengths: [],
      weaknesses: [],
      score: 0,
      hiringRecommendation: "Error",
    };
  }
};