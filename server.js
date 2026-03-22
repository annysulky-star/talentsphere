const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// In-memory database
let users = [
  { id: "1", name: "Luna Moves", email: "luna@dance.com", password: "123", talentType: "Dancer", bio: "Professional dancer" },
  { id: "2", name: "AeroFlip", email: "aero@acro.com", password: "123", talentType: "Acrobatics", bio: "Amazing acrobat" },
  { id: "3", name: "SketchMaster", email: "art@artist.com", password: "123", talentType: "Artist", bio: "Digital artist" },
  { id: "4", name: "GoalKing", email: "sports@goal.com", password: "123", talentType: "Sports", bio: "Professional athlete" },
  { id: "5", name: "MelodyWave", email: "music@melody.com", password: "123", talentType: "Musician", bio: "Singer songwriter" }
];

let posts = [];
let likes = [];
let comments = [];

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password, talentType } = req.body;
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: "Email exists" });
  
  const newUser = { id: String(users.length + 1), name, email, password, talentType, bio: "New creator!" };
  users.push(newUser);
  res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, talentType: newUser.talentType } });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, talentType: user.talentType, bio: user.bio } });
});

// Get all creators
app.get('/api/creators', (req, res) => {
  const { talent } = req.query;
  let filtered = users;
  if (talent && talent !== 'all') {
    filtered = users.filter(u => u.talentType === talent);
  }
  res.json(filtered);
});

// Get single creator
app.get('/api/creator/:id', (req, res) => {
  const creator = users.find(u => u.id === req.params.id);
  if (!creator) return res.status(404).json({ error: "Not found" });
  res.json(creator);
});

// Like post (simplified)
app.post('/api/like/:creatorId', (req, res) => {
  const { userId } = req.body;
  const key = `${req.params.creatorId}_${userId}`;
  if (!likes.includes(key)) {
    likes.push(key);
    res.json({ liked: true });
  } else {
    const index = likes.indexOf(key);
    likes.splice(index, 1);
    res.json({ liked: false });
  }
});

// Add comment
app.post('/api/comment/:creatorId', (req, res) => {
  const { userId, userName, text } = req.body;
  comments.push({ creatorId: req.params.creatorId, userId, userName, text, time: Date.now() });
  res.json({ success: true });
});

// Get comments
app.get('/api/comments/:creatorId', (req, res) => {
  const creatorComments = comments.filter(c => c.creatorId === req.params.creatorId);
  res.json(creatorComments);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Users: ${users.length}`);
});
