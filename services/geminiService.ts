
import { GoogleGenAI, Type } from "@google/genai";
import { Task, AIAnalysisResponse, Level } from "../types";

export const analyzeTask = async (task: Partial<Task>): Promise<AIAnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following task based on the Eisenhower Matrix principles.
    Task Title: ${task.title}
    Description: ${task.description || 'No description provided.'}
    Due Date: ${task.completeBy}
    User Self-Assessed Urgency: ${task.userUrgency || 'Not provided'}
    User Self-Assessed Importance: ${task.userImportance || 'Not provided'}
    
    Determine the Urgency and Importance levels (Low, Medium, or High).
    Provide a detailed justification for your choice. 
    If the user provided their own assessment, acknowledge it but provide an objective AI perspective.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          urgency: {
            type: Type.STRING,
            enum: Object.values(Level),
            description: 'The urgency of the task.',
          },
          importance: {
            type: Type.STRING,
            enum: Object.values(Level),
            description: 'The importance of the task.',
          },
          justification: {
            type: Type.STRING,
            description: 'A brief justification for the classification.',
          },
        },
        required: ["urgency", "importance", "justification"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text.trim());
    return result as AIAnalysisResponse;
  } catch (error) {
    console.error("Failed to parse AI response", error);
    throw new Error("AI Analysis failed to provide structured data.");
  }
};
