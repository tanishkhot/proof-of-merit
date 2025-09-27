import express from 'express';
import attestationsRouter from './routes/attestations.routes.js';

const app = express();

app.use(express.json());

app.use('/api/attestations', attestationsRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
