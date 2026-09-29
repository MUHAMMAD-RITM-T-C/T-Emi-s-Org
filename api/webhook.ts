import { handleBotIncoming, callTelegram } from '../src/lib/botCore.js';

export default async function handler(req: any, res: any) {
  // Allow health check via GET
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      status: 'active',
      service: 'RITM Studio Telegram Webhook',
      bot: '@RITM_FreeLancbot',
      time: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const update = req.body;
    if (!update) {
      return res.status(400).json({ ok: false, error: 'No update payload received' });
    }

    if (update.message) {
      const msg = update.message;
      await handleBotIncoming({
        chatId: msg.chat.id,
        userId: msg.from.id,
        text: msg.text || '',
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
      });
    } else if (update.callback_query) {
      const cb = update.callback_query;
      await callTelegram('answerCallbackQuery', { callback_query_id: cb.id });
      await handleBotIncoming({
        chatId: cb.message?.chat?.id || cb.from.id,
        userId: cb.from.id,
        callbackData: cb.data,
        username: cb.from.username,
        firstName: cb.from.first_name,
        lastName: cb.from.last_name,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook Execution Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
