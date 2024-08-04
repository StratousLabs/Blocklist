const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Specify allowed origins
const allowedOrigins = [
  'https://blocklist-6.onrender.com/blacklist.txt'
  
];

// Use CORS middleware to allow requests from specific origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

let blacklist = new Set();

// Load the blacklist from a file
fs.readFile('blacklist.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading blacklist file:', err);
    return;
  }
  blacklist = new Set(data.split('\n').map(ip => ip.trim()));
  console.log('Blacklist loaded:', blacklist.size, 'IPs');
});

app.use(bodyParser.json());

// Endpoint to check IP
app.post('/check-ip', (req, res) => {
  const { ip } = req.body;
  if (blacklist.has(ip)) {
    res.json({ malicious: true });
  } else {
    res.json({ malicious: false });
  }
});

// Serve the blacklist file with CORS headers
app.get('/blacklist.txt', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://<your-extension-id>');
  res.sendFile(path.join(__dirname, 'blacklist.txt'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
