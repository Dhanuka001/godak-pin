import { useMemo } from 'react';
import { allCities, getCitiesForDistrict } from '../utils/locationData';

const CitySelect = ({
  district,
  value,
  onChange,
  name = 'city',
  required = false,
  placeholder = 'Nearest city',
  inputClassName = 'w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary',
  helperText = 'Type to search and pick a major city near you.',
}) => {
  const options = useMemo(() => (district ? getCitiesForDistrict(district) : allCities), [district]);

  return (
    <div>
      <input
        name={name}
        list={`${name}-options`}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
      />
      <datalist id={`${name}-options`}>
        {options.map((city) => (
          <option key={`${name}-${city}`} value={city} />
        ))}
      </datalist>
      {helperText && <div className="text-[11px] text-slate-500 mt-1">{helperText}</div>}
    </div>
  );
};

export default CitySelect;
