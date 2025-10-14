const express = require('express');
import fetch from 'node-fetch';
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());


// credentials
const BASE_URL = 'https://sandbox.zynlepay.com/zynlepay/jsonapi';
const MERCHANT_ID = 'MEC01091';
const API_ID = 'be650f62-b628-4f62-88c4-020487d63b1e';
const API_KEY = '88b1233a-3c3a-4caa-ada3-13c6a0a70281';

//  Initiate Card Deposit
app.post('/initiate-card-payment', async (req, res) => {
  console.log('Received payment request:', req.body);
  const {
    reference_no,
    amount,
    description,
    first_name,
    last_name,
    address,
    email,
    phone,
    city,
    state,
    currency,
    zip_code,
    country
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
      reference_no,
      amount,
      description,
      first_name,
      last_name,
      address,
      email,
      phone,
      city,
      state,
      currency,
      zip_code,
      country
}
};

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
});

    const result = await response.json();
    res.json(result);
} catch (err) {
    res.status(500).json({ error: 'Payment initiation failed', message: err.message});
}
});

// Check Payment Status
app.post('/check-payment-status', async (req, res) => {
  console.log('Received payment request:', req.body); //  

  const { reference_no} = req.body;

  const payload = {
    reference_no,
    api_id: API_ID,
    api_key: API_KEY
};

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
});

   const result = await response.json();
console.log('ZynlePay response:', result); // ✅ Add this
res.json(result);
} catch (err) {
    console.error('Error checking payment status:', err.message);
    res.status(500).json({ error: 'Status check failed', message: err.message});
}
});

//  Handle Callback 
app.post('/callback', (req, res) => {
  console.log('Callback received:', req.body);
  res.sendStatus(200);
});

app.listen(3000, () => console.log('ZynlePay demo backend running on port 3000'));