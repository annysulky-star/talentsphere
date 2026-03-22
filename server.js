const express = require('express');
const path = require('path');
const app = express();

// Serve static files from public folder
app.use(express.static('public'));

// In-memory database (no MongoDB needed!)
let users = [];
let posts = [];

// Middleware
app.use(express.json());

// Sample creators data
const sampleCreators = [
  { id: "1", name: "Luna Moves", email: "luna@dance.com", password: "pass123", talentType: "Dancer", profileMedia: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400", bio: "Professional dancer sharing my passion", followers: [], createdAt: Date.now() },
  { id: "2", name: "AeroFlip", email: "aero@acro.com", password: "pass123", talentType: "Acrobatics", profileMedia: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", bio: "Acrobatics and parkour artist", followers: [], createdAt: Date.now() },
  { id: "3", name: "SketchMaster", email: "art@artist.com", password: "pass123", talentType: "Artist", profileMedia: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400", bio: "Digital artist creating magic", followers: [], createdAt: Date.now() }
];

// Initialize with sample data if empty
if (users.length === 0) {
  users = [...sampleCreators];
  
  // Add sample posts
  sampleCreators.forEach(creator => {
    posts.push({
      id: "post_" + creator.id,
      creatorId: creator.id,
      mediaUrl: creator.profileMedia,
      mediaType: "image",
      title: `${creator.name}'s showcase`,
      talentTag: creator.talentType,
      views: Math.floor(Math.random() * 1000),
      likes: [],
      comments: [],
      createdAt: Date.now()
    });
  });
}

// ============ API ROUTES ============

// Register new user
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, talentType } = req.body;
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const newUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    talentType,
    profileMedia: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    bio: "New creator ready to showcase talent!",
    followers: [],
    createdAt: Date.now()
  };
  
  users.push(newUser);
  
  // Create initial post for new user
  posts.push({
    id: "post_" + newUser.id,
    creatorId: newUser.id,
    mediaUrl: newUser.profileMedia,
    mediaType: "image",
    title: `${newUser.name}'s first post!`,
    talentTag: newUser.talentType,
    views: 0,
    likes: [],
    comments: [],
    createdAt: Date.now()
  });
  
  res.json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      talentType: newUser.talentType,
      profileMedia: newUser.profileMedia
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      talentType: user.talentType,
      profileMedia: user.profileMedia,
      bio: user.bio,
      followers: user.followers.length
    }
  });
});

// Get all creators
app.get('/api/creators', (req, res) => {
  const { talent } = req.query;
  let filteredUsers = [...users];
  
  if (talent && talent !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.talentType === talent);
  }
  
  // Add post info to each creator
  const creatorsWithPosts = filteredUsers.map(creator => {
    const userPosts = posts.filter(p => p.creatorId === creator.id);
    return {
      ...creator,
      password: undefined,
      latestPost: userPosts[0] || null,
      postsCount: userPosts.length
    };
  });
  
  res.json(creatorsWithPosts);
});

// Get single creator
app.get('/api/creators/:id', (req, res) => {
  const creator = users.find(u => u.id === req.params.id);
  if (!creator) {
    return res.status(404).json({ error: 'Creator not found' });
  }
  
  const creatorPosts = posts.filter(p => p.creatorId === creator.id);
  res.json({
    creator: { ...creator, password: undefined },
    posts: creatorPosts
  });
});

// Like/Unlike post
app.post('/api/interactions/like/:postId', (req, res) => {
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const userId = req.body.userId;
  const likeIndex = post.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }
  
  res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
});

// Add comment
app.post('/api/interactions/comment/:postId', (req, res) => {
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const { userId, userName, text } = req.body;
  post.comments.push({
    userId,
    userName,
    text,
    createdAt: Date.now()
  });
  
  res.json(post.comments);
});

// Follow creator
app.post('/api/interactions/follow/:creatorId', (req, res) => {
  const creator = users.find(u => u.id === req.params.creatorId);
  const user = users.find(u => u.id === req.body.userId);
  
  if (!creator || !user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const followIndex = creator.followers.indexOf(req.body.userId);
  
  if (followIndex === -1) {
    creator.followers.push(req.body.userId);
  } else {
    creator.followers.splice(followIndex, 1);
  }
  
  res.json({ isFollowing: followIndex === -1, followers: creator.followers.length });
});

// Increment views
app.post('/api/interactions/view/:postId', (req, res) => {
  const post = posts.find(p => p.id === req.params.postId);
  if (post) {
    post.views += 1;
  }
  res.json({ success: true });
});

// Serve the frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Total creators: ${users.length}`);
});