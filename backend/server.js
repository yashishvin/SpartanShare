

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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
