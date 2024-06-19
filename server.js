const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3012;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/registerLogin');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schema and model for user
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Routes

// Serve home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

// Serve registration page
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

// Handle user registration
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    try {
      if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('Email already registered');
      }
      const newUser = new User({ username, email, password });
      await newUser.save();
      res.send('User registered successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error registering user');
    }
  });

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Handle user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email, password });
      if (user) {
        res.redirect('/afterlogin');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error logging in');
    }
  });

// Serve after-login page
app.get('/afterLogin', (req, res) => {
  res.sendFile(__dirname + '/public/afterLogin.html');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
