export default async function handler(req, res) {
  // 1. VERIFICATION (GET) - One Line
  if (req.method === 'GET') return res.status(200).send(req.query['hub.challenge']);

  // 2. INCOMING MESSAGE (POST)
  if (req.method === 'POST') {
    try {
      // Data Extract (Safely)
      const value = req.body?.entry?.[0]?.changes?.[0]?.value;
      const msg = value?.messages?.[0];

      // Agar message nahi hai to ignore karo
      if (!msg) return res.status(200).send('No message');

      // Clean Payload create karo
      const payload = {
        phone: msg.from,
        text: msg.text?.body || "Media/Other",
        channel_id: value.metadata?.phone_number_id
      };

      // 🛑 YE RAHA LOG - Isse tu Vercel Logs me Data dekh payega
      console.log("🚀 SENDING TO ZOHO:", JSON.stringify(payload, null, 2));

      // 🚀 SENDING TO ZOHO (Via URL Param to prevent NULL)
      const zohoBase = "https://www.zohoapis.in/crm/v7/functions/whatsapp_incoming_webhook/actions/execute?auth_type=apikey&zapikey=1003.1bdd5ee3d2423e59f12acc74b399a06b.3808e22628d76ba68d06e0b6524c98ac";
      
      // Data ko string bana ke URL me jod diya. 100% Success Rate.
      await fetch(`${zohoBase}&arg=${encodeURIComponent(JSON.stringify(payload))}`, { 
          method: 'POST' 
      });

      return res.status(200).send('Sent');
    } catch (e) {
      console.error("❌ ERROR:", e.message);
      return res.status(500).send('Error');
    }
  }
}