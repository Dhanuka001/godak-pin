import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';
import { useLocale } from '../context/LocaleContext';

const IconHome = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9V21h13V9" />
  </svg>
);

const IconBag = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M6 7h12l-1 12H7L6 7Z" />
    <path d="M9 10.5V6.5a3 3 0 0 1 6 0v4" />
  </svg>
);

const IconUser = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

const IconChat = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v5A3.5 3.5 0 0 1 16.5 15H9l-4 4v-4.5Z" />
    <path d="M8.5 11h7" />
    <path d="M8.5 7.75H15" />
  </svg>
);

const MobileBottomNav = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const { unreadCount } = useChatContext();
  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount;
  const { t } = useLocale();
  const navItems = [
    { to: '/', labelKey: 'nav.home', icon: IconHome, type: 'link' },
    { to: '/items', labelKey: 'nav.items', icon: IconBag, type: 'link' },
    { labelKey: 'nav.chat', icon: IconChat, type: 'action' },
    { to: '/dashboard', labelKey: 'nav.account', icon: IconUser, type: 'link' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-30">
      <div className="grid grid-cols-4 text-center text-xs font-semibold text-slate-700">
        {navItems.map((item) => {
          const isActive = item.to && location.pathname === item.to;
          const isChatActive = location.pathname.startsWith('/chat');
          const Icon = item.icon;
          const label = t(item.labelKey);
          if (item.type === 'action') {
            const target = user ? '/chat' : '/login';
            return (
              <Link
                key={item.labelKey}
                to={target}
                className={`relative py-3 flex flex-col items-center gap-1 ${isChatActive ? 'text-primary' : ''}`}
              >
                <Icon />
                <span className="text-[11px]">{label}</span>
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-6 inline-flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                    aria-label={`${badgeLabel} unread messages`}
                  >
                    {badgeLabel}
                  </span>
                )}
              </Link>
            );
          }
          if (item.to === '/dashboard' && !user) {
            return (
              <Link
                key={item.labelKey}
                to="/login"
                className={`py-3 flex flex-col items-center gap-1 ${isActive ? 'text-primary' : ''}`}
              >
                <Icon />
                <span className="text-[11px]">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.labelKey}
              to={item.to}
              className={`py-3 flex flex-col items-center gap-1 ${isActive ? 'text-primary' : ''}`}
            >
              <Icon />
              <span className="text-[11px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
