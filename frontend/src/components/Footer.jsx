import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-100 mt-12">
      <div className="container-fixed py-10 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-2xl font-semibold text-primary-light">GodakPin.lk</div>
          <p className="text-sm text-slate-300">
            භාවිතා නොකරන දේවල් විශ්වාසයෙන් බෙදා ගන්න. Give unused items a second life in Sri Lanka.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">මෙනුව</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/" className="hover:text-primary-light">
                මුල් පිටුව / Home
              </Link>
            </li>
            <li>
              <Link to="/items" className="hover:text-primary-light">
                භාණ්ඩ / Items
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary-light">
                අප ගැන / About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary-light">
                සම්බන්ධ / Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">ගිණුම</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/login" className="hover:text-primary-light">
                ලොග් වෙන්න / Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary-light">
                ගිණුමක් තනන්න / Sign up
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-primary-light">
                මගේ භාණ්ඩ / My items
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-slate-300">
            No buying/selling. Only giving with kindness. Report issues: hello@godakpin.lk
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="container-fixed py-4 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} GodakPin.lk</span>
          <span>Built for sharing, not selling.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
