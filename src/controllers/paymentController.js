const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const moment = require('moment-timezone');
const axios = require('axios');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
exports.createPaymentLink = async (req, res) => {
    const { optionData, _id } = req.body;
    try {
       // Parse price (remove $ if present, convert to cents)
        const priceNumber = Number(optionData.price.replace('$', '').replace('.00', '').trim());
        const amount = Math.round(priceNumber * 100); // Stripe expects cents

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: optionData.title,
                        description: optionData.description,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://a8f2-91-239-130-102.ngrok-free.app/payment-success',
            cancel_url: 'https://a8f2-91-239-130-102.ngrok-free.app/payment-cancel',
            metadata: {
                user_id: _id,
                option_id: optionData.id
            }
        });
        res.json({ paymentLink: session.url });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ message: error.message });
  }
};
