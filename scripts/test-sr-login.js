const https = require('https');

const postData = JSON.stringify({
  email: 'onyxsuleman@gmail.com',
  password: 'Apple@6003'
});

const req = https.request({
  hostname: 'apiv2.shiprocket.in',
  port: 443,
  path: '/v1/external/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(postData);
req.end();
