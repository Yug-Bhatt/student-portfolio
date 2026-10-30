/**
 * Unit Test for Practical 13 AI API Integration
 * Verifies:
 * 1. Input title validation
 * 2. Safe missing API key rejection
 * 3. Gemini payload parsing and response extraction
 * 4. Error response handling from AI providers
 * 5. OpenAI provider fallback behavior
 * 6. Conditional live test if API key is present in environment
 */
require("dotenv").config();
const assert = require("assert");
const { generateDescription } = require("./aiService");

console.log("--- Starting Practical 13 AI API Integration Unit Tests ---");

async function runTests() {
  // Test 1: Empty or Invalid Title Validation
  let titleError = null;
  try {
    await generateDescription("");
  } catch (err) {
    titleError = err;
  }
  assert.ok(titleError, "Must throw an error for empty title");
  assert.strictEqual(titleError.code, "INVALID_TITLE");
  console.log("✓ Test 1 Passed: Empty title input validation handled safely");

  // Test 2: Missing API Key Error Handling
  const savedGeminiKey = process.env.GEMINI_API_KEY;
  const savedGoogleKey = process.env.GOOGLE_API_KEY;
  const savedOpenaiKey = process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.OPENAI_API_KEY;

  let missingKeyError = null;
  try {
    await generateDescription("Build Portfolio Dashboard");
  } catch (err) {
    missingKeyError = err;
  }
  assert.ok(missingKeyError, "Must throw when no API key is provided");
  assert.strictEqual(missingKeyError.code, "MISSING_API_KEY");
  console.log("✓ Test 2 Passed: Missing API key handled gracefully with code MISSING_API_KEY");

  // Test 3: Gemini Mocked Response Parsing
  const mockGeminiFetch = async (url, options) => {
    assert.ok(url.includes("generativelanguage.googleapis.com"));
    const body = JSON.parse(options.body);
    assert.ok(body.contents && body.contents[0].parts[0].text);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Design and implement responsive executive portfolio dashboard with MongoDB metrics.",
                },
              ],
            },
          },
        ],
      }),
    };
  };

  const geminiResult = await generateDescription("Build Portfolio Dashboard", {
    geminiApiKey: "mock-gemini-key",
    fetchFn: mockGeminiFetch,
  });

  assert.strictEqual(
    geminiResult.description,
    "Design and implement responsive executive portfolio dashboard with MongoDB metrics."
  );
  assert.strictEqual(geminiResult.provider, "gemini");
  console.log("✓ Test 3 Passed: Gemini response extracted correctly");

  // Test 4: Gemini API Error Response Handling
  const mockGeminiErrorFetch = async () => ({
    ok: false,
    status: 403,
    statusText: "Forbidden",
    json: async () => ({
      error: { message: "API key expired or invalid" },
    }),
  });

  let geminiApiError = null;
  try {
    await generateDescription("Test Error Handling", {
      geminiApiKey: "bad-key",
      fetchFn: mockGeminiErrorFetch,
    });
  } catch (err) {
    geminiApiError = err;
  }
  assert.ok(geminiApiError);
  assert.strictEqual(geminiApiError.code, "AI_API_ERROR");
  assert.ok(geminiApiError.message.includes("API key expired"));
  console.log("✓ Test 4 Passed: AI API HTTP errors trapped and surfaced gracefully");

  // Test 5: OpenAI Fallback Provider Parsing
  const mockOpenAiFetch = async (url, options) => {
    assert.ok(url.includes("api.openai.com"));
    assert.strictEqual(options.headers.Authorization, "Bearer mock-openai-key");
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Configure Docker Compose network and Nginx reverse proxy.",
            },
          },
        ],
      }),
    };
  };

  const openaiResult = await generateDescription("Setup Nginx Reverse Proxy", {
    openaiApiKey: "mock-openai-key",
    fetchFn: mockOpenAiFetch,
  });

  assert.strictEqual(
    openaiResult.description,
    "Configure Docker Compose network and Nginx reverse proxy."
  );
  assert.strictEqual(openaiResult.provider, "openai");
  console.log("✓ Test 5 Passed: OpenAI fallback provider parsed correctly");

  // Restore environment
  if (savedGeminiKey) process.env.GEMINI_API_KEY = savedGeminiKey;
  if (savedGoogleKey) process.env.GOOGLE_API_KEY = savedGoogleKey;
  if (savedOpenaiKey) process.env.OPENAI_API_KEY = savedOpenaiKey;

  // Test 6: Live API Key Verification (if configured)
  const activeKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (activeKey) {
    console.log("Testing live AI API call with configured environment key...");
    try {
      const liveResult = await generateDescription(
        "Deploy student portfolio to Docker container"
      );
      assert.ok(liveResult.description && liveResult.description.length > 10);
      assert.strictEqual(liveResult.provider, "gemini");
      console.log(`✓ Test 6 Passed: Live generation succeeded via ${liveResult.provider} (${liveResult.model}):`);
      console.log(`  "${liveResult.description}"`);
    } catch (err) {
      console.error(`✗ Test 6 Failed: Live generation failed with configured key: ${err.message}`);
      throw err;
    }
  } else {
    console.log("ⓘ Note: Live AI generation remains unverified (no live GEMINI_API_KEY found in backend/.env).");
  }

  console.log("--- All Practical 13 AI Unit Tests Passed Successfully! ---");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
