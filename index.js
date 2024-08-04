const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware to allow cross-origin requests
app.use(cors());

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
