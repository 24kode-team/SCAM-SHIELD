"use client";

import { ScanResult, RiskLevel } from "@/lib/analyzer";

interface ResultCardProps {
  result: ScanResult;
  onReset: () => void;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string; iconPath: string }> = {
  safe: {
    label: "VERIFIED SAFE",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  unverified: {
    label: "UNVERIFIED",
    color: "text-zinc-300",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    iconPath: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  low: {
    label: "LOW RISK",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  medium: {
    label: "MEDIUM RISK",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  high: {
    label: "HIGH RISK",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    iconPath: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
  danger: {
    label: "SCAM DETECTED",
    color: "text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-400/30",
    iconPath: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
};

const severityColors: Record<string, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  warning: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  low: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  info: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

export default function ResultCard({ result, onReset }: ResultCardProps) {
  const config = riskConfig[result.riskLevel] || riskConfig.unverified;

  return (
    <div className="space-y-4 animate-result">
      {/* Main result */}
      <div className={`${config.bg} border ${config.border} rounded-2xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${config.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={config.iconPath} />
              </svg>
            </div>
            <div>
              <p className={`text-xs font-mono font-bold ${config.color}`}>{config.label}</p>
              <p className="text-white text-lg font-bold">
                {result.riskLevel === "unverified" ? "Cannot Verify" : `${result.riskScore}% Risk Score`}
              </p>
            </div>
          </div>

          {/* Risk meter */}
          <div className="text-right">
            <p className="text-zinc-500 text-xs mb-1 font-mono">{result.inputType.toUpperCase()}</p>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  result.riskLevel === "safe"
                    ? "bg-emerald-400"
                    : result.riskLevel === "unverified"
                    ? "bg-zinc-400"
                    : result.riskLevel === "low"
                    ? "bg-yellow-400"
                    : result.riskLevel === "medium"
                    ? "bg-orange-400"
                    : "bg-red-400"
                }`}
                style={{ width: result.riskLevel === "unverified" ? "30%" : `${result.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scanned input */}
        <div className="bg-black/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-zinc-500 text-xs font-mono mb-1">SCANNED INPUT</p>
          <p className="text-zinc-300 text-sm break-all line-clamp-2">{result.input}</p>
        </div>

        {/* Recommendation */}
        <p className="text-sm text-zinc-300 leading-relaxed">{result.recommendation}</p>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-zinc-400 text-xs font-mono font-bold mb-3">ANALYSIS DETAILS</p>
          <div className="space-y-2">
            {result.flags.map((flag, index) => (
              <div
                key={`${flag.category}-${index}`}
                className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${severityColors[flag.severity] || severityColors.info}`}
              >
                <span className="text-xs font-mono font-bold uppercase mt-0.5 shrink-0">{flag.severity}</span>
                <div>
                  <p className="text-white text-xs font-semibold">{flag.category}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all text-sm"
        >
          Scan Another
        </button>
        {result.riskLevel !== "safe" && result.riskLevel !== "unverified" && (
          <a
            href={result.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium py-3 rounded-xl transition-all text-sm text-center"
          >
            Report to CAFC
          </a>
        )}
      </div>

      {/* Education note */}
      {result.riskLevel !== "safe" && (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <p className="text-zinc-500 text-xs leading-relaxed">
            <span className="text-zinc-300 font-semibold">Remember:</span> The real CRA will never send SMS messages, demand gift card payments, or threaten immediate arrest. When in doubt, call CRA directly at{" "}
            <span className="text-zinc-300 font-mono">1-800-959-8281</span>.
          </p>
        </div>
      )}
    </div>
  );
}
