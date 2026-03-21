import { GoogleGenAI } from "@google/genai";
import { ExecutionResult, Language } from "../types";

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

export async function executeCode(code: string, language: Language): Promise<ExecutionResult> {
  const ai = getAI();
  if (!ai) {
    return {
      output: "",
      error: "GEMINI_API_KEY is missing. Please check your environment variables.",
      exitCode: 1,
    };
  }

  const prompt = `
    Act as a high-fidelity code compiler and interpreter for the ${language.name} programming language.
    
    Execute the following code and provide the exact output that would appear in a standard terminal/console.
    If there are syntax errors or runtime errors, provide the error message exactly as the compiler/interpreter would.
    
    Code to execute:
    \`\`\`${language.id}
    ${code}
    \`\`\`
    
    Return the result in the following JSON format:
    {
      "output": "The standard output (stdout) of the program",
      "error": "The standard error (stderr) or compiler error message, if any. Otherwise null.",
      "exitCode": 0 for success, non-zero for failure
    }
    
    Only return the JSON object. No other text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    } as any);

    const result = JSON.parse(response.text || "{}");
    return {
      output: result.output || "",
      error: result.error || undefined,
      exitCode: typeof result.exitCode === 'number' ? result.exitCode : 0,
    };
  } catch (error) {
    console.error("Execution error:", error);
    return {
      output: "",
      error: "Failed to simulate execution. Please try again.",
      exitCode: 1,
    };
  }
}
