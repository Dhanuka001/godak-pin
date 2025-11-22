export const categories = [
  { nameSi: 'ගෘහ භාණ්ඩ', nameEn: 'Furniture & Home', icon: '🛋️' },
  { nameSi: 'පොත්/පාසල් උපකරණ', nameEn: 'Books & School', icon: '📚' },
  { nameSi: 'ඇදුම් පැලදුම්', nameEn: 'Clothing & Fashion', icon: '👗' },
  { nameSi: 'ආහාර භාණ්ඩ', nameEn: 'Kitchen & Dining', icon: '🍳' },
  { nameSi: 'ඉලෙක්ට්‍රොනික උපකරණ', nameEn: 'Electronics', icon: '💻' },
  { nameSi: 'ළමා භාණ්ඩ', nameEn: 'Kids & Baby', icon: '🧸' },
  { nameSi: 'ක්‍රීඩා සහ සෙල්ලම්', nameEn: 'Sports & Games', icon: '⚽' },
  { nameSi: 'කෘෂිකර්ම', nameEn: 'Gardening', icon: '🌱' },
];

export const categoriesForFilters = [
  ...categories,
  { nameSi: 'වෙනත්', nameEn: 'Other', icon: '➕' },
];

export const categoryValues = categories.map((c) => c.nameEn);
