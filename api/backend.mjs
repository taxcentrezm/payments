import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(cors());

// ZynlePay credentials
const BASE_URL = 'https://sandbox.zynlepay.com/zynlepay/jsonapi';
const MERCHANT_ID = 'MEC01091';
const API_ID = 'be650f62-b628-4f62-88c4-020487d63b1e';
const API_KEY = '88b1233a-3c3a-4caa-ada3-13c6a0a70281';

// In-memory store for callbacks
const paymentStatus = {};

// 🔹 Initiate Card Payment
app.post('/initiate-card-payment', async (req, res) => {
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
    res.json(response.data);
  } catch (error) {
    console.error('Payment initiation failed:', error.message);
    res.status(500).json({ error: 'Payment initiation failed', details: error.message });
  }
});

// 🔹 Check Payment Status
app.post('/check-payment-status', async (req, res) => {
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
    res.json(result);
  } catch (err) {
    console.error('Status check failed:', err.message);
    res.status(500).json({ error: 'Status check failed', message: err.message });
  }
});

// 🔹 Handle Payment Callback
app.post('/payment-callback', (req, res) => {
  const { reference_no, status } = req.body;

  paymentStatus[reference_no] = status === 'success' ? 'success' : 'failed';

  console.log(`Callback received for ${reference_no}: ${status}`);
  res.status(status === 'success' ? 200 : 400).send(
    status === 'success' ? 'Payment processed' : 'Payment not successful'
  );
});

// 🔹 Start Server (for local testing only)
app.listen(3000, () => console.log('ZynlePay backend running on port 3000'));
