const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ message: 'GodakPin backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
