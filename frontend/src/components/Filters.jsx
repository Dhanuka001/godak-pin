const districts = ['Colombo', 'Gampaha', 'Galle', 'Kandy', 'Kurunegala'];
const categories = ['Education', 'Baby Items', 'Electronics', 'Furniture', 'Clothing'];

const Filters = ({ values, onChange, onSubmit, layout = 'bar' }) => {
  const handleChange = (field) => (e) => onChange({ ...values, [field]: e.target.value });

  if (layout === 'sidebar') {
    return (
      <form onSubmit={onSubmit} className="card p-4 space-y-3">
        <h4 className="text-lg font-semibold text-slate-800">පෙරහන්</h4>
        <input
          type="text"
          placeholder="භාණ්ඩ සොයන්න…"
          value={values.q || ''}
          onChange={handleChange('q')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={values.district || ''}
          onChange={handleChange('district')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">දිශාව</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={values.category || ''}
          onChange={handleChange('category')}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">ප්‍රවර්ගය</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary w-full">
          <span className="btn-label">
            <span className="si">සොයන්න</span>
            <span className="en">Search</span>
          </span>
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="md:col-span-2">
        <input
          type="text"
          placeholder="භාණ්ඩ සොයන්න…"
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
          <option value="">දිශාව</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
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
          <option value="">ප්‍රවර්ගය</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-stretch">
        <button type="submit" className="btn-primary w-full">
          <span className="btn-label">
            <span className="si">සොයන්න</span>
            <span className="en">Search</span>
          </span>
        </button>
      </div>
    </form>
  );
};

export default Filters;
