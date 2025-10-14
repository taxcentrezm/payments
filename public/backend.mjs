import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());


// credentials
const BASE_URL = 'https://sandbox.zynlepay.com/zynlepay/jsonapi';
const MERCHANT_ID = 'MEC01091';
const API_ID = 'be650f62-b628-4f62-88c4-020487d63b1e';
const API_KEY = '88b1233a-3c3a-4caa-ada3-13c6a0a70281';

// Initiate Card Deposit
import axios from 'axios';

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
    const response = await axios.post('https://sandbox.zynlepay.com/zynlepay/jsonapi', payload, {
      headers: { 'Content-Type': 'application/json'}
});

    console.log('ZynlePay response:', response.data);
    res.json(response.data); 
} catch (error) {
    console.error('ZynlePay API error:', error.message);
    res.status(500).json({ error: 'Payment initiation failed', details: error.message});
}
});

// Check Payment Status
app.post('/check-payment-status', async (req, res) => {
  console.log('Received payment request:', req.body);

  const { reference_no } = req.body;

  const payload = {
    reference_no,
    api_id: API_ID,
    api_key: API_KEY
  };

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('ZynlePay response:', result);
    res.json(result);
  } catch (err) {
    console.error('Error checking payment status:', err.message);
    res.status(500).json({ error: 'Status check failed', message: err.message });
  }
});

// Handle Callback
app.post('/payment-callback', async (req, res) => {
  const { reference_no, status, transaction_id, amount} = req.body;

  if (status === 'success') {
    // Save transaction to DB or memory
    paymentStatus[reference_no] = 'success';
    console.log(`Payment confirmed for ${reference_no}`);
    res.status(200).send('Payment processed');
} else {
    paymentStatus[reference_no] = 'failed';
    console.warn(` Payment failed for ${reference_no}`);
    res.status(400).send('Payment not successful');
}
});

app.listen(3000, () => console.log('ZynlePay demo backend running on port 3000'));