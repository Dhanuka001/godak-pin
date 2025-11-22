import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

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

const items = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/items', label: 'Shop', icon: IconBag },
  { to: '/dashboard', label: 'Account', icon: IconUser },
];

const MobileBottomNav = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-30">
      <div className="grid grid-cols-3 text-center text-xs font-semibold text-slate-700">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
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
