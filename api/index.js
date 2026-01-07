export default async function handler(req, res) {
  // 1. GET Request (Verification) - Same as before
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
      if (mode === 'subscribe' && token === 'rrp123') {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification failed' });
      }
    }
  }

  // 2. POST Request (Incoming Message)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        // --- DATA EXTRACT ---
        const value = body.entry[0].changes[0].value;
        const message = value.messages[0];

        const cleanPayload = {
            phone: message.from,
            text: message.text ? message.text.body : "Media/Other",
            channel_id: value.metadata.phone_number_id,
            timestamp: message.timestamp
        };

        // 🔥🔥🔥 THE WRAPPER FIX 🔥🔥🔥
        // Zoho maangta hai "arg", hum denge "arg"!
        // Hum data ko stringify karke 'arg' key mein daal rahe hain.
        const zohoWrapper = {
            "arg": JSON.stringify(cleanPayload) 
        };

        console.log('Sending Wrapped Data to Zoho:', zohoWrapper);

        const zohoUrl = "https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac";

        // Native Fetch
        await fetch(zohoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(zohoWrapper) // Ab Zoho ko milega { "arg": "..." }
        });

        return res.status(200).send('EVENT_RECEIVED');
      }

      return res.status(200).send('Not a message');

    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).send('Server Error');
    }
  }
}