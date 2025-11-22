const categories = [
  { nameSi: 'ගෘහ භාණ්ඩ', nameEn: 'Furniture & Home', icon: '🛋️' },
  { nameSi: 'පොත්/පාසල් උපකරණ', nameEn: 'Books & School', icon: '📚' },
  { nameSi: 'ඇදුම් පැලදුම්', nameEn: 'Clothing & Fashion', icon: '👗' },
  { nameSi: 'ආහාර භාණ්ඩ', nameEn: 'Kitchen & Dining', icon: '🍳' },
  { nameSi: 'ඉලෙක්ට්‍රොනික උපකරණ', nameEn: 'Electronics', icon: '💻' },
  { nameSi: 'ළමා භාණ්ඩ', nameEn: 'Kids & Baby', icon: '🧸' },
  { nameSi: 'ක්‍රීඩා සහ සෙල්ලම්', nameEn: 'Sports & Games', icon: '⚽' },
  { nameSi: 'කෘෂිකර්ම', nameEn: 'Gardening', icon: '🌱' },
];

const Categories = () => (
  <section className="container-fixed py-10 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">ජනප්‍රිය ප්‍රවර්ග</h2>
        <p className="text-sm text-slate-600">Most shared categories by Sri Lankans</p>
      </div>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible">
      {categories.map((cat) => (
        <div
          key={cat.nameEn}
          className="card p-4 flex flex-col justify-center gap-3 hover:shadow-lg transition bg-white/90 min-w-[160px] aspect-square snap-start sm:min-w-0 sm:aspect-auto sm:flex-row sm:items-center"
        >
          <div className="text-3xl">{cat.icon}</div>
          <div>
            <div className="font-semibold text-slate-900">{cat.nameSi}</div>
            <div className="text-xs text-slate-500">{cat.nameEn}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Categories;
