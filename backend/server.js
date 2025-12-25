require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');

// Import models and middleware
const User = require('./models/User');
const Issue = require('./models/Issue');
const { authenticate, authorizeStudent, authorizeAdmin } = require('./authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Configuration (memory storage for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'campus-fixit' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint
app.post('/api/auth/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Role must be student or admin')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ==================== STUDENT ENDPOINTS ====================

// Create new issue (student only)
app.post('/api/issues', authenticate, authorizeStudent, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Electrical', 'Water', 'Internet', 'Infrastructure']).withMessage('Invalid category')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category } = req.body;
    let imageUrl = null;

    // Debug logging
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    // Create new issue
    const issue = new Issue({
      title,
      description,
      category,
      imageUrl,
      createdBy: req.user._id
    });

    await issue.save();

    // Populate creator details
    await issue.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Server error while creating issue' });
  }
});

// Get all issues created by logged-in student
app.get('/api/issues/my-issues', authenticate, authorizeStudent, async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({ error: 'Server error while fetching issues' });
  }
});

// Get single issue details (student can only view their own)
app.get('/api/issues/:id', authenticate, authorizeStudent, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('remarks.addedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if issue belongs to the logged-in student
    if (issue.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only view your own issues.' });
    }

    res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Server error while fetching issue' });
  }
});

// Get all issues with filters (student sees only their own issues)
app.get('/api/issues', authenticate, authorizeStudent, async (req, res) => {
  try {
    const { category, status } = req.query;
    
    // Build query - always filter by logged-in student
    const query = { createdBy: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      filters: { category, status },
      issues
    });
  } catch (error) {
    console.error('Get filtered issues error:', error);
    res.status(500).json({ error: 'Server error while fetching issues' });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all reported issues (admin only)
app.get('/api/admin/issues', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { category, status } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email')
      .populate('remarks.addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      filters: { category, status },
      issues
    });
  } catch (error) {
    console.error('Admin get issues error:', error);
    res.status(500).json({ error: 'Server error while fetching issues' });
  }
});

// Update issue status and add remarks (admin only)
app.put('/api/admin/issues/:id', authenticate, authorizeAdmin, [
  body('status').optional().isIn(['Open', 'In Progress', 'Resolved']).withMessage('Invalid status'),
  body('remark').optional().trim().notEmpty().withMessage('Remark cannot be empty')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, remark } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Update status if provided
    if (status) {
      issue.status = status;
    }

    // Add remark if provided
    if (remark) {
      issue.remarks.push({
        text: remark,
        addedBy: req.user._id
      });
    }

    issue.updatedAt = Date.now();
    await issue.save();

    // Populate details
    await issue.populate('createdBy', 'name email');
    await issue.populate('remarks.addedBy', 'name email');

    res.json({
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Server error while updating issue' });
  }
});

// Mark issue as resolved (admin only)
app.put('/api/admin/issues/:id/resolve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    issue.status = 'Resolved';
    issue.updatedAt = Date.now();
    await issue.save();

    // Populate details
    await issue.populate('createdBy', 'name email');
    await issue.populate('remarks.addedBy', 'name email');

    res.json({
      message: 'Issue marked as resolved',
      issue
    });
  } catch (error) {
    console.error('Resolve issue error:', error);
    res.status(500).json({ error: 'Server error while resolving issue' });
  }
});

// ==================== ROOT ENDPOINT ====================

app.get('/', (req, res) => {
  res.json({
    message: 'Campus FixIt API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      student: {
        createIssue: 'POST /api/issues',
        myIssues: 'GET /api/issues/my-issues',
        getIssue: 'GET /api/issues/:id',
        filterIssues: 'GET /api/issues?category=&status='
      },
      admin: {
        allIssues: 'GET /api/admin/issues?category=&status=',
        updateIssue: 'PUT /api/admin/issues/:id',
        resolveIssue: 'PUT /api/admin/issues/:id/resolve'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});