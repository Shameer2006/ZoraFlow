import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseUser } from "@/lib/supabase-admin" from "@google/genai";

/**
 * Robustly parse JSON from Gemini responses.
 * Strips markdown fences, leading/trailing noise, then parses.
 * Falls back to extracting the first {...} or [...] block if needed.
 */
function cleanAndParseJson<T = unknown>(raw: string): T {
    if (!raw) throw new Error("Empty response from AI");

    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    let cleaned = raw.trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    // Try direct parse
    try {
        return JSON.parse(cleaned) as T;
    } catch {
        // Fallback: find the outermost { } block
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1)) as T;
            } catch { /* fall through */ }
        }
        throw new Error(`Failed to parse AI response as JSON. Raw: ${raw.slice(0, 200)}`);
    }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `You are ZoraFlow's "Visualizer" AI module. You analyze a PRD and generate visual representations.

CRITICAL RULES:
1. Your ENTIRE response must be a single valid JSON object — no prose, no markdown fences, no explanation.
2. Detect whether the project is IoT/Hardware or Software/SaaS from the PRD content.
3. Mermaid v11 strict rules (MUST follow):
   - Node IDs: alphanumeric + underscore ONLY. No spaces, slashes, dots, or dashes.
   - Labels with spaces MUST use double-quoted syntax: NodeId["Label text"]
   - Do NOT use cylinder shape [(...)]. Use plain ["..."] instead.
   - Do NOT put escaped quotes (\\\\\" or \\") inside labels. Use plain English only.
   - Keep diagrams simple: 5–8 nodes maximum, clean directional flow.
   - Use flowchart LR for software, flowchart TD for hardware/IoT.

For a SOFTWARE / SAAS project, output exactly this shape:
{
  "projectType": "saas",
  "mermaidCode": "flowchart LR\\n    Browser[\"Browser\"] --> API[\"API Server\"]\\n    API --> DB[\"Database\"]\\n    API --> Auth[\"Auth Service\"]\\n    API --> Cache[\"Cache Layer\"]",
  "tableData": [
    { "endpoint": "/api/auth/login", "method": "POST", "description": "Authenticate user and return session token" },
    { "endpoint": "/api/users/:id", "method": "GET", "description": "Fetch user profile" }
  ]
}

For an IOT / HARDWARE project, output exactly this shape:
{
  "projectType": "iot",
  "mermaidCode": "flowchart TD\\n    Sensor[\"DHT22 Sensor\"] --> MCU[\"ESP32 MCU\"]\\n    MCU --> Cloud[\"MQTT Broker\"]\\n    Cloud --> Dashboard[\"Web Dashboard\"]\\n    MCU --> Display[\"OLED Display\"]",
  "tableData": [
    { "component": "DHT22", "pin": "GPIO4", "connection": "Data line", "voltage": "3.3V" },
    { "component": "ESP32", "pin": "3V3", "connection": "VCC to DHT22", "voltage": "3.3V" }
  ]
}

Generate realistic project-specific values. Include 4–8 table rows. Keep mermaid diagrams under 10 nodes. Use ONLY plain alphanumeric node IDs.`;

export async function POST(request: Request) {
    try {
        const authUser = await getSupabaseUser(request.headers.get("authorization"));
        if (!authUser) return NextResponse.json({ error: "Authentication required to generate Schema." }, { status: 401 });

        const { prd } = await request.json();

        if (!prd) {
            return NextResponse.json({ error: "PRD is required" }, { status: 400 });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Analyze this PRD and generate the visual schema output:\n\n${prd}`,
            config: {
                systemInstruction,
                temperature: 0.2,
            },
        });

        const raw = response.text?.trim() ?? "";
        const data = cleanAndParseJson(raw);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Schema generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate schema" },
            { status: 500 }
        );
    }
}
