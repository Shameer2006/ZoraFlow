import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const systemInstruction = `You are ZoraFlow's "Visualizer" AI module. You analyze a PRD and generate visual representations.

CRITICAL RULES:
1. Your ENTIRE response must be a single valid JSON object — no prose, no markdown fences, no explanation.
2. Detect whether the project is IoT/Hardware or Software/SaaS from the PRD content.
3. Keep mermaidCode syntactically valid. Use simple quoted node labels for any labels containing special chars like ():[]

For a SOFTWARE / SAAS project, output exactly this shape:
{
  "projectType": "saas",
  "mermaidCode": "flowchart LR\\n    Client[\"Browser / App\"] --> API[\"Next.js API Routes\"]\\n    API --> DB[(\"PostgreSQL\")]\\n    API --> Auth[\"Auth Service\"]",
  "tableData": [
    { "endpoint": "/api/auth/login", "method": "POST", "description": "Authenticate user and return session token" },
    { "endpoint": "/api/users/:id", "method": "GET", "description": "Fetch user profile" }
  ]
}

For an IOT / HARDWARE project, output exactly this shape:
{
  "projectType": "iot",
  "mermaidCode": "flowchart TD\\n    Sensor[\"DHT22 Sensor\"] -->|\"GPIO 4\"| MCU[\"ESP32\"]\\n    MCU -->|\"WiFi\"| Cloud[\"MQTT Broker\"]\\n    Cloud --> Dashboard[\"Web Dashboard\"]",
  "tableData": [
    { "component": "DHT22", "pin": "GPIO4", "connection": "Data line", "voltage": "3.3V" },
    { "component": "ESP32", "pin": "3V3", "connection": "VCC → DHT22", "voltage": "3.3V" }
  ]
}

Generate realistic, project-specific values. Include 4–8 table rows. Keep mermaid diagrams clean with 5–10 nodes max.`;

export async function POST(request: Request) {
    try {
        const { prd } = await request.json();

        if (!prd) {
            return NextResponse.json({ error: "PRD is required" }, { status: 400 });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this PRD and generate the visual schema output:\n\n${prd}`,
            config: {
                systemInstruction,
                temperature: 0.3,
            },
        });

        const raw = response.text?.trim() ?? "";
        // Strip any accidental markdown code fences
        const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

        const data = JSON.parse(cleaned);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Schema generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate schema" },
            { status: 500 }
        );
    }
}
