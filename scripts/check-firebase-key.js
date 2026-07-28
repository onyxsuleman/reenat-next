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
if (!apiKey) {
  console.error("Error: NEXT_PUBLIC_FIREBASE_API_KEY is not defined in .env.local");
  process.exit(1);
}

console.log(`Testing Firebase API Key: ${apiKey.substring(0, 10)}...`);

async function testKey() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "test_temp_email@example.com",
        password: "TempPassword123",
        returnSecureToken: true
      })
    });
    
    const data = await response.json();
    console.log("\n--- Google API Response Status ---");
    console.log(`Status Code: ${response.status}`);
    console.log("\n--- Google API Response Body ---");
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

testKey();
