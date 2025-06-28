const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/userModel');

const router = express.Router();

// Route to send email
router.post('/send-email', authenticateToken, async (req, res) => {
    const { to, subject, body } = req.body;
    const from = req.user.email;

    if (!to || !subject || !body) {
        return res.status(400).json({ message: 'To, Subject, and Body are required.' });
    }

    const postalApiUrl = process.env.POSTAL_API_URL;
    const postalApiKey = process.env.POSTAL_API_KEY;

    if (!postalApiUrl || !postalApiKey) {
        console.error('Postal API URL or Key not set in environment variables.');
        return res.status(500).json({ message: 'Postal service not configured.' });
    }

    try {
        const response = await axios.post(
            postalApiUrl,
            {
                to: [to], 
                from: from,
                subject: subject,
                plain_body: body,
              
            },
            {
                headers: {
                    'X-Server-API-Key': postalApiKey, 
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Email sent via Postal:', response.data);

        await User.addSentEmail(req.user.id, from, [to], subject, body);

        res.status(200).json({ message: 'Email sent and stored!', postalResponse: response.data });

    } catch (err) {
        console.error('Error sending email via Postal or storing:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to send email via Postal or store it.', error: err.response?.data || err.message });
    }
});

// Webhook for inbound emails from Postal
router.post('/webhooks/postal/inbound', async (req, res) => {
    console.log('Received inbound email webhook:', JSON.stringify(req.body, null, 2));

    const emailData = req.body.message; 
    if (!emailData) {
        return res.status(400).json({ message: 'No message data found in webhook body.' });
    }

    const recipientEmail = emailData.to.email; 
    const senderEmail = emailData.from.email;
    const subject = emailData.subject;
    const plainBody = emailData.plain_body;

    try {
       
        const user = await User.findByEmail(recipientEmail);
        if (user) {
            await User.addReceivedEmail(user.id, senderEmail, [recipientEmail], subject, plainBody);
            console.log(`Inbound email for user ${user.email} stored.`);
            res.status(200).json({ message: 'Inbound email received and stored.' });
        } else {
            console.log(`No user found for inbound email recipient: ${recipientEmail}`);
            res.status(404).json({ message: 'Recipient user not found in database.' });
        }
    } catch (error) {
        console.error('Error processing inbound email webhook:', error);
        res.status(500).json({ message: 'Error processing inbound email.' });
    }
});

router.get('/emails', authenticateToken, async (req, res) => {
    const { type } = req.query; 

    try {
        let emails;
        if (type === 'sent') {
            emails = await User.getSentEmails(req.user.id);
        } else if (type === 'inbox') {
            emails = await User.getReceivedEmails(req.user.id);
        } else {
            return res.status(400).json({ message: 'Invalid email type specified. Use "sent" or "inbox".' });
        }
        res.status(200).json(emails);
    } catch (err) {
        console.error(`Error fetching ${type} emails:`, err);
        res.status(500).json({ message: `Failed to fetch ${type} emails.` });
    }
});

module.exports = router;