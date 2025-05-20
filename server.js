const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// // Update CORS configuration
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://honesnaks.netlify.app', 'http://localhost:3000']
//     : 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));

// ✅ Allow requests from your Netlify frontend
app.use(cors({
  origin: 'https://honesnaks.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ✅ Handle preflight requests for all routes
app.options('*', cors());

app.use(bodyParser.json());

// Create SQLite database connection
const db = new sqlite3.Database('./billbook.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    base_price REAL NOT NULL,
    total_price REAL NOT NULL
  )`);
}

// API Routes
app.get('/api/bills', (req, res) => {
  db.all('SELECT * FROM bills', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/bills', (req, res) => {
  const { date, customer_name, product, quantity, base_price, total_price } = req.body;
  db.run(
    'INSERT INTO bills (date, customer_name, product, quantity, base_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [date, customer_name, product, quantity, base_price, total_price],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/bills/:id', (req, res) => {
  const { date, customer_name, product, quantity, base_price, total_price } = req.body;
  db.run(
    'UPDATE bills SET date = ?, customer_name = ?, product = ?, quantity = ?, base_price = ?, total_price = ? WHERE id = ?',
    [date, customer_name, product, quantity, base_price, total_price, req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Updated successfully' });
    }
  );
});

app.delete('/api/bills/:id', (req, res) => {
  db.run('DELETE FROM bills WHERE id = ?', req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 

app.get('/', (req, res) => {
  res.send('API is running');
});
