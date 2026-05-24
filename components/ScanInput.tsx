"use client";

import { useState } from "react";

interface ScanInputProps {
  onScan: (input: string) => void;
  scanning: boolean;
}

export default function ScanInput({ onScan, scanning }: ScanInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) onScan(input.trim());
  };

  const examples = [
    { label: "Fake CRA link", value: "https://cra-arc-refund.com/claim" },
    { label: "Scam SMS", value: "URGENT: Your CRA account has been suspended. You owe $2,340. Call now: 1-800-959-8281" },
    { label: "Phishing URL", value: "http://192.168.1.1/rbc-secure/login" },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a suspicious link, phone number, or SMS message..."
          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-zinc-600 text-sm resize-none focus:outline-none focus:border-red-500/40 focus:bg-white/[0.06] transition-all h-32"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleSubmit();
          }}
        />
        <div className="absolute bottom-3 right-3 text-zinc-700 text-xs font-mono">
          {input.length > 0 && `${input.length} chars`}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!input.trim() || scanning}
        className="w-full bg-red-500 hover:bg-red-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3.5 rounded-xl transition-all text-sm tracking-wide disabled:cursor-not-allowed"
      >
        {scanning ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          "Scan Now"
        )}
      </button>

      <div className="space-y-2">
        <p className="text-zinc-600 text-xs font-mono">TRY AN EXAMPLE:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setInput(ex.value)}
              className="text-xs bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
