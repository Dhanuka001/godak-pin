import { useMemo } from 'react';
import { allCities, getCitiesForDistrict } from '../utils/locationData';
import { useLocale } from '../context/LocaleContext';

const CitySelect = ({
  district,
  value,
  onChange,
  name = 'city',
  required = false,
  placeholder = '',
  inputClassName = 'w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary',
  helperText = '',
}) => {
  const options = useMemo(() => (district ? getCitiesForDistrict(district) : allCities), [district]);
  const { t } = useLocale();
  const placeholderText = placeholder || t('citySelect.placeholder');
  const helperLabel = helperText || t('citySelect.helper');

  return (
    <div>
      <input
        name={name}
        list={`${name}-options`}
        value={value}
        required={required}
        placeholder={placeholderText}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
      />
      <datalist id={`${name}-options`}>
        {options.map((city) => (
          <option key={`${name}-${city}`} value={city} />
        ))}
      </datalist>
      {helperLabel && <div className="text-[11px] text-slate-500 mt-1">{helperLabel}</div>}
    </div>
  );
};

export default CitySelect;
