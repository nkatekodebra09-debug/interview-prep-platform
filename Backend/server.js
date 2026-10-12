const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const questionSetRoutes = require('./routes/questionSetRoutes');
const adminRoutes = require('./routes/admin.Routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/question-sets', questionSetRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

async function start() {
  if (!mongoUri) {
    throw new Error(
      'Missing MONGODB_URI in Backend/.env. Configure a reachable MongoDB database first.',
    );
  }
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'Missing JWT_SECRET in Backend/.env. Set a long, random secret before starting the API.',
    );
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`API ready at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(`API startup failed: ${error.message}`);
  process.exitCode = 1;
});
