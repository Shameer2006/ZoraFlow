import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseUser } from "@/lib/supabase-admin";

/**
 * Robustly parse JSON from Gemini responses.
 * Strips markdown fences and leading/trailing noise, then falls back
 * to extracting the first {...} block — mirrors the reference's _clean_latex logic.
 */
function cleanAndParseJson<T = unknown>(raw: string): T {
    if (!raw) throw new Error("Empty response from AI");

    let cleaned = raw.trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    try {
        return JSON.parse(cleaned) as T;
    } catch {
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


// Server-side affiliate URL map for known SaaS services
// Replace values with your real affiliate links
const SAAS_AFFILIATE_URLS: Record<string, string> = {
    supabase: "https://supabase.com",
    vercel: "https://vercel.com",
    clerk: "https://clerk.com",
    stripe: "https://stripe.com",
    railway: "https://railway.app",
    render: "https://render.com",
    netlify: "https://netlify.com",
    planetscale: "https://planetscale.com",
    neon: "https://neon.tech",
    upstash: "https://upstash.com",
    resend: "https://resend.com",
    sendgrid: "https://sendgrid.com",
    twilio: "https://twilio.com",
    cloudinary: "https://cloudinary.com",
    firebase: "https://firebase.google.com",
    mongodb: "https://www.mongodb.com/atlas",
    aws: "https://aws.amazon.com",
    digitalocean: "https://www.digitalocean.com",
    pocketbase: "https://pocketbase.io",
    appwrite: "https://appwrite.io",
    firebase_auth: "https://firebase.google.com",
    next_auth: "https://next-auth.js.org",
    auth0: "https://auth0.com",
    pusher: "https://pusher.com",
    algolia: "https://www.algolia.com",
};

const AMAZON_AFFILIATE_TAG = "zoraflow-21"; // Replace with your real Amazon Associates tag

function buildAmazonUrl(searchQuery: string): string {
    return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_AFFILIATE_TAG}`;
}

function resolveAffiliateUrl(serviceName: string): string {
    const key = serviceName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [k, url] of Object.entries(SAAS_AFFILIATE_URLS)) {
        if (key.includes(k.replace(/[^a-z0-9]/g, "")) || k.includes(key)) {
            return url;
        }
    }
    return `https://www.google.com/search?q=${encodeURIComponent(serviceName)}`;
}

const systemInstruction = `You are ZoraFlow's "Buyer" AI module. Generate a procurement list (Bill of Materials) for the given project.

CRITICAL RULES:
1. Your ENTIRE response must be a single valid JSON object — no prose, no markdown fences, no explanation.
2. Include ALL necessary components or services. Be specific with names.
3. For hardware, searchQuery must be an exact Amazon search term (e.g. "ESP32 DevKit V1 30 pin").
4. For SaaS, use the exact well-known service names (e.g. "Supabase", "Vercel", "Clerk").

For HARDWARE / IOT projects:
{
  "bomType": "hardware",
  "items": [
    {
      "name": "ESP32 DevKit V1",
      "role": "Main microcontroller — WiFi + Bluetooth, 30 GPIO pins",
      "warning": "3.3V logic level only. Do not connect 5V sensors without a level shifter.",
      "searchQuery": "ESP32 DevKit V1 30 pin development board"
    },
    {
      "name": "DHT22 Temperature Sensor",
      "role": "Reads ambient temperature and humidity",
      "warning": "Requires a 10kΩ pull-up resistor on the data line",
      "searchQuery": "DHT22 AM2302 temperature humidity sensor"
    }
  ]
}

For SOFTWARE / SAAS projects:
{
  "bomType": "saas",
  "items": [
    {
      "name": "Supabase",
      "role": "PostgreSQL database, realtime subscriptions, and row-level security",
      "freeTier": "500MB storage, 50MB database, 2GB bandwidth",
      "category": "database"
    },
    {
      "name": "Vercel",
      "role": "Frontend deployment and serverless API hosting",
      "freeTier": "Unlimited personal projects, 100GB bandwidth",
      "category": "hosting"
    }
  ]
}

Include 5–10 items. Be realistic and project-specific.`;

export async function POST(request: Request) {
    try {
        const authUser = await getSupabaseUser(request.headers.get("authorization"));
        if (!authUser) return NextResponse.json({ error: "Authentication required to generate BOM." }, { status: 401 });

        const { prd, projectType } = await request.json();

        if (!prd) {
            return NextResponse.json({ error: "PRD is required" }, { status: 400 });
        }

        const typeHint = projectType ? `\n\nNote: This has been identified as a ${projectType === "iot" ? "Hardware/IoT" : "Software/SaaS"} project.` : "";

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Generate the Bill of Materials for this project:${typeHint}\n\n${prd}`,
            config: {
                systemInstruction,
                temperature: 0.3,
            },
        });

        const raw = response.text?.trim() ?? "";
        const data = cleanAndParseJson<{
            bomType: "hardware" | "saas";
            items: any[];
        }>(raw);

        // Server-side: inject affiliate URLs (never expose logic to client)
        if (data.bomType === "hardware" && Array.isArray(data.items)) {
            data.items = data.items.map((item: any) => ({
                ...item,
                buyUrl: buildAmazonUrl(item.searchQuery || item.name),
            }));
        } else if (data.bomType === "saas" && Array.isArray(data.items)) {
            data.items = data.items.map((item: any) => ({
                ...item,
                affiliateUrl: resolveAffiliateUrl(item.name),
            }));
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("BOM generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate BOM" },
            { status: 500 }
        );
    }
}
