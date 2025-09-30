import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Persistent storage using JSON files
const dataDir = path.join(__dirname, 'data');
const vipMembersFile = path.join(dataDir, 'vip-members.json');
const jobOrdersFile = path.join(dataDir, 'job-orders.json');
const countersFile = path.join(dataDir, 'counters.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from files or initialize empty arrays
let vipMembers = [];
let jobOrders = [];
let nextVipId = 1;
let nextOrderId = 1;

// Load existing data
function loadData() {
  try {
    if (fs.existsSync(vipMembersFile)) {
      vipMembers = JSON.parse(fs.readFileSync(vipMembersFile, 'utf8'));
    }
    if (fs.existsSync(jobOrdersFile)) {
      jobOrders = JSON.parse(fs.readFileSync(jobOrdersFile, 'utf8'));
    }
    if (fs.existsSync(countersFile)) {
      const counters = JSON.parse(fs.readFileSync(countersFile, 'utf8'));
      nextVipId = counters.nextVipId || 1;
      nextOrderId = counters.nextOrderId || 1;
    }
    console.log(`Loaded ${vipMembers.length} VIP members and ${jobOrders.length} job orders`);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to files
function saveData() {
  try {
    fs.writeFileSync(vipMembersFile, JSON.stringify(vipMembers, null, 2));
    fs.writeFileSync(jobOrdersFile, JSON.stringify(jobOrders, null, 2));
    fs.writeFileSync(countersFile, JSON.stringify({ nextVipId, nextOrderId }, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Load data on startup
loadData();

// Database connection (commented out for demo)
// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'printing_shop_vip',
//   password: process.env.DB_PASSWORD || 'password',
//   port: process.env.DB_PORT || 5432,
// });

// Email features removed: no nodemailer, templates, or email sending

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files only for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
  } else {
    express.static('dist')(req, res, next);
  }
});

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
    console.log('File filter checking:', file.originalname, file.mimetype);
    
    // Allow all file types for now to avoid upload issues
    console.log('File accepted (allowing all types)');
    return cb(null, true);
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

    // Create VIP member in memory
    const newMember = {
      id: nextVipId++,
      unique_id,
      full_name,
      address,
      email,
      mobile_number,
      customer_category,
      school_name: school_name || null,
      student_id_file: student_id_file || null,
      senior_id_number: senior_id_number || null,
      senior_id_file: senior_id_file || null,
      pwd_id_number: pwd_id_number || null,
      pwd_id_file: pwd_id_file || null,
      verification_id_file: verification_id_file || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    vipMembers.push(newMember);
    saveData(); // Save to persistent storage

    res.json({
      success: true,
      data: { unique_id: newMember.unique_id },
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
    
    const vipMember = vipMembers.find(member => member.unique_id === unique_id);

    if (!vipMember) {
      return res.status(404).json({
        success: false,
        error: 'VIP ID not found'
      });
    }
    
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
      vip_unique_id,
      delivery_type,
      pickup_schedule,
      receiver_name,
      receiver_address,
      receiver_mobile,
      paper_sizes,
      number_of_copies,
      instructions,
      files
    } = req.body;

    // Handle VIP member ID - prefer unique_id if provided, otherwise use vip_member_id
    let finalVipMemberId = vip_member_id;
    if (vip_unique_id) {
      // Find VIP member by unique_id
      let vipMember = vipMembers.find(member => member.unique_id === vip_unique_id);
      
      if (!vipMember) {
        // VIP member doesn't exist in backend, create a placeholder entry
        console.log(`Creating VIP member entry for unique_id: ${vip_unique_id}`);
        const newVipMember = {
          id: nextVipId++,
          unique_id: vip_unique_id,
          full_name: req.body.vip_name || 'Unknown User',
          address: req.body.vip_address || 'Not provided',
          email: req.body.vip_email || 'Not provided',
          mobile_number: req.body.vip_mobile || 'Not provided',
          customer_category: req.body.vip_category || 'Regular Customer',
          school_name: null,
          senior_id_number: null,
          pwd_id_number: null,
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        vipMembers.push(newVipMember);
        saveData(); // Save to persistent storage
        vipMember = newVipMember;
        console.log(`Created VIP member with ID: ${vipMember.id}`);
        
        // Also create in Supabase if possible (for frontend authentication)
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabaseUrl = process.env.VITE_SUPABASE_URL;
          const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
          
          if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            const supabaseData = {
              unique_id: vip_unique_id,
              full_name: req.body.vip_name || 'Unknown User',
              address: req.body.vip_address || 'Not provided',
              email: req.body.vip_email || 'Not provided',
              mobile_number: req.body.vip_mobile || 'Not provided',
              customer_category: req.body.vip_category || 'Regular Customer',
              school_name: null,
              senior_id_number: null,
              pwd_id_number: null,
              status: 'approved'
            };
            
            const { error } = await supabase
              .from('vip_accounts')
              .upsert(supabaseData, { onConflict: 'unique_id' });
              
            if (error) {
              console.warn('Failed to sync VIP member to Supabase:', error.message);
            } else {
              console.log('VIP member synced to Supabase successfully');
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase sync failed (continuing):', supabaseError.message);
        }
      }
      
      finalVipMemberId = vipMember.id;
    } else if (!vip_member_id) {
      return res.status(400).json({
        success: false,
        error: 'VIP member ID or unique ID is required'
      });
    }

    const job_order_number = `JO-${Date.now().toString().slice(-6)}`;

    // Create job order in memory
    const newOrder = {
      id: nextOrderId++,
      job_order_number,
      vip_member_id: finalVipMemberId,
      delivery_type,
      pickup_schedule: pickup_schedule || null,
      receiver_name: receiver_name || null,
      receiver_address: receiver_address || null,
      receiver_mobile: receiver_mobile || null,
      paper_sizes: typeof paper_sizes === 'string' ? JSON.parse(paper_sizes) : paper_sizes,
      number_of_copies: parseInt(number_of_copies),
      instructions: instructions || null,
      files: files || [], // Store uploaded files information
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    jobOrders.push(newOrder);
    saveData(); // Save to persistent storage

    // Get VIP member details for email
    const vipMember = vipMembers.find(member => member.id === parseInt(vip_member_id));

    // Email notifications removed

    res.json({
      success: true,
      data: { job_order_number: newOrder.job_order_number },
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
    
    // Try to find by numeric ID first
    let memberOrders = jobOrders
      .filter(order => order.vip_member_id === parseInt(memberId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // If no orders found by numeric ID, try to find by unique_id
    if (memberOrders.length === 0) {
      const vipMember = vipMembers.find(member => member.unique_id === memberId);
      if (vipMember) {
        memberOrders = jobOrders
          .filter(order => order.vip_member_id === vipMember.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    }

    res.json({
      success: true,
      data: memberOrders
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
    const registrations = vipMembers.map(member => ({
      id: member.id,
      unique_id: member.unique_id,
      full_name: member.full_name,
      address: member.address,
      email: member.email,
      mobile_number: member.mobile_number,
      customer_category: member.customer_category,
      school_name: member.school_name,
      status: member.status,
      created_at: member.created_at
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: registrations
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

    // Get VIP member details before updating
    const vipMember = vipMembers.find(member => member.id === parseInt(id));

    if (!vipMember) {
      return res.status(404).json({
        success: false,
        error: 'VIP member not found'
      });
    }

    // Update status
    vipMember.status = status;
    vipMember.updated_at = new Date().toISOString();
    saveData(); // Save to persistent storage

    // Email notifications removed for status updates

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

// Update job order status
app.patch('/api/admin/job-orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the job order
    const orderIndex = jobOrders.findIndex(order => order.id === parseInt(id));

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job order not found'
      });
    }

    // Update status
    jobOrders[orderIndex].status = status;
    jobOrders[orderIndex].updated_at = new Date().toISOString();
    saveData(); // Save to persistent storage

    res.json({
      success: true,
      job_order: jobOrders[orderIndex]
    });
  } catch (error) {
    console.error('Error updating job order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job order status'
    });
  }
});

// Update job order amount
app.patch('/api/admin/job-orders/:id/amount', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    // Find the job order
    const orderIndex = jobOrders.findIndex(order => order.id === parseInt(id));

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job order not found'
      });
    }

    // Update the order amount
    jobOrders[orderIndex].total_amount_to_pay = parseFloat(amount);
    jobOrders[orderIndex].updated_at = new Date().toISOString();
    saveData(); // Save to persistent storage

    res.json({
      success: true,
      message: 'Order amount updated successfully',
      job_order: jobOrders[orderIndex]
    });
  } catch (error) {
    console.error('Error updating job order amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job order amount'
    });
  }
});

// Delete job order
app.delete('/api/admin/job-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the job order
    const orderIndex = jobOrders.findIndex(order => order.id === parseInt(id));

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job order not found'
      });
    }

    // Remove the order from the array
    const deletedOrder = jobOrders.splice(orderIndex, 1)[0];
    saveData(); // Save to persistent storage

    res.json({
      success: true,
      message: 'Job order deleted successfully',
      deleted_order: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting job order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job order'
    });
  }
});

// Bulk delete job orders
app.delete('/api/admin/job-orders', async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs array is required'
      });
    }

    const deletedOrders = [];
    const notFoundIds = [];

    // Delete orders in reverse order to maintain array indices
    const sortedIds = orderIds.sort((a, b) => b - a);
    
    for (const orderId of sortedIds) {
      const orderIndex = jobOrders.findIndex(order => order.id === parseInt(orderId));
      
      if (orderIndex !== -1) {
        const deletedOrder = jobOrders.splice(orderIndex, 1)[0];
        deletedOrders.push(deletedOrder);
      } else {
        notFoundIds.push(orderId);
      }
    }

    saveData(); // Save to persistent storage

    res.json({
      success: true,
      message: `${deletedOrders.length} job orders deleted successfully`,
      deleted_orders: deletedOrders,
      not_found_ids: notFoundIds
    });
  } catch (error) {
    console.error('Error bulk deleting job orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk delete job orders'
    });
  }
});

