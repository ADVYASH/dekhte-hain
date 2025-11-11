const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = '1437909010723508274';
const CLIENT_SECRET = 'ogSm2CfHEIe-uQ4mMZcbGNebb3keGdBz';
const REDIRECT_URI = 'https://advyash.github.io/dekhte-hain/';

let userProfile = null; // Store user profile temporarily

app.get('/auth/discord', (req, res) => {
  const scope = encodeURIComponent('identify email');
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  // Exchange code for access token
  const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const accessToken = tokenRes.data.access_token;

  // Get user info
  const userRes = await axios.get('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  userProfile = userRes.data; // Save for serving later

  // Redirect back to frontend
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (userProfile) {
    res.json(userProfile);
  } else {
    res.status(401).send('Not logged in');
  }
});

app.use(express.static('.')); // Serve index.html

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
