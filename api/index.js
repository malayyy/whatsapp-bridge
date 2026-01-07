const axios = require('axios');

// Tera URL (As requested)
const ZOHO_URL = "https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac";

module.exports = async (req, res) => {
    
    // 1. META VERIFICATION (GET)
    if (req.method === 'GET') {
        const challenge = req.query['hub.challenge'];
        if (challenge) {
            // Meta ko Plain Text chahiye, ye wahi dega
            res.status(200).send(challenge);
        } else {
            res.status(403).send('No challenge found');
        }
    } 

    // 2. FORWARD MESSAGE (POST)
    else if (req.method === 'POST') {
        try {
            // Seedha Zoho ko forward
            await axios.post(ZOHO_URL, req.body);
            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {

            await axios.post(ZOHO_URL, "Error aagyi");
            // Error aaya toh bhi Meta ko 200 bhejo taaki wo retry na kare
            console.error(error.message);
            res.status(200).send('Forwarded with error');
        }
    } 
    
    else {
        res.status(405).send('Method Not Allowed');
    }
};