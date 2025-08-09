# TaskyNet Backend

A TypeScript Express.js backend API with Socket.IO for TaskyNet - Internet Provider Task Management System.

## Features

- Express.js with TypeScript
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- Security middleware (Helmet)
- CORS enabled
- HTTP request logging (Morgan)
- Health check endpoints
- Development server with hot reload
- Environment variables support
- Database seeding with sample data
- Comprehensive task management system

## Database Models

### Core Models

1. **User** - System users (Admin, Manager, Technician, Collector, Customer Service)
   - firstName, lastName, phoneNumber, address, roleId, email, password

2. **Role** - User roles in the system
   - name

3. **Customer** - Internet service customers
   - name, location, phoneNumber, serviceId, zoneId

4. **Task** - Work assignments for technicians and collectors
   - taskNumber (auto-incremented), customerId, assignedTo, priority, categoryId, stage, comments[], finishedAt

5. **Service** - Internet services offered
   - name, cost

6. **Zone** - Geographic service zones
   - name

7. **Category** - Task categories (Installation, Maintenance, Repair, etc.)
   - name

### Task Management Features

- **Task Stages**: Pending, Assigned, In Progress, On Hold, Completed, Cancelled
- **Task Priorities**: Low, Medium, High, Urgent
- **Task Comments**: Array of comments with userId and message
- **Auto-incrementing Task Numbers**: Starting from 1
- **Real-time Updates**: Socket.IO for live task status updates

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB connection string and other configuration.

4. Seed the database with initial data:

```bash
npm run seed
```

### Development

Start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Health Check

- **GET** `/` - Main connectivity test endpoint
- **GET** `/health` - Detailed health status with Socket.IO connection count
- **GET** `/socket-info` - Socket.IO configuration and connection information

### Socket.IO Events

#### Client → Server Events:
- `join-room` - Join a specific room
- `leave-room` - Leave a specific room  
- `send-message` - Send a message to a room
- `task-update` - Send task updates to a room

#### Server → Client Events:
- `user-joined` - Notify when user joins a room
- `user-left` - Notify when user leaves a room
- `receive-message` - Receive messages from other users
- `task-updated` - Receive real-time task updates

### Example Response

**GET** `/`
```json
{
  "message": "TaskyNet Backend API is running!",
  "status": "success",
  "timestamp": "2025-08-09T10:30:00.000Z",
  "version": "1.0.0"
}
```

**GET** `/health`
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-08-09T10:30:00.000Z",
  "service": "taskynet-backend",
  "socketConnections": 5
}
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run build:watch` - Build in watch mode
- `npm run seed` - Seed database with initial data

## Default Admin Account

After running the seeder:
- **Email**: admin@taskynet.com
- **Password**: admin123

## Project Structure

```
taskynet-backend/
├── src/
│   └── index.ts          # Main application file
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```
