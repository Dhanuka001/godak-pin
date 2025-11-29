import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

const Footer = () => {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-100 mt-12">
      <div className="container-fixed py-10 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-2xl font-semibold text-primary-light">GodakPin.lk</div>
          <p className="text-sm text-slate-300">{t('footer.mission')}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t('footer.menu')}</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/" className="hover:text-primary-light">
                {t('footer.links.home')}
              </Link>
            </li>
            <li>
              <Link to="/items" className="hover:text-primary-light">
                {t('footer.links.items')}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary-light">
                {t('footer.links.about')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary-light">
                {t('footer.links.contact')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t('footer.account')}</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link to="/login" className="hover:text-primary-light">
                {t('footer.links.login')}
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary-light">
                {t('footer.links.signup')}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-primary-light">
                {t('footer.links.dashboard')}
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-slate-300">{t('footer.reminder')}</div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="container-fixed py-4 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>{t('footer.copyright', '', { year })}</span>
          <span>{t('footer.tagline')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
