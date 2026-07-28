const https = require('https');

const url = 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1784652238005_xed8kfz.png';

console.log('Fetching:', url);

const req = https.get(url, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (err) => {
  console.error('Error fetching image:', err.message || err);
});
