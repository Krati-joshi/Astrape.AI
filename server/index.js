import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://astrape-ai.vercel.app',
      'https://astrape-ai-xegi.vercel.app',
      'https://astrapeai.netlify.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.options(/.*/, cors());

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;
const SALT_ROUNDS = 12;

let db;

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    db = client.db();

    const usersExists = await db.listCollections({ name: 'users' }).hasNext();
    if (!usersExists) {
      await db.createCollection('users');
      await db.collection('users').createIndex({ email: 1 }, { unique: true });

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordPlain = process.env.ADMIN_PASSWORD;

      const adminPassword = await bcrypt.hash(adminPasswordPlain, SALT_ROUNDS);

      await db.collection('users').insertOne({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`👤 Admin user created: ${adminEmail} / ${adminPasswordPlain}`);
    }

    const productsExists = await db.listCollections({ name: 'products' }).hasNext();
    if (!productsExists) {
      await db.createCollection('products');

      const sampleProducts = [
        {
          name: 'Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
          price: 14999,
          category: 'electronics',
          imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Smart Watch',
          description: 'Fitness tracker with heart rate monitor and GPS',
          price: 18999,
          category: 'electronics',
          imageUrl: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Bluetooth Speaker',
          description: 'Portable waterproof speaker with rich bass',
          price: 5999,
          category: 'electronics',
          imageUrl: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await db.collection('products').insertMany(sampleProducts);
      console.log('📦 Sample products created');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeName(name) {
  return name
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
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

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Name, email, password required' });

    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeName(name);

    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      email: normalizedEmail,
      password: hashedPassword,
      name: normalizedName,
      role: 'user',
      cart: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    const token = jwt.sign(
      {
        id: result.insertedId,
        email: normalizedEmail,
        name: normalizedName,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        name: normalizedName,
        email: normalizedEmail,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { minPrice, maxPrice, category, search } = req.query;
    const filter = {};

    if (minPrice && !isNaN(Number(minPrice))) {
      filter.price = { ...filter.price, $gte: minPrice };
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }
    
    if (category && category !== '') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }
    
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
      
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, imageUrl } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    updateData.updatedBy = req.user.id;
    updateData.updatedAt = new Date();

    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    const cart = user?.cart || [];
    
    const populatedCart = [];
    for (const item of cart) {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
      if (product) {
        populatedCart.push({
          ...item,
          productId: item.productId.toString(),
          product: {
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category
          }
        });
      }
    }
    
    res.json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid product ID and quantity required' });
    }

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
if (!user) {
  return res.status(404).json({ error: "User not found" });
}

const cart = user.cart || [];


    const existingItem = cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.push({ 
        productId: new ObjectId(productId), 
        quantity: Number(quantity),
        addedAt: new Date()
      });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { cart, updatedAt: new Date() } }
    );

    res.json({ message: 'Product added to cart successfully', cartCount: cart.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/cart/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity == null || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    let cart = user.cart || [];

    const item = cart.find(item => item.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ error: 'Product not in cart' });
    }

    item.quantity = Number(quantity);

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { cart, updatedAt: new Date() } }
    );

    res.json({ message: 'Cart updated successfully', cartCount: cart.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/cart/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    let cart = user.cart || [];

    cart = cart.filter(item => item.productId.toString() !== productId);

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { cart, updatedAt: new Date() } }
    );

    res.json({ message: 'Product removed from cart', cartCount: cart.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/cart', authMiddleware, async (req, res) => {
  try {
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { cart: [], updatedAt: new Date() } }
    );

    res.json({ message: 'Cart cleared successfully', cartCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

connectToDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}); 