const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connection ready to check Supabase service configuration');
  
  conn.exec('grep -i "sslip.io" /data/coolify/services/k5c5eki60wb4hz51es45rv2b/docker-compose.yml', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    }).on('close', () => {
      console.log('sslip.io matches in compose.yml:\n', output);
      conn.end();
    });
  });
}).connect({
  host: '200.97.166.100',
  port: 22,
  username: 'root',
  password: 'Sudoman@1989'
});
