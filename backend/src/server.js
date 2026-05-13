import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { analyzeSource, getEngineStatus } from './flexRunner.js';
import { examples, getExampleById } from './examples.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'Lexical Analyzer Visualizer API',
    ...getEngineStatus()
  });
});

app.get('/api/examples', (_request, response) => {
  response.json({ examples });
});

app.get('/api/examples/:id', (request, response) => {
  const example = getExampleById(request.params.id);
  response.json({ example });
});

app.post('/api/analyze', async (request, response) => {
  try {
    const source = typeof request.body?.code === 'string' ? request.body.code : '';
    if (!source.trim()) {
      response.status(400).json({ message: 'Code input is required.' });
      return;
    }

    const analysis = await analyzeSource(source);
    response.json({
      language: 'C',
      ...analysis
    });
  } catch (error) {
    response.status(500).json({
      message: error.message || 'Failed to analyze source code.',
      engine: 'error'
    });
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found.' });
});

app.listen(port, () => {
  console.log(`Lexical Analyzer Visualizer API running on http://localhost:${port}`);
});
