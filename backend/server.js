require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { client } = require('@gradio/client');
const { User, Product, History, ColorProfile } = require('./models');
const { Contact, Subscriber, Cart, Order } = require('./models');

const app = express();
app.use(cors({
  origin: 'https://www.your-live-website.com' 
}));
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'vton_app' } });
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    next();
  } catch (err) { res.status(400).json({ error: "Invalid token" }); }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') next();
    else res.status(403).json({ error: "Admin access required" });
  });
};


app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user' 
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Registration successful",
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      token
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post('/api/admin/products', verifyAdmin, upload.single('productImage'), async (req, res) => {
  const product = await Product.create({ ...req.body, imageUrl: req.file.path });
  res.json(product);
});

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.put('/api/admin/make-admin/:userId', verifyAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { role: 'admin' });
  res.json({ message: "User promoted to admin" });
});

app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.get('/api/products/:id', async (req, res) => res.json(await Product.findById(req.params.id)));

app.post('/api/contact', async (req, res) => {
  try {
    await Contact.create(req.body);
    res.json({ message: "Message sent successfully" });
  } catch (err) { res.status(500).json({ error: "Failed to send message" }); }
});

app.post('/api/subscribe', async (req, res) => {
  try {
    await Subscriber.create({ email: req.body.email });
    res.json({ message: "Subscribed successfully" });
  } catch (err) { res.status(400).json({ error: "Email already subscribed" }); }
});

app.get('/api/cart', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.json(cart.items);

  } catch (err) {
    console.error("Cart Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.put('/api/cart/:productId', verifyToken, async (req, res) => {
  const { quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  const item = cart.items.find(p => p.product.toString() === req.params.productId);
  if (item) item.quantity = quantity;
  await cart.save();
  const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
  res.json(updatedCart.items);
});

app.post('/api/cart', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

  const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();

  const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
  res.json(updatedCart.items);
});

app.delete('/api/cart/:productId', verifyToken, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  cart.items = cart.items.filter(p => p.product.toString() !== req.params.productId);
  await cart.save();
  const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
  res.json(updatedCart.items);
});

app.delete('/api/cart', verifyToken, async (req, res) => {
  await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
  res.json({ message: "Cart cleared" });
});

app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { shippingAddress, items, totalPrice } = req.body;
    const order = await Order.create({
      userId: req.user.id,
      items,
      shippingAddress,
      totalPrice
    });
    res.json(order);
  } catch (err) { res.status(500).json({ error: "Failed to place order" }); }
});

app.get('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    res.json(order);
  } catch (err) { res.status(500).json({ error: "Order not found" }); }
});


app.post('/api/extract-image', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const html = await response.text();

    let imageUrl = null;

    let match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (!match) match = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);

    if (!match) match = html.match(/id="landingImage"[^>]+src="([^"]+)"/i);
    if (!match) match = html.match(/data-old-hires="([^"]+)"/i);

    if (!match) match = html.match(/<link\s+rel="image_src"\s+href="([^"]+)"/i);

    if (match && match[1]) {
      imageUrl = match[1].replace(/&amp;/g, '&');
      res.json({ imageUrl });
    } else {
      res.status(404).json({ error: "Could not automatically detect the product image on this highly secured page." });
    }
  } catch (err) {
    console.error("Scraping Error:", err);
    res.status(500).json({ error: "Failed to scrape URL. The site is actively blocking our request." });
  }
});


