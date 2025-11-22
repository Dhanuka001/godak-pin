const bcrypt = require('bcryptjs');
const Item = require('../models/Item');
const User = require('../models/User');

const seedData = async () => {
  if (process.env.SEED_DATA === 'false') return;

  const itemCount = await Item.countDocuments();
  if (itemCount > 0) return;

  const hashed = await bcrypt.hash('godakpin123', 10);

  const donor =
    (await User.findOne({ email: 'donor@godakpin.lk' })) ||
    (await User.create({
      name: 'Demo Donor',
      email: 'donor@godakpin.lk',
      password: hashed,
      mobile: '0710000000',
      district: 'Colombo',
    }));

  const sampleItems = [
    {
      title: 'පොත් කට්ටලයක්',
      description: 'Grade 6-9 Sinhala/English books, lightly used.',
      category: 'Education',
      district: 'Colombo',
      city: 'Nugegoda',
      condition: 'Used - good',
      imageUrl: '/images/books.jpg',
      owner: donor._id,
      ownerName: donor.name,
      ownerDistrict: donor.district,
    },
    {
      title: 'Baby stroller',
      description: 'Sturdy stroller, few scratches but works well.',
      category: 'Baby Items',
      district: 'Gampaha',
      city: 'Negombo',
      condition: 'Used - good',
      imageUrl: '/images/stroller.jpg',
      owner: donor._id,
      ownerName: donor.name,
      ownerDistrict: donor.district,
    },
  ];

  await Item.insertMany(sampleItems);
  // eslint-disable-next-line no-console
  console.log('Seeded sample items');
};

module.exports = seedData;
