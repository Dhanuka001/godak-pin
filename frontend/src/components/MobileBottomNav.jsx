import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';

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

const items = [
  { to: '/', label: 'Home', icon: IconHome, type: 'link' },
  { to: '/items', label: 'Items', icon: IconBag, type: 'link' },
  { label: 'Chat', icon: IconChat, type: 'action' },
  { to: '/dashboard', label: 'Account', icon: IconUser, type: 'link' },
];

const MobileBottomNav = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const { unreadCount, toggleChat } = useChatContext();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-30">
      <div className="grid grid-cols-4 text-center text-xs font-semibold text-slate-700">
        {items.map((item) => {
          const isActive = item.to && location.pathname === item.to;
          const Icon = item.icon;
          if (item.type === 'action') {
            return (
              <button
                key={item.label}
                type="button"
                onClick={toggleChat}
                className={`relative py-3 flex flex-col items-center gap-1 ${unreadCount ? 'text-primary' : ''}`}
              >
                <Icon />
                <span className="text-[11px]">{item.label}</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-7 inline-flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          }
          if (item.to === '/dashboard' && !user) {
            return (
              <Link
                key={item.label}
                to="/login"
                className={`py-3 flex flex-col items-center gap-1 ${isActive ? 'text-primary' : ''}`}
              >
                <Icon />
                <span className="text-[11px]">Account</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`py-3 flex flex-col items-center gap-1 ${isActive ? 'text-primary' : ''}`}
            >
              <Icon />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
