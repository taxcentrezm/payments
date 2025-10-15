import { createClient } from '@libsql/client';

let db;
try {
  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
} catch (initError) {
  console.error("DB init error:", initError.message);
}

export default async function handler(req, res) {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { contractorId } = req.query;

  if (!contractorId) {
    return res.status(400).json({ error: 'Missing contractorId' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  try {
    const result = await db.execute({
      sql: `SELECT COUNT(*) AS count FROM invoices WHERE contractor_id = ? AND status != 'paid'`,
      args: [contractorId]
    });

    const hasOutstandingBalance = result.rows[0]?.count > 0;
    res.status(200).json({ hasOutstandingBalance });
  } catch (err) {
    console.error("Balance check error:", err.message);
    res.status(500).json({ error: "Failed to check balance", details: err.message });
  }
}
