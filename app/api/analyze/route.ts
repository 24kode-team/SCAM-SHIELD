import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const WHITELIST = [
  "nationcode.ca", "24kode.com", "mycanada.vercel.app",
  "canada.ca", "gc.ca", "cra-arc.gc.ca", "servicecanada.gc.ca", "ircc.canada.ca",
  "rbc.com", "td.com", "scotiabank.com", "bmo.com", "cibc.com", "interac.ca",
  "google.com", "google.ca", "gmail.com", "youtube.com", "apple.com",
  "microsoft.com", "amazon.com", "amazon.ca", "facebook.com", "instagram.com",
  "linkedin.com", "twitter.com", "x.com", "github.com", "netflix.com",
  "shopify.com", "paypal.com", "stripe.com", "zoom.us", "reddit.com",
];

function extractDomain(input: string): string {
  try {
    const withProtocol = input.startsWith("http") ? input : `https://${input}`;
    return new URL(withProtocol).hostname.toLowerCase().replace("www.", "");
  } catch {
    return input.toLowerCase().replace("www.", "").split("/")[0];
  }
}

function checkWhitelist(input: string) {
  const domain = extractDomain(input);
  const matched = WHITELIST.find((d) => domain === d || domain.endsWith(`.${d}`));
  if (matched) {
    return {
      riskLevel: "safe",
      riskScore: 0,
      category: "Verified Site",
      summary: "Verified legitimate site.",
      flags: [{ category: "Verified", severity: "info", description: "This domain is on our verified safe list." }],
      recommendation: "This site is safe to use.",
    };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { input } = await req.json();

  if (!input) {
    return NextResponse.json({ error: "No input provided" }, { status: 400 });
  }

  // Check whitelist first
  const whitelisted = checkWhitelist(input.trim());
  if (whitelisted) {
    return NextResponse.json(whitelisted);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const prompt = `You are a scam detection expert for Canada. Analyze this input: "${input}"

Canadian scam red flags:
- Impersonating CRA, IRCC, Service Canada (CRA never sends SMS)
- Fake Canadian bank pages (RBC, TD, Scotiabank, BMO, CIBC)
- Urgency tactics, gift card payment requests
- Suspicious domains mimicking official sites
- Prize/lottery scams, SIN number requests

Reply with ONLY valid JSON, no extra text:
{"riskLevel":"safe","riskScore":0,"category":"Known Site","summary":"Brief reason.","flags":[{"category":"Info","severity":"info","description":"Details."}],"recommendation":"What to do."}

riskLevel: safe | unverified | low | medium | high | danger
severity: info | low | medium | high`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No JSON in response" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);

  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze input" }, { status: 500 });
  }
}
