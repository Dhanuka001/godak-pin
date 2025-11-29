import { districtNames, getCitiesForDistrict } from '../utils/locationData';
import { categoriesForFilters } from '../utils/categoryData';
import { useLocale } from '../context/LocaleContext';

const Filters = ({ values, onChange, onSubmit, layout = 'bar' }) => {
  const { t } = useLocale();
  const handleChange = (field) => (e) => {
    if (field === 'district') {
      onChange({ ...values, district: e.target.value, city: '' });
    } else {
      onChange({ ...values, [field]: e.target.value });
    }
  };

  const cityOptions = getCitiesForDistrict(values.district);

  if (layout === 'sidebar') {
    return (
    <form onSubmit={onSubmit} className="card p-4 space-y-3">
      <h4 className="text-lg font-semibold text-slate-800">{t('filters.titleSidebar')}</h4>
      <input
        type="text"
        placeholder={t('filters.placeholderSearch')}
          value={values.q || ''}
          onChange={handleChange('q')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={values.district || ''}
          onChange={handleChange('district')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
        <option value="">{t('filters.district')}</option>
          {districtNames.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={values.city || ''}
        onChange={handleChange('city')}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={!values.district}
      >
        <option value="">
          {values.district ? t('filters.city') : t('filters.selectDistrictFirst')}
        </option>
          {values.district &&
            cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
        <select
          value={values.category || ''}
          onChange={handleChange('category')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
        <option value="">{t('filters.category')}</option>
          {categoriesForFilters.map((c) => (
            <option key={c.key} value={c.value}>
              {t(c.key)}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary w-full">
          {t('filters.search')}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="md:col-span-2">
        <input
          type="text"
          placeholder={t('filters.placeholderSearch')}
          value={values.q || ''}
          onChange={handleChange('q')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
          <select
            value={values.district || ''}
            onChange={handleChange('district')}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('filters.district')}</option>
          {districtNames.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
          <select
            value={values.city || ''}
            onChange={handleChange('city')}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!values.district}
          >
            <option value="">
              {values.district ? t('filters.city') : t('filters.selectDistrictFirst')}
            </option>
          {values.district &&
            cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
      </div>
      <div>
          <select
            value={values.category || ''}
            onChange={handleChange('category')}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('filters.category')}</option>
          {categoriesForFilters.map((c) => (
            <option key={c.key} value={c.value}>
              {t(c.key)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-stretch">
        <button type="submit" className="btn-primary w-full">
          {t('filters.search')}
        </button>
      </div>
    </form>
  );
};

export default Filters;
