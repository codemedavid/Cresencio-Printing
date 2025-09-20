# PrintPro VIP Management System

A comprehensive web-based application for managing VIP member registrations and print job orders for a small printing shop. Built with React, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### Customer Features
- **VIP Registration**: Complete registration form with conditional fields based on customer category (Student, Senior Citizen, Regular Customer, PWD)
- **File Uploads**: Drag-and-drop file upload with support for multiple file types
- **Order Management**: Create and track print job orders with detailed specifications
- **Profile Management**: View personal details and order history
- **Mobile Responsive**: Fully optimized for mobile devices (tested down to 320px)

### Admin Features
- **Registration Management**: Approve/reject VIP member registrations
- **Order Management**: Track and update job order status
- **File Management**: Download and manage uploaded files
- **Dashboard**: Centralized admin interface with sidebar navigation

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Context API for state management
- Custom hooks for data management

### Backend
- Node.js with Express
- PostgreSQL database
- Multer for file uploads
- CORS enabled for cross-origin requests

### Database
- PostgreSQL with comprehensive schema
- Triggers for automatic timestamp updates
- Proper indexing for performance

## Design Principles

- **Simplicity**: Clean, minimalist interface suitable for non-technical users
- **Mobile-First**: Responsive design tested on small screens (320px+)
- **Accessibility**: High contrast colors, clear fonts, keyboard navigation
- **Consistency**: Uniform button styles, form layouts, and navigation
- **Professional**: Neutral color scheme with blue accents

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nom-sum-6
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cp server-package.json package.json
npm install
```

### 4. Database Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE printing_shop_vip;
```

2. Run the database setup script:
```bash
psql -U postgres -d printing_shop_vip -f setup-database.sql
```

### 5. Environment Variables
Create a `.env` file in the root directory:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=printing_shop_vip
DB_PASSWORD=your_password
DB_PORT=5432
PORT=3001
```

### 6. Start the Development Servers

#### Frontend (React)
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### Backend (Express)
```bash
npm start
```
The API will be available at `http://localhost:3001/api`

## Project Structure

```
src/
├── components/           # React components
│   ├── Homepage.tsx     # Landing page
│   ├── VipRegistration.tsx  # Registration form
│   ├── VipLogin.tsx     # Login page
│   ├── VipProfile.tsx   # User profile
│   ├── JobOrderCreation.tsx  # Order creation
│   └── AdminDashboard.tsx    # Admin interface
├── contexts/            # React contexts
│   └── VipContext.tsx   # VIP state management
├── services/            # API services
│   └── api.ts          # API client
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
└── App.tsx             # Main app component
```

## API Endpoints

### VIP Members
- `POST /api/vip-members/register` - Register new VIP member
- `POST /api/vip-members/login` - Login with VIP ID
- `GET /api/vip-members/:id` - Get VIP member details

### Job Orders
- `POST /api/job-orders` - Create new job order
- `GET /api/job-orders/member/:id` - Get member's orders
- `PATCH /api/job-orders/:id/status` - Update order status

### Admin
- `GET /api/admin/registrations` - Get all registrations
- `PATCH /api/admin/vip-members/:id/status` - Update member status
- `GET /api/admin/job-orders` - Get all orders

### Utilities
- `GET /api/paper-sizes` - Get available paper sizes
- `POST /api/upload` - Upload files

## Database Schema

### Tables
- `admin_users` - Admin user accounts
- `vip_members` - VIP member registrations
- `paper_sizes` - Available paper sizes
- `job_orders` - Print job orders
- `job_order_files` - Order file attachments

### Key Features
- Auto-incrementing primary keys
- Foreign key constraints
- JSON fields for flexible data storage
- Automatic timestamp updates via triggers
- Comprehensive indexing for performance

## Mobile Responsiveness

The application is fully responsive and tested on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)
- Extra small screens (320px)

### Mobile Optimizations
- Touch-friendly buttons and inputs
- Collapsible sidebar navigation
- Optimized table layouts with horizontal scrolling
- Reduced font sizes and padding for small screens
- Full-width buttons on mobile

## File Upload

### Supported Formats
- Images: JPG, JPEG, PNG
- Documents: PDF, DOC, DOCX
- Maximum file size: 10MB per file

### Features
- Drag-and-drop interface
- Multiple file selection
- File type validation
- Progress indicators
- Error handling

## Security Features

- Input validation and sanitization
- File type restrictions
- File size limits
- SQL injection prevention
- CORS configuration
- Error handling without sensitive data exposure

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

### Backend (Railway/Heroku)
1. Set up environment variables
2. Deploy the server.js file
3. Ensure PostgreSQL database is accessible

### Database (Supabase/Railway)
1. Create PostgreSQL database
2. Run the setup-database.sql script
3. Update connection string in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please contact:
- Email: support@printpro.com
- Phone: (555) 123-4567

## Demo

### Demo VIP IDs for Testing
- `VIP-123456` - Regular Customer
- `VIP-789012` - Student
- `VIP-345678` - Senior Citizen

### Admin Access
- Username: `admin`
- Password: `admin123`

## Future Enhancements

- Email notifications
- SMS alerts
- Payment integration
- Advanced reporting
- Mobile app
- API rate limiting
- User authentication improvements
- File compression
- Order tracking system# CresencioPrinting
# CresencioPrinting
