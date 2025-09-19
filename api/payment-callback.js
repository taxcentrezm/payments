const paymentStatus = {}; // In-memory store (consider using a DB for production)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight request
}

  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed'});
}

  const { reference_no, status, transaction_id, amount} = req.body;

  if (status === 'success') {
    paymentStatus[reference_no] = 'success';
    console.log(`✅ Payment confirmed for ${reference_no}`);
    res.status(200).send('Payment processed');
} else {
    paymentStatus[reference_no] = 'failed';
    console.warn(`❌ Payment failed for ${reference_no}`);
    res.status(400).send('Payment not successful');
}
}
