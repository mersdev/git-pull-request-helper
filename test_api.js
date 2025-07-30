// Simple test script to verify the Gemini API is working
// Run this in the browser console to test the API directly

// Function to load API key from .env file
async function loadApiKey() {
  try {
    const response = await fetch(chrome.runtime.getURL(".env"));

    if (!response.ok) {
      throw new Error(`Failed to load .env file: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const envVars = text.split("\n").reduce((acc, line) => {
      const [key, value] = line.split("=");
      return key && value ? { ...acc, [key.trim()]: value.trim() } : acc;
    }, {});

    GEMINI_API_KEY = envVars.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      throw new Error("GEMINI_API_KEY not found or not configured in .env file");
    }

    console.log("API key loaded successfully");
    return GEMINI_API_KEY;
  } catch (error) {
    console.error("Error loading API key:", error);
    throw new Error(`Failed to load API key: ${error.message}`);
  }
}


// Global variable to store API key
let GEMINI_API_KEY = null;

// Test function to validate API key on extension startup
async function validateApiKey() {
  try {
    await loadApiKey();
    console.log("API key loaded successfully");

    // Test with a simple request
    await testGeminiAvailability();
    console.log("Gemini API is available and working");
    return true;
  } catch (error) {
    console.error("API validation failed:", error);
    return false;
  }
}



async function testGeminiAPI() { // Your API key from .env
  if (!GEMINI_API_KEY) await loadApiKey();
  const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  
  console.log("Testing Gemini API...");
  
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Explain how AI works in a few words"
              }
            ]
          }
        ]
      })
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      console.log("✅ API is working! Response:", data.candidates[0].content.parts[0].text);
      return true;
    } else {
      console.error("❌ Unexpected response format:", data);
      return false;
    }
    
  } catch (error) {
    console.error("❌ API test failed:", error);
    return false;
  }
}

// Run the test
testGeminiAPI();
