const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <- use bcryptjs only
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 8000;
const JWT_SECRET = 'HELLO WELCOME TO TASK MANAGER APP'; // Replace with a secure key

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    'mongodb+srv://pradeepragu:Pradeep.ragu16@cluster0.15ndn.mongodb.net/task_manager?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model('Admin', adminSchema);

// Routes

// User Signup
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Admin Signup
app.post('/api/AdminSignup', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPass = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPass });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
});

// Admin Login
app.post('/api/AdminLogin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) return res.status(404).json({ message: 'Admin not found' });

    const isPassword = await bcrypt.compare(password, adminUser.password);
    if (!isPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email: adminUser.email, id: adminUser._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// Get all admins
app.get('/api/admin', async (req, res) => {
  const admins = await Admin.find();
  res.status(200).json(admins);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
