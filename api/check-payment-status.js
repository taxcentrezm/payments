import fetch from 'node-fetch';

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

  const { reference_no} = req.body;

  const payload = {
    reference_no,
    api_id: 'be650f62-b628-4f62-88c4-020487d63b1e',
    api_key: '88b1233a-3c3a-4caa-ada3-13c6a0a70281'
};

  try {
    const response = await fetch('https://sandbox.zynlepay.com/zynlepay/jsonapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
});

    const result = await response.json();
    res.status(200).json(result);
} catch (err) {
    res.status(500).json({ error: 'Status check failed', message: err.message});
}
}
