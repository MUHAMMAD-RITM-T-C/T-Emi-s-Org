import { TELEGRAM_BOT_TOKEN } from '../src/lib/botCore.js';

export default async function handler(req: any, res: any) {
  try {
    // Automatically detect the deployment host from request headers
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    
    // Allow custom override via query param ?url=
    const customUrl = req.query?.url as string;
    const webhookUrl = customUrl || `${protocol}://${host}/api/webhook`;

    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: false,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const data = await tgRes.json();

    return res.status(200).json({
      success: data.ok,
      telegramResponse: data,
      registeredWebhookUrl: webhookUrl,
      instructions: data.ok
        ? 'ربات تلگرام شما اکنون با موفقیت به وبهوک ورسل متصل شد و ۲۴ ساعته فعال است!'
        : 'خطا در ثبت وبهوک در تلگرام. لطفاً توکن را بررسی نمایید.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
