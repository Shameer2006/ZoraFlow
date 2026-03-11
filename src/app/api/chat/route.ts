import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
    try {
        const { messages, document, commandOnly, targetSection } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        const systemInstruction = `
You are ZoraFlow's PRD AI Assistant. You help users refine, rewrite, and modify their Product Requirements Documents (PRD).

You will receive the CURRENT PRD content, and the user's conversation/command.
If the user's request requires modifying the PRD, you MUST return the COMPLETE UPDATED PRD in Markdown format in the 'updatedDocument' field.
If the user's request is just a question and does not require modifying the PRD, leave 'updatedDocument' as null.
Always provide a friendly conversational response in the 'reply' field explaining what you did or answering the question.

Respond STRICTLY in JSON format matching this schema:
{
  "reply": "string (your conversational response)",
  "updatedDocument": "string (the complete updated markdown, or null if no changes)"
}

${targetSection ? `
CRITICAL: The user has issued a command targeting a SPECIFIC section of the document.
TARGET SECTION TEXT: "${targetSection}"
You MUST apply the requested change ONLY to this specific target section. Keep the rest of the document EXACTLY the same.
` : (commandOnly ? "CRITICAL: The user has issued an internal DOCUMENT COMMAND. You MUST apply the requested change to the document and return it." : "")}

--- CURRENT PRD DOCUMENT ---
${document || "(Empty Document - The user hasn't generated one yet)"}
----------------------------
`;

        const lastMessage = messages[messages.length - 1].content;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: lastMessage,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.5,
            },
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("Empty response from AI");
        }

        const result = JSON.parse(textResponse);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat" },
            { status: 500 }
        );
    }
}
