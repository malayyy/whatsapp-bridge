// Native fetch use kar rahe hain, No Import Needed, No Axios Needed
export default async function handler(req, res) {
  
  // --- 1. META VERIFICATION (GET) ---
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if token matches 'rrp123'
    if (mode && token) {
      if (mode === 'subscribe' && token === 'rrp123') {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification failed' });
      }
    } else {
        return res.status(400).send('Missing parameters');
    }
  }

  // --- 2. INCOMING MESSAGE (POST) ---
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('Raw Meta Body:', JSON.stringify(body, null, 2));

      // Check if it's a Message (not a status update)
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        // --- DATA CLEANING (Ye hai wo step jo NULL fix karega) ---
        const value = body.entry[0].changes[0].value;
        const message = value.messages[0];

        // Extract clean data
        const cleanPayload = {
            phone: message.from,
            text: message.text ? message.text.body : "Media/Other",
            channel_id: value.metadata.phone_number_id,
            timestamp: message.timestamp
        };

        console.log('Sending Clean Data to Zoho:', cleanPayload);

        // --- SEND TO ZOHO ---
        const zohoUrl = "https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac";

        // Native Fetch Request
        const response = await fetch(zohoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanPayload)
        });

        // Response Log
        const responseText = await response.text();
        console.log('Zoho Response:', responseText);

        return res.status(200).send('EVENT_RECEIVED');
      }

      // Agar message nahi hai (Status update like 'read', 'delivered'), ignore karo
      return res.status(200).send('Not a message');

    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).send('Server Error');
    }
  }

  return res.status(405).send('Method Not Allowed');
}