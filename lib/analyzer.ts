import {
  KNOWN_SCAM_DOMAINS,
  SCAM_URL_PATTERNS,
  SCAM_PHONE_PATTERNS,
  SCAM_SMS_PATTERNS,
  LEGITIMATE_DOMAINS,
} from "./scamDatabase";

export type InputType = "url" | "phone" | "sms" | "email" | "unknown";
export type RiskLevel = "safe" | "unverified" | "low" | "medium" | "high" | "danger";

export interface ScanResult {
  input: string;
  inputType: InputType;
  riskLevel: RiskLevel;
  riskScore: number;
  flags: Flag[];
  isLegitimate: boolean;
  recommendation: string;
  reportUrl: string;
}

export interface Flag {
  id: string;
  category: string;
  severity: "high" | "medium" | "low" | "info";
  description: string;
}

export function detectInputType(input: string): InputType {
  const cleaned = input.trim();
  if (/^https?:\/\//i.test(cleaned) || /^www\./i.test(cleaned)) return "url";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return "email";
  if (/^[\d\s\-\+\(\)\.]{7,15}$/.test(cleaned)) return "phone";
  if (cleaned.length > 20) return "sms";
  return "unknown";
}

function extractDomain(url: string): string {
  try {
    const withProtocol = url.startsWith("http") ? url : `https://${url}`;
    return new URL(withProtocol).hostname.toLowerCase().replace("www.", "");
  } catch {
    return url.toLowerCase();
  }
}

function isLegitimateUrl(url: string): boolean {
  const domain = extractDomain(url);
  return LEGITIMATE_DOMAINS.some(
    (legit) => domain === legit || domain.endsWith(`.${legit}`)
  );
}

function scoreToRisk(score: number): RiskLevel {
  if (score <= 0) return "unverified";
  if (score <= 20) return "low";
  if (score <= 50) return "medium";
  if (score <= 80) return "high";
  return "danger";
}

export function analyzeInput(input: string): ScanResult {
  const inputType = detectInputType(input);
  const flags: Flag[] = [];
  let riskScore = 0;

  // URL / Email analysis
  if (inputType === "url" || inputType === "email") {
    const domain = extractDomain(input);
    const legitimate = isLegitimateUrl(input);

    if (legitimate) {
      return {
        input,
        inputType,
        riskLevel: "safe",
        riskScore: 0,
        flags: [],
        isLegitimate: true,
        recommendation:
          "This is a verified Canadian government or financial institution domain.",
        reportUrl: "",
      };
    }

    // Known scam domain
    if (KNOWN_SCAM_DOMAINS.includes(domain)) {
      flags.push({
        id: "known-scam-domain",
        category: "Known Scam Domain",
        severity: "high",
        description: "This domain is in our known scam database.",
      });
      riskScore += 90;
    }

    // URL pattern checks
    for (const pattern of SCAM_URL_PATTERNS) {
      const regex =
        pattern.pattern instanceof RegExp
          ? pattern.pattern
          : new RegExp(pattern.pattern, "i");
      if (regex.test(input)) {
        flags.push({
          id: pattern.id,
          category: pattern.category,
          severity: pattern.severity,
          description: pattern.description,
        });
        riskScore +=
          pattern.severity === "high"
            ? 40
            : pattern.severity === "medium"
            ? 20
            : 10;
      }
    }

    // If no patterns matched and not legitimate — unverified
    if (flags.length === 0) {
      flags.push({
        id: "unverified-domain",
        category: "Unverified Domain",
        severity: "info",
        description:
          "This domain is not in our verified safe list. We cannot confirm it is legitimate.",
      });
    }
  }

  // Phone analysis
  if (inputType === "phone") {
    for (const pattern of SCAM_PHONE_PATTERNS) {
      const regex =
        pattern.pattern instanceof RegExp
          ? pattern.pattern
          : new RegExp(pattern.pattern, "i");
      if (regex.test(input)) {
        flags.push({
          id: pattern.id,
          category: pattern.category,
          severity: pattern.severity,
          description: pattern.description,
        });
        riskScore +=
          pattern.severity === "high"
            ? 40
            : pattern.severity === "medium"
            ? 20
            : 10;
      }
    }

    if (flags.length === 0) {
      flags.push({
        id: "unverified-phone",
        category: "Unverified Number",
        severity: "info",
        description:
          "This number is not in our scam database, but always verify before calling back.",
      });
    }
  }

  // SMS analysis
  if (inputType === "sms" || inputType === "unknown") {
    for (const pattern of SCAM_SMS_PATTERNS) {
      const regex =
        pattern.pattern instanceof RegExp
          ? pattern.pattern
          : new RegExp(pattern.pattern, "i");
      if (regex.test(input)) {
        flags.push({
          id: pattern.id,
          category: pattern.category,
          severity: pattern.severity,
          description: pattern.description,
        });
        riskScore +=
          pattern.severity === "high"
            ? 35
            : pattern.severity === "medium"
            ? 15
            : 8;
      }
    }

    if (flags.length === 0) {
      flags.push({
        id: "unverified-sms",
        category: "Unverified Message",
        severity: "info",
        description:
          "No scam patterns detected. Still be cautious with unknown senders.",
      });
    }
  }

  riskScore = Math.min(riskScore, 100);
  const riskLevel = scoreToRisk(riskScore);

  const recommendations: Record<RiskLevel, string> = {
    safe: "This is a verified legitimate domain.",
    unverified:
      "We could not verify this as safe or dangerous. Do not share personal information unless you are certain of the source.",
    low: "Low risk detected. Proceed with caution and verify the source independently.",
    medium:
      "Medium risk detected. Do not click links or share personal information without verifying.",
    high: "High risk detected. This is likely a scam. Do not interact with this content.",
    danger:
      "DANGER: This is almost certainly a scam. Block the sender and report it to the Canadian Anti-Fraud Centre.",
  };

  return {
    input,
    inputType,
    riskLevel,
    riskScore,
    flags,
    isLegitimate: false,
    recommendation: recommendations[riskLevel],
    reportUrl:
      "https://www.antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
  };
}
