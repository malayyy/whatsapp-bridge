const axios = require('axios');

// TERA ZOHO URL
const ZOHO_URL = "https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac";

module.exports = async (req, res) => {
    
    // 1. VERIFICATION (GET) - Same as before
    if (req.method === 'GET') {
        const challenge = req.query['hub.challenge'];
        if (challenge) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send('No challenge');
        }
    } 

    // 2. CLEAN & FORWARD (POST) - NEW LOGIC 🔥
    else if (req.method === 'POST') {
        try {
            const body = req.body;
            
            // Safe Navigation to extract data
            // Meta ka complex structure yahi handle kar lenge
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0]?.value;
            const message = changes?.messages?.[0];
            
            if (message) {
                // Sirf kaam ki cheezein nikalo
                const cleanPayload = {
                    phone: message.from, // Sender Phone
                    text: message.text?.body || "[Media/Other]", // Message Body
                    channel_id: changes.metadata?.phone_number_id || "Unknown", // Channel ID
                    timestamp: message.timestamp
                };

                console.log("Forwarding Clean Data:", cleanPayload);

                // Zoho ko Clean JSON bhejo
                await axios.post(ZOHO_URL, cleanPayload);
            }
            
            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error("Error:", error.message);
            res.status(200).send('Error handled');
        }
    } 
    
    else {
        res.status(405).send('Method Not Allowed');
    }
};