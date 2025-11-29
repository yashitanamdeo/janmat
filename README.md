# Janmat - Citizen Grievance Redressal System

![Janmat Logo](https://via.placeholder.com/150?text=Janmat)

**Janmat** is a modern, full-stack web application designed to bridge the gap between citizens and administration. It allows citizens to lodge complaints, track their status, and enables officers to manage and resolve issues efficiently.

## 🚀 Features

- **Citizen Portal**:
    - Secure Registration & Login (OTP-based).
    - Submit Complaints with Location & Media (Images/Videos).
    - Real-time Status Tracking (Timeline).
    - Dashboard for History & Profile.
- **Administration Dashboard**:
    - Role-Based Access Control (Admin, Officer).
    - Advanced Complaint Management (Filter, Sort, Search).
    - Automated Assignment & Workload Management.
    - Analytics & Reporting (Charts, PDF/CSV Exports).
    - SLA Monitoring & Auto-Escalation.
- **Smart Features**:
    - **Auto-Categorization**: AI-powered complaint categorization (NLP).
    - **Notifications**: Real-time updates via Email, SMS, and In-App (Websockets).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching/Queues**: Redis, RabbitMQ
- **Authentication**: JWT, BCrypt, OTP
- **File Storage**: Multer (Local/S3)
- **NLP**: Natural (TF-IDF)

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

## 📂 Project Structure

```bash
janmat/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/          # Environment & DB Config
│   │   ├── controllers/     # Route Handlers
│   │   ├── middlewares/     # Auth, RBAC, Validation
│   │   ├── models/          # Prisma Schema
│   │   ├── routes/          # API Definitions
│   │   ├── services/        # Business Logic (Auth, Complaint, NLP)
│   │   ├── workers/         # RabbitMQ Consumers (Email, SMS)
│   │   └── app.ts           # Entry Point
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React + Vite App
│   ├── src/
│   │   ├── components/      # Reusable UI Components
│   │   ├── pages/           # Application Views
│   │   ├── store/           # Redux Slices
│   │   └── utils/           # Helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Orchestration for Dev/Prod
└── README.md                # Project Documentation
```

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose
- [PostgreSQL](https://www.postgresql.org/) (if running locally without Docker)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/janmat.git
    cd janmat
    ```

2.  **Environment Setup**
    - Copy `.env.example` to `.env` in both `backend` and `frontend` directories.
    - Update the variables (DB credentials, JWT secrets, API keys).

3.  **Run with Docker (Recommended)**
    ```bash
    docker-compose up --build
    ```
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:3000`
    - Postgres: `localhost:5432`
    - Redis: `localhost:6379`
    - RabbitMQ: `http://localhost:15672`

4.  **Run Locally (Manual)**

    *Backend:*
    ```bash
    cd backend
    npm install
    npx prisma migrate dev
    npm run dev
    ```

    *Frontend:*
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🔑 Environment Variables

**Backend (.env)**
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/janmat"
JWT_SECRET="your_super_secret_key"
REDIS_URL="redis://localhost:6379"
RABBITMQ_URL="amqp://localhost"
SMTP_HOST="smtp.example.com"
SMTP_USER="user@example.com"
SMTP_PASS="password"
```

**Frontend (.env)**
```env
VITE_API_URL="http://localhost:3000/api"
VITE_SOCKET_URL="http://localhost:3000"
```

## 📡 API Documentation

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| POST | `/api/auth/register` | Register new citizen | Public |
| POST | `/api/auth/login` | Login user | Public |
| **Complaints** | | | |
| POST | `/api/complaints` | Submit a complaint | Citizen |
| GET | `/api/complaints` | Get my complaints | Citizen |
| GET | `/api/admin/complaints` | Get all complaints | Admin/Officer |
| PATCH | `/api/complaints/:id/status` | Update status | Officer |

## 🤝 How to Contribute

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
