export interface ScamPattern {
  id: string;
  type: "url" | "phone" | "email" | "sms";
  pattern: RegExp | string;
  category: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export const KNOWN_SCAM_DOMAINS = [
  "cra-arc-gouv.com",
  "cra-arc.ca.gov",
  "canada-revenue.net",
  "cra-refund.com",
  "cra-efile.net",
  "service-canada.info",
  "servicecanada.net",
  "ircc-canada.com",
  "immigration-canada.net",
  "canada-immigration.org",
  "rbc-secure.net",
  "td-bank-secure.com",
  "scotiabank-verify.com",
  "bmo-secure.net",
  "cibc-alert.com",
  "canada-emergency-benefit.com",
  "cerb-apply.net",
  "oas-payment.com",
  "cpp-benefit.net",
  "etransfer-interac.net",
  "interac-etransfer.com",
  "interac-secure.net",
];

export const SCAM_URL_PATTERNS: ScamPattern[] = [
  {
    id: "cra-fake",
    type: "url",
    pattern: /cra[-_]?arc|canada[-_]?revenue|cra[-_]?refund/i,
    category: "CRA Impersonation",
    severity: "high",
    description: "This URL appears to impersonate the Canada Revenue Agency (CRA).",
  },
  {
    id: "service-canada-fake",
    type: "url",
    pattern: /service[-_]?canada(?!\.gc\.ca)/i,
    category: "Service Canada Impersonation",
    severity: "high",
    description: "This URL may be impersonating Service Canada.",
  },
  {
    id: "ircc-fake",
    type: "url",
    pattern: /ircc[-_]?canada|immigration[-_]?canada(?!\.gc\.ca)/i,
    category: "IRCC Impersonation",
    severity: "high",
    description: "This URL appears to impersonate IRCC.",
  },
  {
    id: "bank-fake",
    type: "url",
    pattern: /rbc[-_]?secure|td[-_]?bank[-_]?secure|scotiabank[-_]?verify|bmo[-_]?secure|cibc[-_]?alert/i,
    category: "Bank Impersonation",
    severity: "high",
    description: "This URL may be impersonating a Canadian bank.",
  },
  {
    id: "interac-fake",
    type: "url",
    pattern: /interac(?!\.ca)|e[-_]?transfer[-_]?interac/i,
    category: "Interac Impersonation",
    severity: "high",
    description: "This URL may be impersonating Interac e-Transfer.",
  },
  {
    id: "benefit-fake",
    type: "url",
    pattern: /cerb[-_]?apply|emergency[-_]?benefit|oas[-_]?payment|cpp[-_]?benefit/i,
    category: "Benefit Scam",
    severity: "high",
    description: "This URL appears to be a fake government benefit page.",
  },
  {
    id: "suspicious-tld",
    type: "url",
    pattern: /\.(tk|ml|ga|cf|gq|xyz|top|click|loan|download)$/i,
    category: "Suspicious Domain",
    severity: "medium",
    description: "This URL uses a domain extension commonly associated with scams.",
  },
  {
    id: "ip-url",
    type: "url",
    pattern: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    category: "IP Address URL",
    severity: "medium",
    description: "Legitimate services don't use raw IP addresses in their URLs.",
  },
  {
    id: "url-shortener",
    type: "url",
    pattern: /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|short\.link/i,
    category: "Shortened URL",
    severity: "low",
    description: "Shortened URLs can hide the real destination. Be cautious.",
  },
];

export const SCAM_PHONE_PATTERNS: ScamPattern[] = [
  {
    id: "cra-phone",
    type: "phone",
    pattern: /1[-.\s]?800[-.\s]?959[-.\s]?8281/,
    category: "CRA Spoof",
    severity: "high",
    description: "Scammers often spoof the real CRA number (1-800-959-8281).",
  },
  {
    id: "toll-free-scam",
    type: "phone",
    pattern: /1[-.\s]?8(00|44|55|66|77|88)[-.\s]?\d{3}[-.\s]?\d{4}/,
    category: "Suspicious Toll-Free",
    severity: "low",
    description: "Toll-free numbers are commonly used in government impersonation scams.",
  },
];

export const SCAM_SMS_PATTERNS: ScamPattern[] = [
  {
    id: "urgent-action",
    type: "sms",
    pattern: /urgent|immediate action|act now|account suspended|limited time/i,
    category: "Urgency Tactic",
    severity: "medium",
    description: "This message uses urgency tactics common in scam messages.",
  },
  {
    id: "cra-sms",
    type: "sms",
    pattern: /canada revenue|cra|tax refund|tax owed|owe taxes/i,
    category: "CRA SMS Scam",
    severity: "high",
    description: "CRA does NOT send SMS messages. This is likely a scam.",
  },
  {
    id: "prize-scam",
    type: "sms",
    pattern: /you.ve won|winner|claim your prize|lottery|selected/i,
    category: "Prize Scam",
    severity: "high",
    description: "This message appears to be a prize or lottery scam.",
  },
  {
    id: "bank-sms",
    type: "sms",
    pattern: /verify your account|confirm your banking|banking suspended|unusual activity/i,
    category: "Bank SMS Scam",
    severity: "high",
    description: "Banks will never ask you to verify account details via SMS link.",
  },
  {
    id: "gift-card",
    type: "sms",
    pattern: /gift card|itunes|google play|steam card|pay with card/i,
    category: "Gift Card Scam",
    severity: "high",
    description: "Government agencies never ask for gift card payments.",
  },
  {
    id: "personal-info",
    type: "sms",
    pattern: /sin number|social insurance|passport number|date of birth.*confirm/i,
    category: "Personal Info Request",
    severity: "high",
    description: "Never share your SIN or personal information via SMS.",
  },
];

export const LEGITIMATE_DOMAINS = [
  "canada.ca", "gc.ca", "cra-arc.gc.ca", "servicecanada.gc.ca", "ircc.canada.ca",
  "rbc.com", "td.com", "scotiabank.com", "bmo.com", "cibc.com", "nbc.ca",
  "hsbc.ca", "tangerine.ca", "simplii.com", "interac.ca", "wealthsimple.com",
  "nationcode.ca", "mycanada.vercel.app", "24kode.com",
  "google.com", "google.ca", "gmail.com", "youtube.com",
  "apple.com", "icloud.com", "microsoft.com", "outlook.com", "live.com", "hotmail.com",
  "amazon.com", "amazon.ca", "facebook.com", "instagram.com", "linkedin.com",
  "twitter.com", "x.com", "github.com", "netflix.com", "shopify.com",
  "paypal.com", "stripe.com", "zoom.us", "slack.com", "dropbox.com",
  "wikipedia.org", "reddit.com", "stackoverflow.com", "anthropic.com", "claude.ai",
  "openai.com", "vercel.app",
];
