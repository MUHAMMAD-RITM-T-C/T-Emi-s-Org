import { createClient } from '@supabase/supabase-js';

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8933995842:AAEe4N1I4FM3yspFyY85bjN87njJ1lZr6qY';
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kydrkdyxfcavsfkinusp.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHJrZHl4ZmNhdnNma2ludXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU5Nzk1OCwiZXhwIjoyMTA2MTczOTU4fQ.EJLK_9jKeX9sXogTgZSJbZn6yfoxRTUkKLidlo5QFYY';
export const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID ? parseInt(process.env.ADMIN_TELEGRAM_ID, 10) : 8770212764;
export const APP_URL = process.env.APP_URL || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export interface UserSession {
  step: 'idle' | 'category' | 'name' | 'contact' | 'budget' | 'deadline' | 'description' | 'confirm';
  data: {
    project_type?: 'video' | 'web' | 'mobile' | 'other';
    full_name?: string;
    contact?: string;
    contact_type?: string;
    budget?: string;
    deadline?: string;
    description?: string;
  };
  language: 'fa' | 'en';
}

export const userSessions = new Map<number, UserSession>();
export const recentBotLogs: Array<{ id: string; time: string; level: 'info' | 'warn' | 'error'; message: string }> = [];

export function logBot(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const time = new Date().toLocaleTimeString('fa-IR');
  recentBotLogs.unshift({ id: Math.random().toString(36).substring(2, 9), time, level, message });
  if (recentBotLogs.length > 80) recentBotLogs.pop();
  console.log(`[Bot ${level.toUpperCase()}] ${message}`);
}

export async function callTelegram(method: string, payload: Record<string, any>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error(`Telegram call failed for ${method}:`, error);
    return { ok: false, error: String(error) };
  }
}

export async function syncUserToDb(tgUser: { id: number; username?: string; first_name?: string; last_name?: string }) {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('telegram_id', tgUser.id)
      .maybeSingle();

    const isAdmin = tgUser.id === ADMIN_TELEGRAM_ID || existing?.is_admin || false;

    if (existing) {
      await supabase
        .from('users')
        .update({
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
          last_seen: new Date().toISOString(),
          is_admin: isAdmin,
        })
        .eq('telegram_id', tgUser.id);
      return existing.id;
    } else {
      const { data: inserted } = await supabase
        .from('users')
        .insert({
          telegram_id: tgUser.id,
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
          language: 'fa',
          is_admin: isAdmin,
          is_blocked: false,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .select('id')
        .single();
      return inserted?.id || null;
    }
  } catch (err) {
    console.error('Error syncing user to Supabase:', err);
    return null;
  }
}

export function getMainReplyKeyboard(webAppUrl?: string, isAdmin: boolean = false) {
  const keyboard: Array<Array<{ text: string; web_app?: { url: string } }>> = [
    [{ text: '📝 ثبت سفارش پروژه' }, { text: '💼 نمونه کارها' }],
    [{ text: '⚡ خدمات و تعرفه‌ها' }, { text: '📋 پیگیری سفارش‌های من' }],
    [{ text: '📞 تماس و مشاوره' }, { text: 'ℹ️ درباره ریتم' }]
  ];
  if (webAppUrl) {
    keyboard.unshift([{ text: '🚀 باز کردن وب‌اپلیکیشن ریتم', web_app: { url: webAppUrl } }]);
  }
  if (isAdmin) {
    if (webAppUrl) {
      keyboard.push([
        { text: '👑 ورود به پنل مدیریت ریتم', web_app: { url: `${webAppUrl}/?tab=admin` } }
      ]);
    } else {
      keyboard.push([{ text: '👑 ورود به پنل مدیریت ریتم' }]);
    }
  }
  return {
    keyboard,
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function getCategoryKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🎬 تدوین ویدیو و پست‌پروداکشن', callback_data: 'cat_video' }],
      [{ text: '💻 توسعه و طراحی وب‌سایت', callback_data: 'cat_web' }],
      [{ text: '📱 اپلیکیشن موبایل', callback_data: 'cat_mobile' }],
      [{ text: '🎨 هوش مصنوعی و سایر خدمات', callback_data: 'cat_other' }],
      [{ text: '❌ انصراف', callback_data: 'cancel_order' }]
    ]
  };
}

