import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI SDK
// Ensure process.env.GEMINI_API_KEY is set in your .env.local
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // TODO: Verify Supabase auth session
        // TODO: Check and deduct user wallet balance (2 Credits)

        const systemInstruction = `
You are ZoraFlow, an autonomous "Engineering Architect" AI. 
Your task is to take the user's project idea and generate a professional Product Requirements Document (PRD).

The PRD MUST be strictly formatted in Markdown and MUST include:
# [Project Name] - Product Requirements Document
## 1. Executive Summary
## 2. Target Audience
## 3. Core Features & Functional Requirements
## 4. Technical Constraints & Stack Considerations
## 5. User Stories
---
Maintain a clean, authoritative, and concise tone appropriate for technical documentation.
Do not wrap your response in markdown code blocks (\`\`\`markdown). Output raw markdown text.
`;

        // Call Gemini 2.5 Flash for rapid generation
        // According to the new SDK standard:
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.7,
            },
        });

        const generatedMarkdown = response.text;

        // TODO: Save generation to Supabase 'documents' table

        return NextResponse.json({ markdown: generatedMarkdown });
    } catch (error: any) {
        console.error("Gemini PRD Generation Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate PRD" },
            { status: 500 }
        );
    }
}
