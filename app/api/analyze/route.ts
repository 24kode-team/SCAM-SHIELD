import { NextRequest, NextResponse } from "next/server";

const LAMBDA_URL = 'https://cdzmr4gooofye27bo7j4ktgxn40waclm.lambda-url.us-east-1.on.aws/scam';

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

  const whitelisted = checkWhitelist(input.trim());
  if (whitelisted) {
    return NextResponse.json(whitelisted);
  }

  try {
    const res = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid response from Lambda' }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Analysis failed' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze input" }, { status: 500 });
  }
}
