import React from 'react';
import { Send, Globe, Shield, Terminal, ShoppingBag, FolderKanban, Lock, User, Clock, LogOut } from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  activeTab: 'order' | 'simulator' | 'admin' | 'portfolio' | 'status' | 'client';
  setActiveTab: (tab: 'order' | 'simulator' | 'admin' | 'portfolio' | 'status' | 'client') => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  pendingCount?: number;
  currentUser?: AuthUser | null;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  pendingCount = 0,
  currentUser = null,
  isAdminLoggedIn = false,
  onAdminLogout,
  onOpenAdminLogin,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#131313]/90 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('order')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black/40 flex items-center justify-center p-0.5 group-hover:border-[#d0bcff]/60 transition-colors">
              <img src="/assets/logo.png" alt="RITM" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#e5e2e1] group-hover:text-[#d0bcff] transition-colors">
              {lang === 'fa' ? 'ریتم' : 'RITM'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (PUBLIC by default; ADMIN tabs appear ONLY after admin login!) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium">
          {/* 1. Public: Order */}
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'order'
                ? 'bg-white/10 text-[#d0bcff] font-semibold'
                : 'text-[#e5e2e1]/70 hover:text-[#e5e2e1] hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'fa' ? 'ثبت سفارش' : 'Order Project'}</span>
          </button>

          {/* 2. Public: Client Work Progress */}
          <button
            onClick={() => setActiveTab('client')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'client'
                ? 'bg-white/10 text-[#d0bcff] font-semibold'
                : 'text-[#e5e2e1]/70 hover:text-[#e5e2e1] hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4 text-[#adc6ff]" />
            <span>{lang === 'fa' ? 'روند کار و پنل من' : 'My Progress'}</span>
          </button>

          {/* 3. Public: Portfolio & Services */}
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'portfolio'
                ? 'bg-white/10 text-[#d0bcff] font-semibold'
                : 'text-[#e5e2e1]/70 hover:text-[#e5e2e1] hover:bg-white/5'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>{lang === 'fa' ? 'نمونه‌کارها و خدمات' : 'Portfolio'}</span>
          </button>

          {/* 4. Public: Bot Simulator */}
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-white/10 text-[#d0bcff] font-semibold'
                : 'text-[#e5e2e1]/70 hover:text-[#e5e2e1] hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'fa' ? 'شبیه‌ساز ربات' : 'Bot Simulator'}</span>
          </button>

          {/* ADMIN-ONLY TABS: Visible ONLY when admin is verified with password Mohmah123! */}
          {isAdminLoggedIn && (
            <>
              <div className="h-4 w-[1px] bg-white/20 mx-1" />

              <button
                onClick={() => setActiveTab('admin')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border ${
                  activeTab === 'admin'
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] font-bold border-[#d0bcff]/40 shadow-sm'
                    : 'bg-white/5 text-[#d0bcff] hover:bg-white/10 border-white/10'
                }`}
              >
                <Shield className="w-4 h-4 text-[#d0bcff]" />
                <span>{lang === 'fa' ? 'پنل مدیریت سفارشات' : 'Admin Hub'}</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#ffb869] animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all border ${
                  activeTab === 'status'
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] font-bold border-[#d0bcff]/40 shadow-sm'
                    : 'bg-white/5 text-[#e5e2e1]/80 hover:bg-white/10 border-white/10'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-[#adc6ff]" />
                <span>{lang === 'fa' ? 'بخش سیستم و لاگ‌ها' : 'System Status'}</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* User state badge if logged in */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('client')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-[#d0bcff] font-medium"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[90px] truncate">{currentUser.username}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('client')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#e5e2e1] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'ورود / ثبت‌نام' : 'Sign In'}</span>
            </button>
          )}

          {/* Admin Logout button if admin is logged in */}
          {isAdminLoggedIn && (
            <button
              onClick={onAdminLogout}
              className="p-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors text-xs flex items-center gap-1"
              title="خروج از حساب مدیریت"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px] font-medium">
                {lang === 'fa' ? 'خروج ادمین' : 'Admin Logout'}
              </span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-mono text-[#e5e2e1]/80 hover:text-[#e5e2e1] transition-all bg-white/[0.03]"
            title={lang === 'fa' ? 'تغییر زبان' : 'Switch Language'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
          </button>

          {/* Real Telegram Bot Link */}
          <a
            href="https://t.me/RITM_FreeLancbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d0bcff] text-[#131313] hover:bg-[#d0bcff]/90 text-xs font-bold shadow-sm transition-all whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fa' ? 'ربات تلگرام' : 'Bot'}</span>
          </a>
        </div>
      </div>

      {/* Mobile Subnavigation */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-white/[0.06] bg-[#171717] text-xs">
        <button
          onClick={() => setActiveTab('order')}
          className={`px-2 py-1 rounded ${activeTab === 'order' ? 'text-[#d0bcff] font-bold' : 'text-[#958ea0]'}`}
        >
          {lang === 'fa' ? 'ثبت سفارش' : 'Order'}
        </button>
        <button
          onClick={() => setActiveTab('client')}
          className={`px-2 py-1 rounded ${activeTab === 'client' ? 'text-[#d0bcff] font-bold' : 'text-[#958ea0]'}`}
        >
          {lang === 'fa' ? 'روند کار' : 'Progress'}
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-2 py-1 rounded ${activeTab === 'portfolio' ? 'text-[#d0bcff] font-bold' : 'text-[#958ea0]'}`}
        >
          {lang === 'fa' ? 'نمونه‌کار' : 'Work'}
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2 py-1 rounded ${activeTab === 'simulator' ? 'text-[#d0bcff] font-bold' : 'text-[#958ea0]'}`}
        >
          {lang === 'fa' ? 'ربات' : 'Bot'}
        </button>

        {/* If Admin is logged in, show admin in mobile too */}
        {isAdminLoggedIn ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'admin' ? 'text-[#d0bcff] font-bold' : 'text-[#958ea0]'}`}
          >
            <span>{lang === 'fa' ? 'مدیریت' : 'Admin'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
          </button>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="px-2 py-1 rounded text-[#958ea0] hover:text-[#d0bcff] flex items-center gap-0.5"
          >
            <Lock className="w-3 h-3 text-[#ffb869]" />
            <span>{lang === 'fa' ? 'ادمین' : 'Admin'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
