import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    const year = new Date().getFullYear();
    const contractorId = generateContractorId(data.company_name, data.tpin, year);

    await db.execute({
      sql: `INSERT INTO contractors (id, company_name, physical_address, town, phone, mobile, email, company_type, business_description, registration_year, status)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [contractorId, data.company_name, data.physical_address, data.town, data.phone, data.mobile, data.email, data.company_type, data.business_description, year, 'pending']
    });

    for (const branch of data.branches || []) {
      await db.execute({
        sql: `INSERT INTO branches (contractor_id, branch_physical, branch_postal, branch_phone, branch_mobile, branch_email)
              VALUES (?,?,?,?,?,?)`,
        args: [contractorId, branch.physical, branch.postal, branch.phone, branch.mobile, branch.email]
      });
    }

    for (const shareholder of data.shareholders || []) {
      await db.execute({
        sql: `INSERT INTO shareholders (contractor_id, shareholder_name, shareholder_nrc, shareholder_status, ownership_type, shareholding, shareholder_qualification)
              VALUES (?,?,?,?,?,?,?)`,
        args: [contractorId, shareholder.name, shareholder.nrc, shareholder.status, shareholder.ownership_type, shareholder.shareholding, shareholder.qualification]
      });
    }

    for (const tech of data.technical_personnel || []) {
      await db.execute({
        sql: `INSERT INTO technical_personnel (contractor_id, professional_name, professional_qualification, professional_nrc, professional_mobile, professional_cv)
              VALUES (?,?,?,?,?,?)`,
        args: [contractorId, tech.name, tech.qualification, tech.nrc, tech.mobile, tech.cv]
      });
    }

    await db.execute({
      sql: `INSERT INTO assets (contractor_id, fixed_assets, equipment_list, asset_proof, equipment_proof)
            VALUES (?,?,?,?,?)`,
      args: [contractorId, data.fixed_assets, data.equipment_list, data.asset_proof, data.equipment_proof]
    });

    await db.execute({
      sql: `INSERT INTO contracts (contractor_id, completed_projects, ongoing_projects, completion_certificates, contract_docs)
            VALUES (?,?,?,?,?)`,
      args: [contractorId, data.completed_projects, data.ongoing_projects, data.completion_certificates, data.contract_docs]
    });

    for (const ref of data.references || []) {
      const referenceId = `REF-${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO contractor_references (reference_id, contractor_id, referee_name, referee_firm, referee_phone, referee_email, client_name, client_org)
              VALUES (?,?,?,?,?,?,?,?)`,
        args: [referenceId, contractorId, ref.name, ref.firm, ref.phone, ref.email, ref.client_name, ref.client_org]
      });
    }

    await db.execute({
      sql: `INSERT INTO declarations (contractor_id, declaration, declarer_name, witness_name)
            VALUES (?,?,?,?)`,
      args: [contractorId, data.declaration, data.declarer_name, data.witness_name]
    });

    await db.execute({
      sql: `INSERT INTO payments (contractor_id, reference_no, amount, payment_proof, status)
            VALUES (?,?,?,?,?)`,
      args: [contractorId, data.payment_reference, data.payment_amount, data.payment_proof, 'uncleared']
    });

    const invoiceId = `INV-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO invoices (invoice_id, contractor_id, issued_date, due_date, amount, service_type, status, reference_no)
            VALUES (?,?,?,?,?,?,?,?)`,
      args: [invoiceId, contractorId, new Date().toISOString(), null, data.payment_amount, 'registration', 'unpaid', data.payment_reference]
    });

    res.status(200).json({ success: true, contractorId, invoiceId });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
}

function generateContractorId(name, tpin, year) {
  const prefix = name.trim().slice(0, 4).toUpperCase();
  const digits = tpin.slice(-3);
  return `NCC-${prefix}${digits}-${year}`;
}
