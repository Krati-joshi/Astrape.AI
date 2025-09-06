import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb'; 
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; 
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;
const SALT_ROUNDS = 12; 

let db;


async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(); 

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}


function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeName(name) {
  return name
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeName(name);

    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      email: normalizedEmail,
      password: hashedPassword,
      name: normalizedName,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    const token = jwt.sign({ 
      id: result.insertedId, 
      email: normalizedEmail, 
      name: normalizedName,
      role: newUser.role 
    }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ 
      token, 
      user: { 
        id: result.insertedId, 
        name: normalizedName, 
        email: normalizedEmail,
        role: newUser.role 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: user._id, 
      email: user.email, 
      name: user.name,
      role: user.role || 'user'
    }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role || 'user'
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

connectToDatabase().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});