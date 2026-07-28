const path = require('path');
const fs = require('fs');

// Simple manual parser for .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function testPhoneAuth() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: "+919876543210", // A real Indian number format
        recaptchaToken: "DUMMY_TOKEN_FOR_DIAGNOSTICS" // Firebase SDK handles this token, but we send a dummy to see Google's response
      })
    });
    
    const data = await response.json();
    console.log("\n--- Google API Phone Auth Response Status ---");
    console.log(`Status Code: ${response.status}`);
    console.log("\n--- Google API Phone Auth Response Body ---");
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

testPhoneAuth();