app.get('/api/admin/job-orders', async (req, res) => {
  try {
    const ordersWithVipInfo = jobOrders.map(order => {
      const vipMember = vipMembers.find(member => member.id === order.vip_member_id);
      return {
        ...order,
        vip_member: vipMember ? {
          full_name: vipMember.full_name,
          unique_id: vipMember.unique_id
        } : null
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: ordersWithVipInfo
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get job orders for a specific VIP member
app.get('/api/job-orders/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const memberOrders = jobOrders
      .filter(order => order.vip_member_id === parseInt(memberId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: memberOrders
    });
  } catch (error) {
    console.error('Get member orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member orders'
    });
  }
});

// Paper sizes route
app.get('/api/paper-sizes', async (req, res) => {
  try {
    // Return static paper sizes for demo
    const paperSizes = [
      { id: 1, name: 'A4', width: 210, height: 297 },
      { id: 2, name: 'A3', width: 297, height: 420 },
      { id: 3, name: 'Letter', width: 216, height: 279 },
      { id: 4, name: 'Legal', width: 216, height: 356 }
    ];

    res.json({
      success: true,
      data: paperSizes
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
    console.log('Upload request received:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('File uploaded successfully:', req.file.filename);
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

// Serve React app for all other routes (commented out for now)
// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

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
