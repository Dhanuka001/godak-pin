export const categories = [
  { key: 'category.furniture', value: 'Furniture & Home', icon: '🛋️' },
  { key: 'category.books', value: 'Books & School', icon: '📚' },
  { key: 'category.clothing', value: 'Clothing & Fashion', icon: '👗' },
  { key: 'category.kitchen', value: 'Kitchen & Dining', icon: '🍳' },
  { key: 'category.electronics', value: 'Electronics', icon: '💻' },
  { key: 'category.kids', value: 'Kids & Baby', icon: '🧸' },
  { key: 'category.sports', value: 'Sports & Games', icon: '⚽' },
  { key: 'category.gardening', value: 'Gardening', icon: '🌱' },
];

export const categoriesForFilters = [
  ...categories,
  { key: 'category.other', value: 'Other', icon: '➕' },
];

export const categoryValues = categories.map((c) => c.value);
