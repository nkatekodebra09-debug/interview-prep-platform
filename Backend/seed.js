const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const QuestionSet = require('./models/questionSet');

dotenv.config({ path: path.join(__dirname, '.env') });

const sampleQuestions = [
  {
    text: 'Which data structure follows the First In, First Out (FIFO) principle?',
    type: 'mcq',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 'Queue',
  },
  {
    text: 'What is the average time complexity of binary search on a sorted array?',
    type: 'mcq',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
  },
  {
    text: 'Explain how a hash table handles collisions.',
    type: 'descriptive',
    options: [],
    correctAnswer:
      'Answers should describe a collision resolution strategy, such as chaining or open addressing.',
  },
];

const sampleSet = {
  title: 'Seed: Interview Fundamentals',
  description: 'Starter questions for practicing core interview concepts.',
  category: 'General',
  difficulty: 'medium',
  timeLimitMinutes: 15,
  status: 'approved',
};

async function seed() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const username = process.env.SEED_ADMIN_USERNAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!mongoUri) {
    throw new Error('Set MONGODB_URI or MONGO_URI in Backend/.env before seeding.');
  }
  if (!username || !email || !password) {
    throw new Error(
      'Set SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD in Backend/.env.',
    );
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters long.');
  }

  await mongoose.connect(mongoUri);

  const normalizedEmail = email.trim().toLowerCase();
  let admin = await User.findOne({ email: normalizedEmail });

  if (!admin) {
    admin = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password,
      role: 'admin',
    });
    console.log(`Created seed admin: ${normalizedEmail}`);
  } else if (admin.role !== 'admin') {
    throw new Error(
      `The account ${normalizedEmail} already exists but is not an admin; no role changes were made.`,
    );
  } else {
    console.log(`Seed admin already exists: ${normalizedEmail}; left its password unchanged.`);
  }

  let questionSet = await QuestionSet.findOne({ title: sampleSet.title, createdBy: admin._id });
  if (!questionSet) {
    questionSet = await QuestionSet.create({ ...sampleSet, createdBy: admin._id });
    console.log(`Created sample question set: ${sampleSet.title}`);
  }

  for (const question of sampleQuestions) {
    await Question.updateOne(
      { text: question.text, questionSet: questionSet._id },
      { $setOnInsert: { ...question, questionSet: questionSet._id, createdBy: admin._id } },
      { upsert: true },
    );
  }

  console.log(
    `Seeded ${sampleQuestions.length} sample questions (existing questions were preserved).`,
  );
}

seed()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
