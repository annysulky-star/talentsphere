const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// In-memory database
let users = [
  { id: "1", name: "Luna Moves", email: "luna@dance.com", password: "123", talentType: "Dancer", bio: "Professional dancer with 5 years experience", followers: 1200 },
  { id: "2", name: "AeroFlip", email: "aero@acro.com", password: "123", talentType: "Acrobatics", bio: "Amazing acrobat and parkour artist", followers: 890 },
  { id: "3", name: "SketchMaster", email: "art@artist.com", password: "123", talentType: "Artist", bio: "Digital artist creating magic with colors", followers: 2300 },
  { id: "4", name: "GoalKing", email: "sports@goal.com", password: "123", talentType: "Sports", bio: "Professional soccer player", followers: 3400 },
  { id: "5", name: "MelodyWave", email: "music@melody.com", password: "123", talentType: "Musician", bio: "Singer songwriter", followers: 4500 },
  { id: "6", name: "MagicMike", email: "magic@magic.com", password: "123", talentType: "Magician", bio: "Mind-blowing magic tricks", followers: 670 },
  { id: "7", name: "FunnyFrank", email: "comedy@comedy.com", password: "123", talentType: "Comedian", bio: "Making people laugh since 2020", followers: 890 }
];

// Register
app.post('/api/register', (req, res) => {
  try {
    const { name, email, password, talentType } = req.body;
    const existing = users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    const newUser = { 
      id: String(users.length + 1), 
      name, 
      email, 
      password, 
      talentType, 
      bio: "New creator! Check out my talent!",
      followers: 0
    };
    users.push(newUser);
    res.json({ 
      success: true, 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        talentType: newUser.talentType,
        bio: newUser.bio,
        followers: 0
      } 
    });
  } catch(err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        talentType: user.talentType, 
        bio: user.bio,
        followers: user.followers
      } 
    });
  } catch(err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get all creators
app.get('/api/creators', (req, res) => {
  try {
    const { talent } = req.query;
    let filtered = users;
    if (talent && talent !== 'all') {
      filtered = users.filter(u => u.talentType === talent);
    }
    // Remove passwords from response
    const safeUsers = filtered.map(u => ({
      id: u.id,
      name: u.name,
      talentType: u.talentType,
      bio: u.bio,
      followers: u.followers
    }));
    res.json(safeUsers);
  } catch(err) {
    res.status(500).json({ error: "Failed to load creators" });
  }
});

// Get single creator
app.get('/api/creator/:id', (req, res) => {
  try {
    const creator = users.find(u => u.id === req.params.id);
    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }
    res.json({
      id: creator.id,
      name: creator.name,
      talentType: creator.talentType,
      bio: creator.bio,
      followers: creator.followers
    });
  } catch(err) {
    res.status(500).json({ error: "Failed to load creator" });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ Total creators: ${users.length}`);
  console.log(`✅ App URL: http://localhost:${PORT}`);
});