export function getBudgetKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🟢 کمتر از ۱۰ میلیون تومان', callback_data: 'budget_under_10' }],
      [{ text: '🟡 ۱۰ تا ۵۰ میلیون تومان', callback_data: 'budget_10_50' }],
      [{ text: '🟣 بیش از ۵۰ میلیون تومان', callback_data: 'budget_over_50' }],
      [{ text: '⚪ توافقی / نیاز به مشاوره', callback_data: 'budget_custom' }],
      [{ text: '❌ انصراف', callback_data: 'cancel_order' }]
    ]
  };
}

export function getDeadlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '⚡ فوری (کمتر از ۱ هفته)', callback_data: 'dl_urgent' }],
      [{ text: '📅 ۱ تا ۲ هفته', callback_data: 'dl_1_2w' }],
      [{ text: '🗓️ ۲ تا ۴ هفته', callback_data: 'dl_2_4w' }],
      [{ text: '⏳ زمان آزاد / توافقی', callback_data: 'dl_flexible' }],
      [{ text: '❌ انصراف', callback_data: 'cancel_order' }]
    ]
  };
}

export function getConfirmKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✅ تایید نهایی و ارسال سفارش', callback_data: 'confirm_yes' }],
      [
        { text: '✏️ ویرایش مجدد اطلاعات', callback_data: 'confirm_edit' },
        { text: '❌ انصراف و لغو', callback_data: 'cancel_order' }
      ]
    ]
  };
}

