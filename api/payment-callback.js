const paymentStatus = {};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reference_no, status } = req.body;

  paymentStatus[reference_no] = status === 'success' ? 'success' : 'failed';

  console.log(`Callback received for ${reference_no}: ${status}`);
  res.status(status === 'success' ? 200 : 400).send(
    status === 'success' ? 'Payment processed' : 'Payment not successful'
  );
}
