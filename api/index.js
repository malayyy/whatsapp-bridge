export default async function handler(req, res) {
  // 1. VERIFICATION REQUEST (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === 'rrp123') {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification failed' });
      }
    }
  }

  // 2. INCOMING MESSAGE (POST)
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
          // --- EXTRACT DATA ---
          const value = body.entry[0].changes[0].value;
          const message = value.messages[0];
          
          const phone = message.from; 
          const text = message.text ? message.text.body : "Media/Other"; 
          const channelID = value.metadata.phone_number_id; 
          const timestamp = message.timestamp;

          // --- PREPARE PAYLOAD ---
          const zohoPayload = {
            phone: phone,
            text: text,
            channel_id: channelID,
            timestamp: timestamp
          };

          console.log('Sending to Zoho:', zohoPayload);

          // --- SEND TO ZOHO (USING FETCH INSTEAD OF AXIOS) ---
          const zohoUrl = 'https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac'; 

          // Native Fetch Call (No Install Required)
          const response = await fetch(zohoUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(zohoPayload)
          });

          // Check Zoho Response
          if (!response.ok) {
             const errorText = await response.text();
             console.error('Zoho Error:', errorText);
          } else {
             console.log('Zoho Success:', await response.text());
          }
          
          return res.status(200).send('EVENT_RECEIVED');
        }
      }
      
      return res.status(200).send('Not a message event');

    } catch (error) {
      console.error('Error forwarding to Zoho:', error.message);
      return res.status(500).send('Server Error: ' + error.message);
    }
  }

  return res.status(405).send('Method Not Allowed');
}