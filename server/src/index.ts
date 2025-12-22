import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cafesRouter from './routes/cafes';
import drinksRouter from './routes/drinks';
import statsRouter from './routes/stats';
import './db'; // Initialize DB connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cafes', cafesRouter);
app.use('/api/drinks', drinksRouter);
app.use('/api/stats', statsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
