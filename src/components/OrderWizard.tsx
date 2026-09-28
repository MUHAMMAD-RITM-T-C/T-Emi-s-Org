import React, { useState, useEffect } from 'react';
import {
  Film,
  Code,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Clock,
  Coins,
  Send,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ProjectType, Order, AuthUser } from '../types';
import { createOrder } from '../services/api';

interface OrderWizardProps {
  lang: 'fa' | 'en';
  onOrderCreated?: (order: Order) => void;
  preselectedCategory?: ProjectType;
  currentUser?: AuthUser | null;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  lang,
  onOrderCreated,
  preselectedCategory,
  currentUser,
}) => {
  const [step, setStep] = useState<number>(1);
  const [projectType, setProjectType] = useState<ProjectType>(preselectedCategory || 'video');
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('telegram');
  const [budget, setBudget] = useState('10 تا ۵۰ میلیون تومان');
  const [customBudget, setCustomBudget] = useState('');
  const [deadline, setDeadline] = useState('۱ تا ۲ هفته');
  const [description, setDescription] = useState('');
  const [telegramId, setTelegramId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if running inside Telegram Mini App
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
          if (user.id) setTelegramId(String(user.id));
          if (user.username) {
            setUsername(user.username);
            if (!contact) setContact(`@${user.username}`);
          }
          if (user.first_name) {
            setFullName(`${user.first_name} ${user.last_name || ''}`.trim());
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (preselectedCategory) {
      setProjectType(preselectedCategory);
    }
  }, [preselectedCategory]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.first_name && !fullName) setFullName(currentUser.first_name);
      if (currentUser.username) {
        setUsername(currentUser.username);
        if (!contact) setContact(`@${currentUser.username}`);
      }
    }
  }, [currentUser]);

  const categories: Array<{
    id: ProjectType;
    icon: any;
    titleFa: string;
    titleEn: string;
    descFa: string;
    descEn: string;
    tagFa: string;
    tagEn: string;
  }> = [
    {
      id: 'video',
      icon: Film,
      titleFa: 'تدوین ویدیو و پست‌پروداکشن',
      titleEn: 'Video Editing & Post',
      descFa: 'تیزرهای تبلیغاتی، ریلز اینستاگرام، مستند و فیلم، اصلاح رنگ سینمایی',
      descEn: 'Commercial teasers, social reels, cinematic color grading & audio',
      tagFa: 'پریمیر پرو / داوینچی',
      tagEn: 'Premiere / DaVinci',
    },
    {
      id: 'web',
      icon: Code,
      titleFa: 'طراحی و توسعه وب‌سایت',
      titleEn: 'Web Design & Development',
      descFa: 'سایت‌های شرکتی، فروشگاهی، فرانت‌اند اختصاصی، سرعت بالا و بهینه‌سازی سئو',
      descEn: 'Corporate sites, high-converting landing pages, custom web apps',
      tagFa: 'React / Next.js / Tailwind',
      tagEn: 'React / Next.js / Tailwind',
    },
    {
      id: 'mobile',
      icon: Smartphone,
      titleFa: 'اپلیکیشن موبایل',
      titleEn: 'Mobile App Development',
      descFa: 'اپلیکیشن‌های کاربردی اندروید و iOS با طراحی چشم‌نواز و عملکرد سریع',
      descEn: 'Practical mobile apps with intuitive flow and offline local sync',
      tagFa: 'Cross-Platform',
      tagEn: 'Cross-Platform',
    },
    {
      id: 'other',
      icon: Sparkles,
      titleFa: 'هوش مصنوعی و خدمات سفارشی',
      titleEn: 'AI & Custom Creative',
      descFa: 'تولید ویدیو با هوش مصنوعی، ربات‌های تلگرام، اتوماسیون و لوگوموشن',
      descEn: 'AI video generation, Telegram bots, workflow automation & branding',
      tagFa: 'Next-Gen Media',
      tagEn: 'Next-Gen Media',
    },
  ];

  const budgetOptions = [
    {
      value: 'کمتر از ۱۰ میلیون تومان',
      valueEn: 'Under 10 Million Toman',
      descFa: 'مناسب پروژه‌های سبک و ادیت‌های سریع',
      descEn: 'Ideal for quick edits and starter tasks',
    },
    {
      value: '۱۰ تا ۵۰ میلیون تومان',
      valueEn: '10 to 50 Million Toman',
      descFa: 'مناسب وب‌سایت‌های شرکتی و تیزرهای حرفه‌ای',
      descEn: 'Standard corporate sites & commercial videos',
    },
    {
      value: 'بیش از ۵۰ میلیون تومان',
      valueEn: 'Over 50 Million Toman',
      descFa: 'پروژه‌های جامع، اپلیکیشن کامل یا کمپین',
      descEn: 'Full-scale applications or comprehensive campaigns',
    },
    {
      value: 'custom',
      valueEn: 'Custom / Flexible',
      descFa: 'مبلغ دلخواه بر اساس توافق و مشاوره',
      descEn: 'Custom agreement based on consultation',
    },
  ];

  const deadlineOptions = [
    { value: 'فوری (کمتر از ۱ هفته)', valueEn: 'Urgent (< 1 week)' },
    { value: '۱ تا ۲ هفته', valueEn: '1 to 2 weeks' },
    { value: '۲ تا ۴ هفته', valueEn: '2 to 4 weeks' },
    { value: 'زمان آزاد / توافقی', valueEn: 'Flexible / Open' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg(lang === 'fa' ? 'لطفاً نام یا عنوان برند خود را وارد کنید.' : 'Please enter your name or brand.');
      return;
    }
    if (!contact.trim() || contact.trim().length < 3) {
      setErrorMsg(lang === 'fa' ? 'لطفاً راه ارتباطی معتبر وارد کنید.' : 'Please provide a valid contact detail.');
      return;
    }
    if (!description.trim() || description.trim().length < 8) {
      setErrorMsg(lang === 'fa' ? 'لطفاً جزئیات پروژه را با دقت بیشتری بنویسید (حداقل ۸ کاراکتر).' : 'Please describe your project (minimum 8 chars).');
      return;
    }

    setIsSubmitting(true);
    const finalBudget = budget === 'custom' ? (customBudget || 'توافقی') : budget;

    try {
      const data = await createOrder({
        full_name: fullName.trim(),
        contact: contact.trim(),
        contact_type: contactType,
        project_type: projectType,
        budget: finalBudget,
        deadline,
        description: description.trim(),
        telegram_id: telegramId ? parseInt(telegramId, 10) : 0,
        username: username.replace(/^@/, '') || null,
      });

      if (!data.success || !data.order) {
        throw new Error(data.error || 'خطا در ثبت سفارش');
      }

      setSubmittedOrder(data.order);
      if (onOrderCreated) onOrderCreated(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در اتصال به سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderCode = () => {
    if (submittedOrder) {
      navigator.clipboard.writeText(submittedOrder.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // SUCCESS RECEIPT VIEW
  if (submittedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="glass-panel rounded-2xl p-8 border border-[#d0bcff]/30 text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#d0bcff]/15 border border-[#d0bcff]/40 flex items-center justify-center mx-auto mb-6 text-[#d0bcff]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs uppercase tracking-wider text-[#d0bcff] font-semibold">
            {lang === 'fa' ? 'سفارش با موفقیت ثبت شد' : 'Order Registered Successfully'}
          </span>

          <h2 className="text-2xl font-bold mt-2 mb-4 text-[#e5e2e1]">
            {lang === 'fa' ? 'به خانواده مشتریان ریتم خوش آمدید' : 'Welcome to the RITM Family'}
          </h2>

          <p className="text-sm text-[#958ea0] max-w-lg mx-auto mb-8 leading-relaxed">
            {lang === 'fa'
              ? 'اطلاعات پروژه شما بلافاصله برای تیم فنی و مدیریت ریتم ارسال شد. ظرف چند ساعت آینده جهت بررسی دقیق با شما ارتباط برقرار خواهیم کرد.'
              : 'Your project details have been transmitted directly to our creative directors. We will contact you shortly.'}
          </p>

          {/* Tracking Card */}
          <div className="p-5 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto mb-8 text-right">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'کد رهگیری اختصاصی' : 'Order Tracking Code'}
              </span>
              <div className="flex items-center gap-2">
                <code className="text-base font-mono font-bold text-[#d0bcff]">
                  {submittedOrder.order_code}
                </code>
                <button
                  onClick={copyOrderCode}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-xs text-[#e5e2e1] transition-colors"
                  title="کپی کد"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'نام مشتری:' : 'Client:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.full_name}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'نوع پروژه:' : 'Category:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.project_type}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'بودجه:' : 'Budget:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.budget}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'مهلت تحویل:' : 'Deadline:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.deadline}</span>
              </div>
            </div>

            {copied && (
              <p className="text-[11px] text-[#adc6ff] text-center mt-3 font-mono">
                {lang === 'fa' ? '✓ کد سفارش در کلیپ‌بورد کپی شد' : '✓ Copied to clipboard'}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://t.me/RITM_FreeLancbot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-semibold text-sm hover:bg-[#d0bcff]/90 transition-all shadow-lg hover:shadow-[#d0bcff]/20"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'fa' ? 'پیگیری در ربات تلگرام' : 'Track in Telegram Bot'}</span>
            </a>

            <button
              onClick={() => {
                setSubmittedOrder(null);
                setStep(1);
                setDescription('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-[#e5e2e1] transition-all border border-white/10"
            >
              {lang === 'fa' ? 'ثبت سفارش جدید' : 'Submit Another Order'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#d0bcff] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff] animate-pulse" />
          <span>{lang === 'fa' ? 'پرتال رسمی ثبت سفارش ریتم' : 'Official Project Order Portal'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight">
          {lang === 'fa' ? 'ایده خود را به اثری ماندگار تبدیل کنید' : 'Turn Your Vision Into Lasting Impact'}
        </h1>
        <p className="text-sm text-[#958ea0] max-w-xl mx-auto mt-2 leading-relaxed">
          {lang === 'fa'
            ? 'سفارش شما در لحظه در دیتابیس سوپابیس ذخیره شده و به تیم فنی ریتم و ربات تلگرام ارسال می‌گردد.'
            : 'Your order synchronizes instantly with our Supabase database and notifies directors via Telegram.'}
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              step === s
                ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-md shadow-[#d0bcff]/20'
                : step > s
                ? 'bg-white/10 text-[#d0bcff]'
                : 'bg-white/5 text-[#958ea0]'
            }`}
          >
            <span>{s}</span>
            <span className="hidden sm:inline">
              {s === 1
                ? (lang === 'fa' ? 'دسته‌بندی' : 'Category')
                : s === 2
                ? (lang === 'fa' ? 'بودجه و زمان' : 'Budget & Timeline')
                : (lang === 'fa' ? 'مشخصات و ارسال' : 'Details & Submit')}
            </span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-[#e5e2e1]">
                {lang === 'fa' ? '۱. دسته‌بندی پروژه خود را انتخاب کنید:' : '1. Select Your Project Category:'}
              </h3>
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'مرحله ۱ از ۳' : 'Step 1 of 3'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = projectType === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setProjectType(cat.id)}
                    className={`cursor-pointer p-5 rounded-xl border transition-all text-right ${
                      isSelected
                        ? 'bg-[#d0bcff]/10 border-[#d0bcff] shadow-lg shadow-[#d0bcff]/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#d0bcff] text-[#131313]' : 'bg-white/5 text-[#d0bcff]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[11px] text-[#958ea0]">
                        {lang === 'fa' ? cat.tagFa : cat.tagEn}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#e5e2e1] mb-1">
                      {lang === 'fa' ? cat.titleFa : cat.titleEn}
                    </h4>
                    <p className="text-xs text-[#958ea0] leading-relaxed">
                      {lang === 'fa' ? cat.descFa : cat.descEn}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-semibold text-xs hover:bg-[#d0bcff]/90 transition-all"
              >
                <span>{lang === 'fa' ? 'مرحله بعد: بودجه و زمان' : 'Next: Budget & Timeline'}</span>
                {lang === 'fa' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET & DEADLINE */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-[#e5e2e1]">
                {lang === 'fa' ? '۲. بودجه تقریبی و زمان‌بندی پروژه:' : '2. Project Budget & Timeline:'}
              </h3>
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'مرحله ۲ از ۳' : 'Step 2 of 3'}
              </span>
            </div>

            {/* Budget options */}
            <div>
              <label className="block text-xs font-semibold text-[#e5e2e1] mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#ffb869]" />
                <span>{lang === 'fa' ? 'بازه بودجه تقریبی مدنظر:' : 'Approximate Budget Range:'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {budgetOptions.map((opt) => {
                  const isSelected = budget === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setBudget(opt.value)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-right ${
                        isSelected
                          ? 'bg-[#ffb869]/10 border-[#ffb869] shadow-sm'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#e5e2e1]">
                          {lang === 'fa' ? opt.value : opt.valueEn}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#ffb869]" />}
                      </div>
                      <span className="text-[11px] text-[#958ea0] block mt-1">
                        {lang === 'fa' ? opt.descFa : opt.descEn}
                      </span>
                    </div>
                  );
                })}
              </div>

              {budget === 'custom' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    placeholder={lang === 'fa' ? 'مثال: ۲۵ میلیون تومان یا نیازمند جلسه مشاوره' : 'e.g. 25M Toman or needs consult'}
                    className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none"
                  />
                </div>
              )}
            </div>

            {/* Deadline options */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#e5e2e1] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#adc6ff]" />
                <span>{lang === 'fa' ? 'مهلت تحویل پروژه:' : 'Delivery Deadline:'}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {deadlineOptions.map((opt) => {
                  const isSelected = deadline === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDeadline(opt.value)}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#adc6ff]/15 border-[#adc6ff] text-[#adc6ff]'
                          : 'bg-white/[0.02] border-white/10 text-[#958ea0] hover:text-[#e5e2e1]'
                      }`}
                    >
                      {lang === 'fa' ? opt.value : opt.valueEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#e5e2e1] text-xs font-medium transition-all"
              >
                {lang === 'fa' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{lang === 'fa' ? 'بازگشت' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-semibold text-xs hover:bg-[#d0bcff]/90 transition-all"
              >
                <span>{lang === 'fa' ? 'مرحله بعد: مشخصات و شرح پروژه' : 'Next: Contact & Specs'}</span>
                {lang === 'fa' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT & DESCRIPTION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-[#e5e2e1]">
                {lang === 'fa' ? '۳. اطلاعات تماس و شرح پروژه:' : '3. Contact & Specifications:'}
              </h3>
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'مرحله ۳ از ۳' : 'Step 3 of 3'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'نام و نام‌خانوادگی یا نام مجموعه *' : 'Full Name or Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'fa' ? 'مثال: محمد مهدی' : 'e.g. John Doe'}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'شماره تماس یا آیدی تلگرام *' : 'Telegram @Username or Phone Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={lang === 'fa' ? 'مثال: @username یا 0912...' : 'e.g. @username or +98...'}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#958ea0] mb-1.5">
                {lang === 'fa' ? 'توضیحات و نیازمندی‌های پروژه *' : 'Project Description & Requirements *'}
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  lang === 'fa'
                    ? 'هدف از پروژه، سناریوی مدنظر، ویژگی‌های کلیدی، یا لینک نمونه‌های مشابه مورد علاقه شما...'
                    : 'Goal of project, key requirements, preferred design style, or reference links...'
                }
                className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl p-4 text-xs text-[#e5e2e1] outline-none leading-relaxed resize-none"
              />
            </div>

            {/* Telegram Sync note */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-[#958ea0]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#d0bcff]" />
                <span>
                  {lang === 'fa'
                    ? 'سفارش بلافاصله به تلگرام مدیریت (@AdvRFL) و ربات ارسال می‌شود.'
                    : 'Order dispatches live to Telegram management & @RITM_FreeLancbot.'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#adc6ff]">Live Sync</span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#e5e2e1] text-xs font-medium transition-all"
              >
                {lang === 'fa' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{lang === 'fa' ? 'بازگشت' : 'Back'}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 disabled:opacity-50 transition-all shadow-lg shadow-[#d0bcff]/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'fa' ? 'در حال ثبت و ارسال...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'fa' ? 'تایید و ثبت نهایی سفارش' : 'Confirm & Register Order'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
