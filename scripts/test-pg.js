const { Client } = require('pg');

async function testConnection() {
  const connectionStrings = [
    'postgres://postgres:postgres@200.97.166.100:5432/postgres',
    'postgres://postgres:postgres@200.97.166.100:6543/postgres',
    'postgres://postgres.supabasekong:postgres@200.97.166.100:5432/postgres'
  ];

  for (const conn of connectionStrings) {
    try {
      console.log(`Trying ${conn}...`);
      const client = new Client({ connectionString: conn, connectionTimeoutMillis: 3000 });
      await client.connect();
      console.log(`✅ Connected successfully to Postgres using: ${conn}`);
      const res = await client.query('SELECT NOW();');
      console.log('Result:', res.rows[0]);
      await client.end();
      return conn;
    } catch (err) {
      console.warn(`Connection failed: ${err.message}`);
    }
  }
}

testConnection();
