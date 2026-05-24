"use client";

import { useState } from "react";
import { ScanResult } from "@/lib/analyzer";
import { detectInputType } from "@/lib/analyzer";
import ResultCard from "@/components/ResultCard";
import ScanInput from "@/components/ScanInput";

export default function Home() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (input: string) => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();

      const scanResult: ScanResult = {
        input,
        inputType: detectInputType(input),
        riskLevel: data.riskLevel,
        riskScore: data.riskScore,
        flags: data.flags || [],
        isLegitimate: data.riskLevel === "safe",
        recommendation: data.recommendation,
        reportUrl: "https://www.antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
      };

      setResult(scanResult);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            CANADA SCAM SHIELD
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Protect Yourself
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              From Digital Scams
            </span>
          </h1>

          <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
            Paste a suspicious link, phone number, or SMS message. AI analyzes it instantly for Canadian scam patterns.
          </p>
        </div>

        {/* Scanner */}
        {!result && (
          <ScanInput onScan={handleScan} scanning={scanning} />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <ResultCard result={result} onReset={handleReset} />
        )}

        {/* Info cards */}
        {!result && (
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { label: "CRA Scams", desc: "Fake tax agency calls & SMS" },
              { label: "Bank Phishing", desc: "Fake banking login pages" },
              { label: "Benefit Fraud", desc: "CERB, OAS, CPP scams" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
              >
                <p className="text-white text-xs font-semibold mb-1">{item.label}</p>
                <p className="text-zinc-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-12">
          Powered by{" "}
          <a href="https://nationcode.ca" className="text-zinc-400 hover:text-white transition-colors">
            Nation Code Canada
          </a>{" "}
          &mdash; Protecting newcomers &amp; seniors
        </p>
      </div>
    </main>
  );
}
