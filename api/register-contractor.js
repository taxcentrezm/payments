import { createClient} from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed'});

  const { name, tpin, category, email, phone, address} = req.body;
  const year = new Date().getFullYear();
  const contractorId = generateContractorId(name, tpin, year);

  try {
    await db.execute({
      sql: `INSERT INTO contractors (id, name, tpin, category, registration_year, email, phone, address, status)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [contractorId, name, tpin, category, year, email, phone, address, 'pending']
});

    // Optionally create an invoice
    const invoiceId = `INV-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO invoices (invoice_id, contractor_id, issued_date, due_date, amount, status)
            VALUES (?,?,?,?,?,?)`,
      args: [invoiceId, contractorId, new Date().toISOString(), null, 0.00, 'unpaid']
});

    res.status(200).json({ success: true, contractorId});
} catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed', details: err.message});
}
}

function generateContractorId(name, tpin, year) {
  const prefix = name.trim().slice(0, 4).toUpperCase();
  const digits = tpin.slice(-3);
  return `NCC-${prefix}${digits}-${year}`;
}
