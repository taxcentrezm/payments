import axios from 'axios';

const BASE_URL = 'https://sandbox.zynlepay.com/zynlepay/jsonapi';
const MERCHANT_ID = 'MEC01091';
const API_ID = 'be650f62-b628-4f62-88c4-020487d63b1e';
const API_KEY = '88b1233a-3c3a-4caa-ada3-13c6a0a70281';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    reference_no, amount, description, first_name, last_name,
    address, email, phone, city, state, currency, zip_code, country
  } = req.body;

  const payload = {
    auth: {
      merchant_id: MERCHANT_ID,
      api_id: API_ID,
      api_key: API_KEY,
      channel: 'card'
    },
    data: {
      method: 'runTranAuthCapture',
      reference_no, amount, description, first_name, last_name,
      address, email, phone, city, state, currency, zip_code, country
    }
  };

  try {
    const response = await axios.post(BASE_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Payment initiation failed:', error.message);
    res.status(500).json({ error: 'Payment initiation failed', details: error.message });
  }
}
