import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import DatabaseConnection from './config/database';
import routes from './routes';
import { swaggerUi, swaggerSpec } from './swagger';
import 'dotenv/config'; // Load environment variables from .env file

const app: Application = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files for Socket.IO test client
app.use('/examples', express.static(path.join(__dirname, '../examples')));

// Swagger Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', routes);


// 404 handler for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error',
    path: req.originalUrl
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle user joining a room
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Handle user leaving a room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`👤 User ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit('user-left', socket.id);
  });

  // Handle custom events (example for real-time messaging)
  socket.on('send-message', (data: { roomId: string; message: string; userId: string }) => {
    socket.to(data.roomId).emit('receive-message', {
      message: data.message,
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle task updates (example for real-time task management)
  socket.on('task-update', (data: { roomId: string; taskId: string; update: any }) => {
    socket.to(data.roomId).emit('task-updated', {
      taskId: data.taskId,
      update: data.update,
      updatedBy: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Main endpoint: http://localhost:${PORT}/`);
      console.log(`🔌 Socket.IO is ready for connections`);
      console.log(`🧪 Test client: http://localhost:${PORT}/test`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
export default app;
