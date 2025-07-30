// Simple test script to verify the Gemini API is working
// Run this in the browser console to test the API directly

async function testGeminiAPI() {
  const API_KEY = "AIzaSyCmHtQviGxJkc6S8YIBNyt48oZw8hYSwMU"; // Your API key from .env
  const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  
  console.log("Testing Gemini API...");
  
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY
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
