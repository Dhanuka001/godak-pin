import { useLocale } from '../context/LocaleContext';

const NoticeStrip = () => {
  const { t } = useLocale();
  const message = t('notice.marquee');
  return (
    <div className="w-full bg-yellow-300 text-slate-900 border-t border-b border-yellow-400/70 overflow-hidden">
      <div className="marquee">
        <div className="marquee-chunk">
          <span className="whitespace-nowrap">{message}</span>
        </div>
        <div className="marquee-chunk">
          <span className="whitespace-nowrap">{message}</span>
        </div>
        <div className="marquee-chunk">
          <span className="whitespace-nowrap">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default NoticeStrip;