export async function handleBotIncoming({
  chatId,
  userId,
  text,
  username,
  firstName,
  lastName,
  callbackData,
  isSimulation = false,
}: {
  chatId: number;
  userId: number;
  text?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  callbackData?: string;
  isSimulation?: boolean;
}) {
  let session = userSessions.get(userId);
  if (!session) {
    session = { step: 'idle', data: {}, language: 'fa' };
    userSessions.set(userId, session);
  }

  if (!isSimulation) {
    await syncUserToDb({ id: userId, username, first_name: firstName, last_name: lastName });
  }

  const cleanText = (text || '').trim();

  const responses: Array<{ text: string; replyMarkup?: any }> = [];
  async function reply(msg: string, replyMarkup?: any) {
    responses.push({ text: msg, replyMarkup });
    if (!isSimulation) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      });
    }
  }

  // Handle Cancel Callback
  if (callbackData === 'cancel_order') {
    session.step = 'idle';
    session.data = {};
    await reply(
      '❌ ثبت سفارش لغو شد.\nهر زمان مایل بودید می‌توانید از طریق منوی اصلی دوباره سفارش خود را ثبت فرمایید.',
      getMainReplyKeyboard(APP_URL)
    );
    return responses;
  }

  // Handle Admin Callbacks
  if (callbackData === 'admin_view_new') {
    const isAdm = userId === ADMIN_TELEGRAM_ID || username === 'AdvRFL';
    if (!isAdm) {
      await reply('⛔ دسترسی غیرمجاز.');
      return responses;
    }

    try {
      const { data: newOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!newOrders || newOrders.length === 0) {
        await reply('✅ در حال حاضر هیچ سفارش جدید در انتظاری وجود ندارد.');
      } else {
        let msg = `📋 <b>آخرین سفارشات جدید (${newOrders.length}):</b>\n\n`;
        const buttons: any[] = [];

        newOrders.forEach((o, i) => {
          msg += `<b>${i + 1}. ${o.order_code}</b> | ${o.full_name}\n`;
          msg += `📁 نوع: ${o.project_type} | 💰 بودجه: ${o.budget}\n`;
          msg += `📞 تماس: ${o.contact}\n`;
          msg += `📝 توضیح: ${o.description.substring(0, 60)}...\n──────────────\n`;

          buttons.push([
            { text: `✅ تایید ${o.order_code}`, callback_data: `approve_${o.id}` },
            { text: `❌ رد ${o.order_code}`, callback_data: `reject_${o.id}` }
          ]);
        });

        await reply(msg, { inline_keyboard: buttons });
      }
    } catch (e) {
      await reply('خطا در دریافت سفارشات جدید.');
    }
    return responses;
  }

  if (callbackData && callbackData.startsWith('approve_')) {
    const orderId = parseInt(callbackData.replace('approve_', ''), 10);
    try {
      const { data: updated } = await supabase
        .from('orders')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();

      if (updated) {
        await reply(`✅ سفارش <b>${updated.order_code}</b> (${updated.full_name}) تایید شد.`);
        if (updated.telegram_id && updated.telegram_id > 0) {
          await callTelegram('sendMessage', {
            chat_id: updated.telegram_id,
            text: `🎉 سفارش شما با کد <b>${updated.order_code}</b> توسط مدیریت تایید شد! جهت هماهنگی مراحل اجرا با شما تماس گرفته خواهد شد.`,
            parse_mode: 'HTML',
          });
        }
      }
    } catch (e) {
      await reply('خطا در تایید سفارش.');
    }
    return responses;
  }

  if (callbackData && callbackData.startsWith('reject_')) {
    const orderId = parseInt(callbackData.replace('reject_', ''), 10);
    try {
      const { data: updated } = await supabase
        .from('orders')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();

      if (updated) {
        await reply(`❌ سفارش <b>${updated.order_code}</b> رد شد.`);
      }
    } catch (e) {
      await reply('خطا در رد سفارش.');
    }
    return responses;
  }

  // Handle Category Selection Callback
  if (callbackData && callbackData.startsWith('cat_')) {
    const catMap: Record<string, 'video' | 'web' | 'mobile' | 'other'> = {
      cat_video: 'video',
      cat_web: 'web',
      cat_mobile: 'mobile',
      cat_other: 'other',
    };
    session.data.project_type = catMap[callbackData] || 'video';
    session.step = 'name';

    const catLabels = {
      video: 'تدوین ویدیو و پست‌پروداکشن 🎬',
      web: 'توسعه و طراحی وب‌سایت 💻',
      mobile: 'اپلیکیشن موبایل 📱',
      other: 'هوش مصنوعی و سایر خدمات 🎨',
    };

    await reply(
      `✅ دسته‌بندی انتخاب شد: <b>${catLabels[session.data.project_type]}</b>\n\n` +
      `👤 لطفاً <b>نام و نام‌خانوادگی</b> یا <b>نام برند/کسب‌و‌کار</b> خود را وارد فرمایید:`
    );
    return responses;
  }

  // Handle Budget Selection Callback
  if (callbackData && callbackData.startsWith('budget_')) {
    const budgetMap: Record<string, string> = {
      budget_under_10: 'کمتر از ۱۰ میلیون تومان',
      budget_10_50: '۱۰ تا ۵۰ میلیون تومان',
      budget_over_50: 'بیش از ۵۰ میلیون تومان',
      budget_custom: 'توافقی / نیاز به مشاوره',
    };
    session.data.budget = budgetMap[callbackData] || 'توافقی';
    session.step = 'deadline';
    await reply(
      `💰 بودجه تقریبی: <b>${session.data.budget}</b>\n\n` +
      `⏱️ <b>بازه زمانی مدنظر (مهلت تحویل)</b> پروژه را انتخاب کنید:`,
      getDeadlineKeyboard()
    );
    return responses;
  }

  // Handle Deadline Selection Callback
  if (callbackData && callbackData.startsWith('dl_')) {
    const dlMap: Record<string, string> = {
      dl_urgent: 'فوری (کمتر از ۱ هفته)',
      dl_1_2w: '۱ تا ۲ هفته',
      dl_2_4w: '۲ تا ۴ هفته',
      dl_flexible: 'زمان آزاد / توافقی',
    };
    session.data.deadline = dlMap[callbackData] || 'توافقی';
    session.step = 'description';
    await reply(
      `📅 مهلت تحویل: <b>${session.data.deadline}</b>\n\n` +
      `✍️ لطفاً <b>توضیحات و نیازمندی‌های پروژه</b> خود را به صورت کامل ارسال کنید (شامل سناریو، ویژگی‌ها، سبک دلخواه، یا نمونه‌های مشابه):`
    );
    return responses;
  }

  // Handle Confirm Callback
  if (callbackData === 'confirm_yes') {
    if (!session.data.project_type || !session.data.full_name) {
      await reply('⚠️ اطلاعات سفارش ناقص است. لطفاً فرآیند ثبت سفارش را مجدداً شروع کنید.', getMainReplyKeyboard(APP_URL));
      session.step = 'idle';
      return responses;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `RITM-${randomCode}`;

    const catLabels = {
      video: 'تدوین ویدیو',
      web: 'توسعه وب',
      mobile: 'اپلیکیشن موبایل',
      other: 'سایر موارد',
    };

    if (!isSimulation) {
      try {
        const rawContact = session.data.contact || (username ? `@${username}` : String(userId));
        const isEmail = rawContact.includes('@') && rawContact.includes('.');
        const validContactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

        let dbUserId: number | null = null;
        const { data: u } = await supabase.from('users').select('id').eq('telegram_id', userId).maybeSingle();
        if (u) dbUserId = u.id;

        await supabase
          .from('orders')
          .insert({
            order_code: orderCode,
            user_id: dbUserId,
            telegram_id: userId,
            username: username || null,
            full_name: session.data.full_name,
            contact: rawContact,
            contact_type: validContactType,
            preferred_contact: 'telegram',
            project_type: session.data.project_type,
            budget: session.data.budget || 'توافقی',
            deadline: session.data.deadline || 'توافقی',
            description: session.data.description || 'توضیحات تکمیلی ارائه نشده',
            status: 'new',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        const adminMsg =
          `🔔 <b>سفارش جدید در ریتم ثبت شد!</b>\n\n` +
          `🔖 <b>کد رهگیری:</b> <code>${orderCode}</code>\n` +
          `👤 <b>مشتری:</b> ${session.data.full_name} (${username ? '@' + username : userId})\n` +
          `📁 <b>نوع پروژه:</b> ${catLabels[session.data.project_type]}\n` +
          `💰 <b>بودجه:</b> ${session.data.budget}\n` +
          `⏱️ <b>مهلت:</b> ${session.data.deadline}\n` +
          `📞 <b>ارتباط:</b> ${session.data.contact}\n` +
          `📝 <b>توضیحات:</b>\n${session.data.description}\n\n` +
          `🌐 مشاهده در پنل مدیریت ریتم`;

        await callTelegram('sendMessage', {
          chat_id: ADMIN_TELEGRAM_ID,
          text: adminMsg,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: `💬 ارتباط با کاربر`, url: username ? `https://t.me/${username}` : `tg://user?id=${userId}` }
              ]
            ]
          }
        });
        logBot(`Order ${orderCode} created by user ${userId} and sent to admin.`);
      } catch (e) {
        console.error('Failed to notify admin or insert order:', e);
      }
    }

    await reply(
      `🎉 <b>سفارش شما با موفقیت ثبت شد!</b>\n\n` +
      `🔖 <b>کد پیگیری سفارش شما:</b> <code>${orderCode}</code>\n\n` +
      `▫️ <b>نوع پروژه:</b> ${catLabels[session.data.project_type]}\n` +
      `▫️ <b>بودجه:</b> ${session.data.budget}\n` +
      `▫️ <b>مهلت تحویل:</b> ${session.data.deadline}\n\n` +
      `تیم ریتم اطلاعات شما را بررسی کرده و ظرف کمتر از ۲۴ ساعت از طریق همین ربات یا اطلاعات تماسی که ارسال فرمودید با شما تماس خواهد گرفت.\n\n` +
      `با تشکر از اعتماد شما به <b>ریتم</b> ✨`,
      getMainReplyKeyboard(APP_URL)
    );

    session.step = 'idle';
    session.data = {};
    return responses;
  }

  if (callbackData === 'confirm_edit') {
    session.step = 'category';
    await reply('🔄 جهت ویرایش، مجدداً دسته‌بندی پروژه را انتخاب فرمایید:', getCategoryKeyboard());
    return responses;
  }

  const isUserAdmin = userId === ADMIN_TELEGRAM_ID || username === 'AdvRFL';

  if (cleanText === '/start' || cleanText === 'شروع مجدد') {
    session.step = 'idle';
    session.data = {};
    const welcome =
      `درود بر شما ${firstName || 'دوست گرامی'} به <b>ریتم (RITM)</b> خوش آمدید! ⚡\n\n` +
      `ما پل ارتباطی بین هنر دیجیتال و مهندسی نرم‌افزار هستیم.\n` +
      `خدمات ما شامل:\n` +
      `• 🎬 <b>تدوین ویدیو و پست‌پروداکشن</b> (پریمیر پرو، اصلاح رنگ سینمایی)\n` +
      `• 💻 <b>طراحی و توسعه وب‌سایت‌های پیشرفته</b> (سریع، واکنش‌گرا و سئو شده)\n` +
      `• 📱 <b>ساخت اپلیکیشن‌های موبایل</b> (مبتنی بر تجربه کاربری بهینه)\n\n` +
      `از دکمه‌های زیر برای ثبت سفارش یا مشاهده نمونه کارها استفاده نمایید 👇`;

    await reply(welcome, getMainReplyKeyboard(APP_URL, isUserAdmin));
    return responses;
  }

  if (cleanText === '/admin' || cleanText === '👑 ورود به پنل مدیریت ریتم') {
    if (!isUserAdmin) {
      await reply('⛔ شما دسترسی مدیر به پنل ریتم را ندارید.', getMainReplyKeyboard(APP_URL, false));
      return responses;
    }

    let totalOrd = 0;
    let newOrd = 0;
    let totalUsr = 0;
    try {
      const { count: c1 } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: c2 } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new');
      const { count: c3 } = await supabase.from('users').select('*', { count: 'exact', head: true });
      totalOrd = c1 || 0;
      newOrd = c2 || 0;
      totalUsr = c3 || 0;
    } catch (e) {}

    const adminWebUrl = `${APP_URL}/?tab=admin`;

    const adminMsg =
      `👑 <b>پنل اختصاصی مدیریت استودیو ریتم</b>\n\n` +
      `درود مدیر گرامی! وضعیت کنونی سیستم:\n` +
      `📦 <b>کل سفارشات:</b> ${totalOrd}\n` +
      `🟡 <b>سفارشات جدید در انتظار:</b> ${newOrd}\n` +
      `👥 <b>کاربران تلگرام:</b> ${totalUsr}\n\n` +
      `🌐 <b>آدرس وب‌پنل مدیریت:</b>\n` +
      `${adminWebUrl}\n\n` +
      `برای ورود مستقیم به پنل از دکمه زیر استفاده کنید 👇`;

    const inline_keyboard: any[] = [];
    if (APP_URL) {
      inline_keyboard.push([
        { text: '🚀 باز کردن پنل مدیریت داخل تلگرام', web_app: { url: adminWebUrl } }
      ]);
      inline_keyboard.push([
        { text: '🌐 باز کردن در مرورگر اینترنت', url: adminWebUrl }
      ]);
    }
    inline_keyboard.push([
      { text: '📋 مشاهده سفارشات جدید', callback_data: 'admin_view_new' }
    ]);

    await reply(adminMsg, { inline_keyboard });
    return responses;
  }

  if (cleanText === '📝 ثبت سفارش پروژه' || cleanText === '/order') {
    session.step = 'category';
    session.data = {};
    await reply(
      `🎯 <b>مرحله ۱ از ۵ — انتخاب نوع پروژه</b>\n\n` +
      `لطفاً زمینه و دسته‌بندی پروژه‌ای که قصد سفارش آن را دارید انتخاب کنید:`,
      getCategoryKeyboard()
    );
    return responses;
  }

  if (cleanText === '💼 نمونه کارها' || cleanText === '/portfolio') {
    await reply(
      `🌟 <b>برگزیده نمونه‌کارهای ریتم (RITM)</b>\n\n` +
      `۱. <b>تیزر معرفی محصول</b> (تدوین پریمیر پرو، ساند دیزاین، کالر گریدینگ)\n` +
      `۲. <b>سایت شرکتی مدرن</b> (کدنویسی اختصاصی، انیمیشن‌های روان و سئو)\n` +
      `۳. <b>اپلیکیشن مدیریت وظایف</b> (موبایل اپلیکیشن سبک و محلی)\n` +
      `۴. <b>تیزر تبلیغاتی ریتمیک</b> (افکت‌های بصری و ضرب‌آهنگ دقیق)\n` +
      `۵. <b>طراحی ویدیو با هوش مصنوعی</b> (تکنیک‌های نسل جدید ویدیوسازی)\n\n` +
      `🌐 برای مشاهده گالری کامل و ویدیوهای تعاملی، از دکمه زیر استفاده نمایید:`,
      {
        inline_keyboard: [
          [{ text: '🌐 مشاهده سایت و پورتفولیو آنلاین', url: 'https://t-emi.github.io/RITM/' }],
          [{ text: '📝 سفارش پروژه مشابه', callback_data: 'cat_video' }]
        ]
      }
    );
    return responses;
  }

  if (cleanText === '⚡ خدمات و تعرفه‌ها' || cleanText === '/services') {
    await reply(
      `⚡ <b>خدمات تخصصی استودیو ریتم:</b>\n\n` +
      `🎬 <b>۱. تدوین و ادیت ویدیو:</b>\n` +
      `• تیزر، مستند و فیلم کوتاه\n` +
      `• اصلاح رنگ و نور حرفه‌ای (Color Grading)\n` +
      `• میکس و مسترینگ صدا\n` +
      `⏱️ تحویل: ۳ الی ۷ روز کاری\n\n` +
      `💻 <b>۲. طراحی و توسعه وب:</b>\n` +
      `• سایت‌های شرکتی، فروشگاهی و شخصی\n` +
      `• بهینه‌سازی سرعت و استانداردهای سئو\n` +
      `⏱️ تحویل: ۱ الی ۲ هفته کاری\n\n` +
      `📱 <b>۳. اپلیکیشن موبایل:</b>\n` +
      `• رابط کاربری تمیز و بصری\n` +
      `• ذخیره‌سازی آفلاین و سرعت بالا\n` +
      `⏱️ تحویل: ۲ الی ۴ هفته کاری\n\n` +
      `💬 کلیه پروژه‌ها دارای ۲ مرحله بازبینی و ادیت رایگان پس از تحویل هستند.`,
      {
        inline_keyboard: [
          [{ text: '📝 شروع ثبت سفارش', callback_data: 'cat_video' }]
        ]
      }
    );
    return responses;
  }

  if (cleanText === '📋 پیگیری سفارش‌های من' || cleanText === '/myorders') {
    if (isSimulation) {
      await reply(
        `📋 <b>سفارش‌های ثبت شده شما:</b>\n\n` +
        `🔖 کد: <code>RITM-1042</code>\n` +
        `▫️ نوع: تدوین ویدیو\n` +
        `▫️ وضعیت: ⏳ در حال بررسی اولیه\n` +
        `▫️ تاریخ ثبت: امروز`
      );
      return responses;
    }

    try {
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('telegram_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!userOrders || userOrders.length === 0) {
        await reply(
          `شما هنوز سفارشی در ریتم ثبت نکرده‌اید.\nهمین حالا با زدن دکمه <b>📝 ثبت سفارش</b> پروژه خود را آغاز کنید!`,
          getMainReplyKeyboard(APP_URL)
        );
      } else {
        let msg = `📋 <b>سفارش‌های ثبت شده شما (${userOrders.length}):</b>\n\n`;
        const statusMap: Record<string, string> = {
          new: '🟡 ثبت شده / در انتظار بررسی',
          reviewing: '🔍 در حال بررسی توسط تیم فنی',
          in_progress: '⚡ در حال انجام',
          completed: '✅ تکمیل و تحویل داده شد',
          rejected: '❌ رد شده',
          canceled: '🚫 لغو شده',
        };

        userOrders.forEach((ord, index) => {
          msg += `<b>${index + 1}. کد:</b> <code>${ord.order_code}</code>\n`;
          msg += `📁 <b>نوع:</b> ${ord.project_type}\n`;
          msg += `📊 <b>وضعیت:</b> ${statusMap[ord.status] || ord.status}\n`;
          msg += `💰 <b>بودجه:</b> ${ord.budget || 'توافقی'}\n`;
          msg += `📅 <b>تاریخ:</b> ${new Date(ord.created_at).toLocaleDateString('fa-IR')}\n`;
          if (ord.admin_notes) {
            msg += `💬 <b>پیام پشتیبانی:</b> ${ord.admin_notes}\n`;
          }
          msg += `──────────────\n`;
        });

        await reply(msg, getMainReplyKeyboard(APP_URL));
      }
    } catch (err) {
      await reply('خطا در دریافت لیست سفارش‌ها. لطفاً لحظاتی دیگر تلاش کنید.');
    }
    return responses;
  }

  if (cleanText === '📞 تماس و مشاوره' || cleanText === '/contact') {
    await reply(
      `📞 <b>راه‌های ارتباطی با ریتم (RITM):</b>\n\n` +
      `📍 <b>آدرس:</b> تهران، ایران\n` +
      `✈️ <b>تلگرام پشتیبانی:</b> @RITM_FreeLancer\n` +
      `🌐 <b>شبکه‌های اجتماعی و کانال‌ها:</b>\n` +
      `• یوتیوب: youtube.com/RITM_Editz\n` +
      `• ایکس: x.com/RITM_Editz\n` +
      `• پیام‌رسان بله: ble.ir/RITM_FreeLancer\n\n` +
      `همچنین می‌توانید از طریق همین ربات مستقیم با پشتیبان گفتگو کنید.`
    );
    return responses;
  }

  if (cleanText === 'ℹ️ درباره ریتم' || cleanText === '/about') {
    await reply(
      `✨ <b>استودیو خلاقیت دیجیتال ریتم (RITM)</b>\n\n` +
      `ریتم متولد شد تا شکاف میان هنر و فناوری را پر کند. ما به قدرت داستان‌گویی تصویری و کدنویسی دقیق باور داریم. با ریتم، برند شما با بالاترین استانداردهای بصری و فنی جلوه خواهد کرد.\n\n` +
      `▫️ نسخه اپلیکیشن اندروید ریتم V2 نیز در وب‌سایت در دسترس است.\n` +
      `▫️ مدیریت و پشتیبانی: @AdvRFL`
    );
    return responses;
  }

  if (session.step === 'name') {
    if (cleanText.length < 2) {
      await reply('⚠️ لطفاً یک نام معتبر (حداقل ۲ کاراکتر) وارد فرمایید:');
      return responses;
    }
    session.data.full_name = cleanText;
    session.step = 'contact';
    await reply(
      `✅ با تشکر جناب/سرکار <b>${cleanText}</b>.\n\n` +
      `📞 <b>مرحله ۳ از ۵ — شماره تماس یا ایمیل</b>\n` +
      `لطفاً شماره تماس، آیدی تلگرام یا ایمیل خود را جهت هماهنگی ارسال کنید:`
    );
    return responses;
  }

  if (session.step === 'contact') {
    if (cleanText.length < 4) {
      await reply('⚠️ لطفاً شماره همراه، ایمیل یا آیدی معتبر وارد کنید:');
      return responses;
    }
    session.data.contact = cleanText;
    session.data.contact_type = cleanText.includes('@') ? (cleanText.startsWith('@') ? 'telegram' : 'email') : 'phone';
    session.step = 'budget';
    await reply(
      `💰 <b>مرحله ۴ از ۵ — بودجه تقریبی</b>\n` +
      `بازه بودجه مدنظرتان را از گزینه‌های زیر انتخاب نمایید:`,
      getBudgetKeyboard()
    );
    return responses;
  }

  if (session.step === 'description') {
    if (cleanText.length < 5) {
      await reply('⚠️ لطفاً توضیحات مختصری درباره پروژه و امکانات مدنظر بنویسید (حداقل ۵ کاراکتر):');
      return responses;
    }
    session.data.description = cleanText;
    session.step = 'confirm';

    const catLabels = {
      video: 'تدوین ویدیو و پست‌پروداکشن 🎬',
      web: 'توسعه و طراحی وب‌سایت 💻',
      mobile: 'اپلیکیشن موبایل 📱',
      other: 'سایر موارد 🎨',
    };

    const summary =
      `🔍 <b>پیش‌نمایش سفارش شما:</b>\n\n` +
      `👤 <b>نام سفارش‌دهنده:</b> ${session.data.full_name}\n` +
      `📁 <b>دسته‌بندی:</b> ${catLabels[session.data.project_type || 'video']}\n` +
      `📞 <b>اطلاعات تماس:</b> ${session.data.contact}\n` +
      `💰 <b>بودجه:</b> ${session.data.budget || 'توافقی'}\n` +
      `⏱️ <b>مهلت تحویل:</b> ${session.data.deadline || 'توافقی'}\n\n` +
      `📝 <b>توضیحات پروژه:</b>\n${session.data.description}\n\n` +
      `آیا اطلاعات فوق مورد تایید شماست؟`;

    await reply(summary, getConfirmKeyboard());
    return responses;
  }

  await reply(
    `پیام شما دریافت شد. لطفاً یکی از گزینه‌های منوی زیر را انتخاب نمایید:`,
    getMainReplyKeyboard(APP_URL)
  );
  return responses;
}
