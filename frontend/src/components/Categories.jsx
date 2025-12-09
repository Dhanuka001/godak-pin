import { categories } from '../utils/categoryData';
import { useLocale } from '../context/LocaleContext';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const handleNavigate = (category) => {
    navigate('/items', { state: { category } });
  };

  return (
    <section className="container-fixed py-10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('categories.heading')}</h2>
          <p className="text-sm text-slate-600">{t('categories.subheading')}</p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible scrollbar-hide">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.key}
            onClick={() => handleNavigate(cat.value)}
            className="card p-4 flex flex-col justify-center gap-3 hover:shadow-lg transition bg-white/90 min-w-[160px] aspect-square snap-start sm:min-w-0 sm:aspect-auto sm:flex-row sm:items-center cursor-pointer text-left"
          >
            <div className="text-3xl">{cat.icon}</div>
            <div>
              <div className="font-semibold text-slate-900">{t(cat.key, cat.value)}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Categories;
