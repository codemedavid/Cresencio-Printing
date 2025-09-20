const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'printing_shop_vip',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// VIP Member routes
app.post('/api/vip-members/register', upload.fields([
  { name: 'student_id_file', maxCount: 1 },
  { name: 'senior_id_file', maxCount: 1 },
  { name: 'pwd_id_file', maxCount: 1 },
  { name: 'verification_id_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      full_name,
      address,
      email,
      mobile_number,
      customer_category,
      school_name,
      senior_id_number,
      pwd_id_number
    } = req.body;

    // Generate unique ID
    const unique_id = `VIP-${Date.now().toString().slice(-6)}`;

    // Handle file uploads
    const files = req.files;
    let student_id_file = null;
    let senior_id_file = null;
    let pwd_id_file = null;
    let verification_id_file = null;

    if (files) {
      if (files.student_id_file) student_id_file = files.student_id_file[0].filename;
      if (files.senior_id_file) senior_id_file = files.senior_id_file[0].filename;
      if (files.pwd_id_file) pwd_id_file = files.pwd_id_file[0].filename;
      if (files.verification_id_file) verification_id_file = files.verification_id_file[0].filename;
    }

    const result = await pool.query(
      `INSERT INTO vip_members (
        unique_id, full_name, address, email, mobile_number, customer_category,
        school_name, student_id_file, senior_id_number, senior_id_file,
        pwd_id_number, pwd_id_file, verification_id_file, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, unique_id`,
      [
        unique_id, full_name, address, email, mobile_number, customer_category,
        school_name, student_id_file, senior_id_number, senior_id_file,
        pwd_id_number, pwd_id_file, verification_id_file, 'pending'
      ]
    );

    res.json({
      success: true,
      data: { unique_id: result.rows[0].unique_id },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

app.post('/api/vip-members/login', async (req, res) => {
  try {
    const { unique_id } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM vip_members WHERE unique_id = $1',
      [unique_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'VIP ID not found'
      });
    }

    const vipMember = result.rows[0];
    
    if (vipMember.status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'VIP membership not approved'
      });
    }

    res.json({
      success: true,
      data: vipMember
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Job Order routes
app.post('/api/job-orders', async (req, res) => {
  try {
    const {
      vip_member_id,
      delivery_type,
      pickup_schedule,
      receiver_name,
      receiver_address,
      receiver_mobile,
      paper_sizes,
      number_of_copies,
      instructions
    } = req.body;

    const job_order_number = `JO-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO job_orders (
        job_order_number, vip_member_id, delivery_type, pickup_schedule,
        receiver_name, receiver_address, receiver_mobile, paper_sizes,
        number_of_copies, instructions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, job_order_number`,
      [
        job_order_number, vip_member_id, delivery_type, pickup_schedule,
        receiver_name, receiver_address, receiver_mobile, JSON.stringify(paper_sizes),
        number_of_copies, instructions, 'pending'
      ]
    );

    res.json({
      success: true,
      data: { job_order_number: result.rows[0].job_order_number },
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Order creation failed'
    });
  }
});

app.get('/api/job-orders/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM job_orders WHERE vip_member_id = $1 ORDER BY created_at DESC',
      [memberId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Admin routes
app.get('/api/admin/registrations', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vip_members ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations'
    });
  }
});

app.patch('/api/admin/vip-members/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE vip_members SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    });
  }
});

app.get('/api/admin/job-orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT jo.*, vm.full_name, vm.unique_id
      FROM job_orders jo
      JOIN vip_members vm ON jo.vip_member_id = vm.id
      ORDER BY jo.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Paper sizes route
app.get('/api/paper-sizes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM paper_sizes WHERE active = true ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get paper sizes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch paper sizes'
    });
  }
});

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: { file_path: req.file.filename }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
