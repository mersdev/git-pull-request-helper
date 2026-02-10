#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

function loadEnvFromFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value && process.env[key] == null) process.env[key] = value;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  loadEnvFromFile(path.join(repoRoot, ".env"));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.error(
      "Error: GEMINI_API_KEY is not set. Create .env from .env.example and set GEMINI_API_KEY."
    );
    process.exit(1);
  }

  if (typeof fetch !== "function") {
    console.error(
      "Error: This script requires Node 18+ (global fetch). Upgrade Node or run in an environment with fetch."
    );
    process.exit(1);
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const payload = {
    contents: [
      {
        parts: [{ text: "Explain how AI works in a few words" }],
      },
    ],
  };

  // 429 is quota/rate-limit; retry a few times with exponential backoff.
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      const waitMs = Math.min(30_000, 500 * 2 ** (attempt - 1));
      console.error(
        `Rate limited (HTTP 429). Waiting ${waitMs}ms then retrying (${attempt}/${maxAttempts})...`
      );
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`API Error ${res.status}: ${text || res.statusText}`);
      process.exit(1);
    }

    const data = await res.json();
    const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!out) {
      console.error("Unexpected response:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log(out);
    return;
  }

  console.error("Failed after repeated HTTP 429 responses. Try again later.");
  process.exit(1);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

