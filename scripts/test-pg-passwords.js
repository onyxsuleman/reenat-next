const { Client } = require('pg');

const passwords = [
  'postgres',
  'naseebayusuf',
  'admin123',
  'root',
  'Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo'
];

async function testPass() {
  for (const pass of passwords) {
    try {
      console.log(`Testing password: ${pass.substring(0, 10)}...`);
      const client = new Client({
        host: '200.97.166.100',
        port: 5432,
        user: 'postgres',
        password: pass,
        database: 'postgres',
        connectionTimeoutMillis: 2000
      });
      await client.connect();
      console.log(`✅ SUCCESS! Connected to Postgres with password "${pass}"!`);
      await client.end();
      return pass;
    } catch (err) {
      console.warn(`Password test failed: ${err.message}`);
    }
  }
}

testPass();
