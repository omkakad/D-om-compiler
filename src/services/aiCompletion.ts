import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getAICompletion(
  codeBefore: string,
  codeAfter: string,
  language: Language,
  userPrompt?: string
): Promise<string> {
  const ai = getAI();
  if (!ai) {
    return "AI Assistant not configured. Please add VITE_GEMINI_API_KEY.";
  }

  const prompt = userPrompt 
    ? `
    Act as an expert ${language.name} developer and AI code assistant.
    
    The user has a request: "${userPrompt}"
    
    CURRENT CODE CONTEXT:
    \`\`\`${language.id}
    ${codeBefore}${codeAfter}
    \`\`\`
    
    INSTRUCTIONS:
    1. If the user asks for code, provide ONLY the code block.
    2. If the user asks a question, provide a concise explanation.
    3. Ensure any code provided is complete and ready to be used in the current context.
    4. Do NOT include markdown code blocks (like \`\`\`${language.id}) in your response, just the raw code or text.
    5. Be helpful and professional.
    `
    : `
    Act as an expert ${language.name} developer and AI code assistant.
    
    Provide a code completion for the following code at the current cursor position.
    
    CONTEXT BEFORE CURSOR:
    \`\`\`${language.id}
    ${codeBefore}
    \`\`\`
    
    CONTEXT AFTER CURSOR:
    \`\`\`${language.id}
    ${codeAfter}
    \`\`\`
    
    INSTRUCTIONS:
    1. Provide ONLY the code that should be inserted at the cursor position.
    2. Do NOT repeat the code that is already present.
    3. Ensure the completion is syntactically correct and fits the context.
    4. If the user is writing a comment like "// AI: generate a button", provide the implementation.
    5. Keep it concise but complete for the immediate logic.
    
    Return ONLY the code to insert. No markdown blocks, no explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    } as any);

    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Completion error:", error);
    return "";
  }
}
