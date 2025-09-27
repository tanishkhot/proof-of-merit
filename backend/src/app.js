import express from 'express';
import attestationsRouter from './routes/attestations.routes.js';
import aisearchRouter from './routes/aisearch.routes.js';

const app = express();

app.use(express.json());

app.use('/api/attestations', attestationsRouter);
app.use('/api/aisearch', aisearchRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
