import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition hover:text-primary-dark ${isActive ? 'text-primary' : 'text-slate-700'}`;

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="container-fixed py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-primary">
          GodakPin.lk
        </Link>
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
            සම්බන්ධ වෙනවා
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-700">හෙලෝ, {user.name}</span>
              <Link to="/dashboard" className="btn-secondary text-sm px-4 py-2">
                <span className="btn-label">
                  <span className="si">මගේ පිටුව</span>
                  <span className="en">My page</span>
                </span>
              </Link>
              <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-primary">
                Logout
              </button>
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
