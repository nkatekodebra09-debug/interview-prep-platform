const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB() {
  const production = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const hasMongoUri = mongoUri && !/^(your_|replace-with|<)/i.test(mongoUri.trim());

  let useLocalMongo = !hasMongoUri;
  if (useLocalMongo && production) {
    throw new Error(
      'Missing MONGODB_URI in Backend/.env. Configure a reachable MongoDB database first.',
    );
  }

  if (hasMongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    } catch (error) {
      if (production) throw error;
      useLocalMongo = true;
      console.warn(
        `Configured MongoDB is unavailable (${error.code || error.name}); using local development data in Backend/.data.`,
      );
    }
  }

  if (useLocalMongo) {
    const dbPath = path.join(__dirname, '..', '.data');
    fs.mkdirSync(dbPath, { recursive: true });
    const localMongo = await MongoMemoryServer.create({ instance: { dbPath } });
    await mongoose.connect(localMongo.getUri());
    console.warn('Using local development data in Backend/.data.');
  }
}

module.exports = connectDB;