app.post('/api/try-on', verifyToken, upload.single('userImage'), async (req, res) => {
  try {
    const { productId, category, productImageUrl, externalLink, existingUserImageUrl, modelIndex } = req.body;

    const userImageUrl = req.file ? req.file.path : existingUserImageUrl;
    if (!userImageUrl) return res.status(400).json({ error: "No user image provided." });

    const userBlob = await (await fetch(userImageUrl)).blob();
    const productBlob = await (await fetch(productImageUrl)).blob();

    let aiCategory = "tops";
    const dbCategory = (category || "").toLowerCase();
    if (dbCategory.includes("bottom") || dbCategory.includes("pant") || dbCategory.includes("skirt")) aiCategory = "bottoms";
    else if (dbCategory.includes("dress") || dbCategory.includes("one-piece")) aiCategory = "one-pieces";

    const fallbackModels = [
      { space: "fashn-ai/fashn-vton-1.5", call: async (c, u, p, cat) => await c.predict("/try_on", [u, p, cat, "model", 30, 1.5, 42, true]) },
      { space: "Kwai-Kolors/Kolors-Virtual-Try-On", call: async (c, u, p) => await c.predict("/predict", [u, p]) },
      { space: "WeShopAI/WeShopAI-Virtual-Try-On", call: async (c, u, p) => await c.predict("/predict", [u, p]) },
      { space: "texelmoda/virtual-try-on-diffusion-vton-d", call: async (c, u, p) => await c.predict("/predict", [u, p]) },
      { space: "tonyassi/fashion-try-on", call: async (c, u, p) => await c.predict("/predict", [u, p]) }
    ];

    const index = parseInt(modelIndex || "0");
    const selectedModel = fallbackModels[index];

    if (!selectedModel) return res.status(400).json({ error: "No more fallback models available." });

    console.log(`[AI TRY-ON] Attempting with model: ${selectedModel.space}`);
    const hfClient = await client(selectedModel.space, { hf_token: process.env.HF_TOKEN });
    const result = await selectedModel.call(hfClient, userBlob, productBlob, aiCategory);

    let resultImageUrl = "";
    if (result.data && result.data.length > 0) {
       if (typeof result.data[0] === 'string') resultImageUrl = result.data[0];
       else if (result.data[0].url) resultImageUrl = result.data[0].url;
       else if (result.data[0].path) resultImageUrl = result.data[0].path;
    }

    if (!resultImageUrl) throw new Error("Invalid output format from Hugging Face model.");

    const historyEntry = await History.create({
      userId: req.user.id,
      product: productId || null,
      externalLink: externalLink || null,
      productImageUrl: productImageUrl || null,
      userImageUrl,
      resultImageUrl
    });

    res.json(historyEntry);
  } catch (error) {
    console.log(`🔥 TRY-ON ERROR (Model index ${req.body.modelIndex}):`, error.message);
    res.status(503).json({ error: "Model busy or failed", details: error.message });
  }
});

app.get('/api/dashboard', verifyToken, async (req, res) => {
  const history = await History.find({ userId: req.user.id }).populate('product').sort({ createdAt: -1 });
  res.json(history);
});

app.get('/api/user/latest-image', verifyToken, async (req, res) => {
  try {
    const latestHistory = await History.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (latestHistory && latestHistory.userImageUrl) {
       return res.json({ imageUrl: latestHistory.userImageUrl });
    }
    res.json({ imageUrl: null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch latest image" });
  }
});

app.delete('/api/history/:id', verifyToken, async (req, res) => {
  try {
    await History.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Fit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.post('/api/color-analysis', verifyToken, upload.single('userImage'), async (req, res) => {
  try {
    const { season, skinTone, hairColor, eyeColor, bestColors, avoidColors } = req.body;

    const parsedBest = JSON.parse(bestColors);
    const parsedAvoid = JSON.parse(avoidColors);

    const profile = await ColorProfile.create({
      userId: req.user.id,
      userImageUrl: req.file.path,
      season,
      skinTone,
      hairColor,
      eyeColor,
      bestColors: parsedBest,
      avoidColors: parsedAvoid
    });

    res.status(201).json(profile);
  } catch (err) {
    console.error("Color Analysis Error:", err);
    res.status(500).json({ error: 'Failed to save color profile' });
  }
});

app.get('/api/color-analysis', verifyToken, async (req, res) => {
  try {
    const profiles = await ColorProfile.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch color profiles' });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'An unknown server error occurred.' });
  }
  next();
});

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT} and connected to MongoDB!`));
  })
  .catch((err) => {
    console.error('CRITICAL ERROR: Failed to connect to MongoDB.');
    console.error(err);
  });