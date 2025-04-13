require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Using the REACT_APP prefix (from your backend .env file)
const oAuth2Client = new OAuth2Client(
  process.env.REACT_APP_GOOGLE_CLIENT_ID,    // Accessing the variable prefixed with REACT_APP_ in the backend
  process.env.REACT_APP_GOOGLE_CLIENT_SECRET, // Same here
  'postmessage'  // Critical for frontend auth flow
);

// Health check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Handle Google auth code exchange
app.post('/auth/google', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing code in request body' });
    }

    console.log('Received auth code:', code);

    const { tokens } = await oAuth2Client.getToken(code); // Exchange code for tokens
    console.log('Tokens:', tokens);

    res.json(tokens);
  } catch (error) {
    console.error('Error during token exchange:', error.response?.data || error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
