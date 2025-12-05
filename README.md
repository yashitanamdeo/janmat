<div align="center">

# 🏛️ JanMat - Citizen Complaint Management System

### *Empowering Citizens, Transforming Governance*

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge&logo=vercel)](https://janmat-beta.vercel.app)
[![Backend API](https://img.shields.io/badge/API-live-blue?style=for-the-badge&logo=render)](https://janmat-backend-r51g.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)](LICENSE)

![JanMat Banner](./frontend/src/assets/Janmat-logo-main.png)

**A modern, full-stack platform revolutionizing how citizens interact with government departments through transparent, efficient complaint management.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**JanMat** is a comprehensive citizen complaint management system designed to bridge the gap between citizens and government departments. Built with modern web technologies, it provides a seamless experience for filing, tracking, and resolving civic issues.

### Why JanMat?

- 🎯 **Citizen-Centric**: Easy-to-use interface for filing and tracking complaints
- 🚀 **Real-Time Updates**: Live notifications and status tracking via WebSockets
- 📊 **Data-Driven**: Advanced analytics and performance metrics
- 🔒 **Secure**: JWT authentication with role-based access control
- 📱 **Responsive**: Works flawlessly on desktop, tablet, and mobile
- 🌍 **Scalable**: Microservices architecture with message queuing

---

## ✨ Key Features

### For Citizens 👥

- **Easy Complaint Filing**: Submit complaints with location, category, and attachments
- **Real-Time Tracking**: Monitor complaint status with live updates
- **Feedback System**: Rate and review resolved complaints
- **Interactive Map**: Visualize complaints on an interactive map
- **Notification Center**: Get instant updates on complaint progress
- **Profile Management**: Manage personal information and complaint history

### For Officers 👮

- **Complaint Assignment**: View and manage assigned complaints
- **Status Updates**: Update complaint status with detailed comments
- **Timeline Tracking**: Add updates to complaint resolution timeline
- **Attendance System**: Check-in/check-out with automated tracking
- **Leave Management**: Apply for and track leave requests
- **Performance Dashboard**: View personal performance metrics

### For Administrators 🔧

- **Department Management**: Create and manage government departments
- **Officer Management**: Assign officers to departments and complaints
- **Analytics Dashboard**: Comprehensive insights into system performance
- **User Management**: Manage citizens, officers, and their permissions
- **Feedback Monitoring**: Review and analyze citizen feedback
- **Advanced Search**: Filter and search complaints with multiple criteria
- **Attendance Oversight**: Monitor officer attendance across departments
- **Leave Approval**: Approve or reject leave requests

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Headless UI, Heroicons
- **Maps**: Leaflet & React-Leaflet
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client

### Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time**: Socket.IO
- **Caching**: Redis (Upstash)
- **Message Queue**: RabbitMQ (CloudAMQP)
- **Email**: Nodemailer
- **File Upload**: Multer
- **API Documentation**: OpenAPI/Swagger
- **Validation**: Zod

### DevOps & Infrastructure

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Neon (Serverless PostgreSQL)
- **Redis**: Upstash
- **Message Queue**: CloudAMQP
- **File Storage**: Cloudinary
- **Version Control**: Git & GitHub

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Citizens │  │ Officers │  │  Admins  │  │   Maps   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │      │
│         └──────────────┴──────────────┴──────────────┘      │
│                          │                                  │
│                    Socket.IO & REST API                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                  Backend (Express.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │  Complaints  │  │   Analytics  │     │
│  │  Controller  │  │  Controller  │  │  Controller  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
│  ┌──────┴──────────────────┴──────────────────┴──────┐    │
│  │              Prisma ORM                            │    │
│  └────────────────────┬───────────────────────────────┘    │
└───────────────────────┼────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐
│  PostgreSQL  │ │   Redis    │ │  RabbitMQ  │
│    (Neon)    │ │  (Upstash) │ │(CloudAMQP) │
└──────────────┘ └────────────┘ └────────────┘
```

### Key Architectural Patterns

- **MVC Pattern**: Separation of concerns with controllers, services, and models
- **Repository Pattern**: Data access abstraction through Prisma
- **Microservices**: Background workers for notifications and scheduled tasks
- **Event-Driven**: RabbitMQ for asynchronous task processing
- **Caching**: Redis for session management and performance optimization
- **Real-Time Communication**: WebSocket connections for live updates

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis instance (optional for local development)
- RabbitMQ instance (optional for local development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashitanamdeo/janmat.git
   cd janmat
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment template
   cp .env.example .env
   
   # Update .env with your credentials
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database
   npx prisma db seed
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/docs

---

## 🔐 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/janmat"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# RabbitMQ (Optional)
RABBITMQ_URL="amqp://localhost"

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Environment Variables

Create a `.env.production` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

---



## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/verify-email      Verify email
GET    /api/auth/me                Get current user
```

### Complaint Endpoints

```
GET    /api/complaints             Get all complaints
POST   /api/complaints             Create complaint
GET    /api/complaints/:id         Get complaint by ID
PATCH  /api/complaints/:id         Update complaint
DELETE /api/complaints/:id         Delete complaint
POST   /api/complaints/:id/assign  Assign complaint to officer
```

### Department Endpoints

```
GET    /api/departments            Get all departments
POST   /api/departments            Create department
GET    /api/departments/:id        Get department by ID
PATCH  /api/departments/:id        Update department
DELETE /api/departments/:id        Delete department
```

### Analytics Endpoints

```
GET    /api/analytics/department-performance    Department stats
GET    /api/analytics/trends                    Complaint trends
GET    /api/analytics/officer-performance       Officer performance
```

**Full API Documentation**: Available at `/docs` endpoint when running the backend server.

---

## 👥 User Roles

### Role Permissions

| Feature | Citizen | Officer | Admin |
|---------|---------|---------|-------|
| File Complaints | ✅ | ✅ | ✅ |
| View Own Complaints | ✅ | ✅ | ✅ |
| Update Complaint Status | ❌ | ✅ | ✅ |
| Assign Complaints | ❌ | ❌ | ✅ |
| Manage Departments | ❌ | ❌ | ✅ |
| Manage Officers | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Approve Leaves | ❌ | ❌ | ✅ |

---


## 🎯 Project Structure

```
janmat/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # Database migrations
│   │   └── seed.ts                # Database seeding
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Utility functions
│   │   ├── workers/               # Background workers
│   │   ├── app.ts                 # Express app setup
│   │   └── server.ts              # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── assets/                # Images, fonts, etc.
│   │   ├── components/            # React components
│   │   │   ├── admin/             # Admin components
│   │   │   ├── analytics/         # Analytics components
│   │   │   ├── auth/              # Auth components
│   │   │   ├── complaint/         # Complaint components
│   │   │   ├── officer/           # Officer components
│   │   │   └── ui/                # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── store/                 # Redux store
│   │   │   └── slices/            # Redux slices
│   │   ├── utils/                 # Utility functions
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   └── package.json
│
└── README.md
```

---

## 🔧 Development


### Code Quality

```bash
# Lint backend
cd backend
npm run lint

# Lint frontend
cd frontend
npm run lint
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Modern government portals and civic tech platforms
- **Icons**: Heroicons
- **Maps**: OpenStreetMap contributors
- **Community**: All contributors and users of JanMat

---

## 📞 Support

- **Email**: support@janmat.com
- **Issues**: [GitHub Issues](https://github.com/yashitanamdeo/janmat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yashitanamdeo/janmat/discussions)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics with ML predictions
- [ ] Integration with government APIs
- [ ] SMS notifications
- [ ] Voice complaint filing
- [ ] Chatbot support
- [ ] Public complaint dashboard

---

<div align="center">

### Made with ❤️ for better governance

**[⬆ back to top](#-janmat---citizen-complaint-management-system)**

</div>
