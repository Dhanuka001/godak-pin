import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';

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
  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="container-fixed py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-primary">
          GodakPin.lk
        </Link>
        <div className="md:hidden text-xs text-slate-600 font-medium">
          {user ? `Hello, ${user.name}` : 'Welcome'}
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            මුල් පිටුව
          </NavLink>
          <NavLink to="/items" className={navLinkClass}>
            භාණ්ඩ
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            අප ගැන
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            සම්බන්ධ වෙන්න
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
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
              <span className="text-sm text-slate-700">හෙලෝ, {user.name}</span>
              <Link to="/dashboard" className="btn-secondary text-sm px-4 py-2">
                <span className="btn-label">
                  <span className="si">මගේ පිටුව</span>
                  <span className="en">My page</span>
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-700 hover:text-primary">
                <span className="btn-label">
                  <span className="si">ලොග් වෙන්න</span>
                  <span className="en text-slate-500">Login</span>
                </span>
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                <span className="btn-label">
                  <span className="si">ගිණුමක් තනන්න</span>
                  <span className="en text-white/90">Sign up</span>
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
