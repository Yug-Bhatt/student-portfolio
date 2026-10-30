/**
 * AI Service for Practical 13
 * Generates task descriptions from task titles using Google Gemini (or OpenAI fallback).
 * Reads API keys strictly from backend environment variables.
 */

async function generateDescription(title, options = {}) {
  if (!title || typeof title !== "string" || !title.trim()) {
    const err = new Error("Task title is required to generate description");
    err.code = "INVALID_TITLE";
    throw err;
  }

  const geminiApiKey =
    options.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiApiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;

  if (!geminiApiKey && !openaiApiKey) {
    const err = new Error(
      "AI API key is not configured. Please set GEMINI_API_KEY in backend/.env"
    );
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const prompt = `You are a helpful software assistant. Given this task title:
"${title.trim()}"

Generate a clear, professional, and actionable task description (2-3 concise sentences or a short bulleted list). Provide ONLY the description text without markdown headings, surrounding quotes, or preamble.`;

  // 1. Google Gemini Provider (Primary)
  if (geminiApiKey) {
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

    const fetchImpl = options.fetchFn || fetch;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.error?.message ||
        `Gemini API error (Status ${response.status}): ${response.statusText}`;
      const err = new Error(errorMsg);
      err.code = "AI_API_ERROR";
      err.statusCode = response.status;
      throw err;
    }

    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      const err = new Error("AI provider returned an empty description");
      err.code = "EMPTY_AI_RESPONSE";
      throw err;
    }

    return {
      description: text,
      provider: "gemini",
      model,
    };
  }

  // 2. OpenAI Fallback Provider
  if (openaiApiKey) {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const url = "https://api.openai.com/v1/chat/completions";

    const fetchImpl = options.fetchFn || fetch;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful software assistant. Generate clear, professional, and actionable task descriptions (2-3 concise sentences or short bullet points). Output only the description text.",
          },
          {
            role: "user",
            content: `Task Title: "${title.trim()}"`,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.error?.message ||
        `OpenAI API error (Status ${response.status}): ${response.statusText}`;
      const err = new Error(errorMsg);
      err.code = "AI_API_ERROR";
      err.statusCode = response.status;
      throw err;
    }

    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      const err = new Error("AI provider returned an empty description");
      err.code = "EMPTY_AI_RESPONSE";
      throw err;
    }

    return {
      description: text,
      provider: "openai",
      model,
    };
  }
}

module.exports = {
  generateDescription,
};
