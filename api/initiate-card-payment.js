import axios from 'axios';

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

  const {
    reference_no, amount, description, first_name, last_name,
    address, email, phone, city, state, currency, zip_code, country
} = req.body;

  const payload = {
    auth: {
      merchant_id: 'MEC01091',
      api_id: 'be650f62-b628-4f62-88c4-020487d63b1e',
      api_key: '88b1233a-3c3a-4caa-ada3-13c6a0a70281',
      channel: 'card'
},
    data: {
      method: 'runTranAuthCapture',
      reference_no, amount, description, first_name, last_name,
      address, email, phone, city, state, currency, zip_code, country
}
};

  try {
    const response = await axios.post('https://sandbox.zynlepay.com/zynlepay/jsonapi', payload, {
      headers: { 'Content-Type': 'application/json'}
});
    res.status(200).json(response.data);
} catch (error) {
    res.status(500).json({ error: 'Payment initiation failed', details: error.message});
}
}
