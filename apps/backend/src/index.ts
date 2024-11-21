import express from 'express';

const PORT = Number.parseInt(process.env.PORT || '8000');
const app = express();

app.get('/', async (req, res) => {
  res.json({ message: 'Working Perfect!', status: true });
  return;
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Running at http://localhost:${PORT}`);
});