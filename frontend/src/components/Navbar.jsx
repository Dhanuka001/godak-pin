import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';
import { useLocale } from '../context/LocaleContext';

const IconChat = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v5A3.5 3.5 0 0 1 16.5 15H9l-4 4v-4.5Z" />
    <path d="M8.5 11h7" />
    <path d="M8.5 7.75H15" />
  </svg>
);

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition hover:text-primary-dark ${isActive ? 'text-primary' : 'text-slate-700'}`;

const Navbar = () => {
  const { user } = useAuthContext();
  const { unreadCount } = useChatContext();
  const { t, lang, setLanguage, languages } = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount;

  const handleLanguage = (code) => {
    if (lang === code) return;
    setLanguage(code);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/items', label: t('nav.items') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 relative">
      <div className="container-fixed py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-primary">
          GodakPin.lk
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/items" className={navLinkClass}>
            {t('nav.items')}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {t('nav.contact')}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              {t('nav.admin')}
            </NavLink>
          )}
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
            {languages.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguage(code)}
                className={`rounded-full px-2 py-0.5 transition ${lang === code ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                aria-pressed={lang === code}
              >
                {t(`language.${code}`)}
              </button>
            ))}
          </div>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to="/chat"
              className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white h-10 w-10 text-slate-600 hover:border-primary hover:text-primary"
              aria-label="Open chat"
            >
              <IconChat />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-2 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                  <span
                    className="absolute -top-[10px] -right-[-2px] inline-flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
                    aria-label={`${badgeLabel} unread messages`}
                  >
                    {badgeLabel}
                  </span>
                </>
              )}
            </Link>
          ) : null}
          {user ? (
            <>
              <span className="text-sm text-slate-700">{t('nav.greeting', '', { name: user.name })}</span>
              <Link to="/dashboard" className="btn-secondary text-sm px-4 py-2">
                <span className="btn-label">{t('nav.dashboard')}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-700 hover:text-primary">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
        <div className="md:hidden flex items-center gap-1">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
            {languages.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguage(code)}
                className={`rounded-full px-2 py-0.5 transition ${lang === code ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                aria-pressed={lang === code}
              >
                {t(`language.${code}`)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 flex-col items-center justify-center gap-1 rounded border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Toggle navigation"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
          </button>
        </div>
      </div>
        {isMobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-10 bg-black/10"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="md:hidden absolute inset-x-0 top-full bg-white border-y border-slate-200 shadow-lg z-20">
            <div className="space-y-4 px-4 py-4 text-center">
              <div className="space-y-3">
                <div className="text-sm text-slate-600">{user ? `${t('nav.greeting', '', { name: user.name })}` : 'Welcome'}</div>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-base font-medium text-slate-900 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-base font-medium text-slate-900 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.admin')}
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="block rounded-lg border border-slate-200 px-4 py-2 text-center font-medium text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block rounded-lg px-4 py-2 text-center font-medium text-slate-700 hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="block rounded-lg bg-primary text-white px-4 py-2 text-center font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.signup')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </header>
  );
};

export default Navbar;
