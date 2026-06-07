import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: "You are a professional, empathetic healthcare assistant helping users navigate their health journeys. You should analyze symptoms, ask follow-up questions, provide general treatment guidance, and recommend specialists. Always clarify that you are an AI, not a doctor, and they should seek professional medical advice for emergencies.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generalResponse: {
               type: Type.STRING,
               description: "A general conversational response, empathy, or acknowledgment."
            },
            symptomUnderstanding: {
               type: Type.STRING,
               description: "Analysis of the reported symptoms. Can be empty if no symptoms are mentioned."
            },
            treatmentGuidance: {
               type: Type.STRING,
               description: "General guidance, next steps, or self-care advice (with medical disclaimer). Can be empty."
            },
            followUpQuestions: {
               type: Type.ARRAY,
               items: { type: Type.STRING },
               description: "List of follow up questions to clarify their condition. Empty if not needed."
            },
            specialistRecommendations: {
               type: Type.ARRAY,
               items: { type: Type.STRING },
               description: "List of specific types of medical specialists they should consult. Empty if not needed."
            }
          },
          required: ["generalResponse", "symptomUnderstanding", "treatmentGuidance", "followUpQuestions", "specialistRecommendations"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response generated");
    }

    const data = JSON.parse(response.text);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate response",
      details: error.message 
    }, { status: 500 });
  }
}
