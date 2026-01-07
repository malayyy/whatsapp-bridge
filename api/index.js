import axios from 'axios';

export default async function handler(req, res) {
  // 1. VERIFICATION REQUEST (GET) - Ye wahi hai jo Meta verify karta hai
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === 'rrp123') { // Tera Token 'rrp123'
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification failed' });
      }
    }
  }

  // 2. INCOMING MESSAGE (POST) - Ye hai asli kaam
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Incoming Meta Body:', JSON.stringify(body, null, 2));

      // Check if it is a WhatsApp message
      if (body.object) {
        if (
          body.entry &&
          body.entry[0].changes &&
          body.entry[0].changes[0].value.messages &&
          body.entry[0].changes[0].value.messages[0]
        ) {
          // --- EXTRACT DATA (Safai Abhiyan) ---
          const value = body.entry[0].changes[0].value;
          const message = value.messages[0];
          
          // Data nikaalo
          const phone = message.from; // Sender Number
          const text = message.text ? message.text.body : "Media/Other"; // Message Text
          const channelID = value.metadata.phone_number_id; // Kis number pe aaya
          const timestamp = message.timestamp;

          // --- PREPARE CLEAN PAYLOAD FOR ZOHO ---
          const zohoPayload = {
            phone: phone,
            text: text,
            channel_id: channelID,
            timestamp: timestamp
          };

          console.log('Sending to Zoho:', zohoPayload);

          // --- SEND TO ZOHO WEBHOOK ---
          // Yahan apni ZOHO WEBHOOK URL daal dena (API Key mat bhoolna agar hai to)
          // Example URL: https://crm.zoho.in/crm/v7/functions/WhatsApp_Incoming_Webhook/actions/execute?auth_type=apikey&zapikey=...
          
          const zohoUrl = 'https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac'; 

          await axios.post(zohoUrl, zohoPayload);
          
          return res.status(200).send('EVENT_RECEIVED');
        }
      }
      
      return res.status(200).send('Not a message event');

    } catch (error) {
      console.error('Error forwarding to Zoho:', error.message);
      return res.status(500).send('Server Error');
    }
  }

  return res.status(405).send('Method Not Allowed');
}