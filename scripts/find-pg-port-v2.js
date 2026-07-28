const net = require('net');

const host = '200.97.166.100';
const ports = [54321, 54322, 54323, 80, 443, 3000, 8000, 8443, 5432, 6543, 9000];

async function checkPort(port) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is OPEN on ${host}`);
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  console.log(`Scanning ports on ${host}...`);
  for (const p of ports) {
    await checkPort(p);
  }
}

main();
