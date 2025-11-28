const mongoose = require('mongoose');
const seedData = require('../seed/seedData');
const User = require('../models/User');
const Item = require('../models/Item');
const Chat = require('../models/Chat');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/godakpin';

  const conn = await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Promise.all([User.init(), Item.init(), Chat.init()]);
  await seedData();

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
