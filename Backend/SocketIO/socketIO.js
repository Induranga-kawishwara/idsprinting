import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors"; // Ensure cors is imported here

const app = express();
const server = http.createServer(app);

// Apply CORS middleware to express
app.use(
  cors({
    origin: "https://ids-printing.web.app", // Allow the frontend origin
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true, // Enable credentials if needed
  })
);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "https://ids-printing.web.app", // Same frontend origin for Socket.IO
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  },
});

// Store users and their socket IDs
const users = {};

// Handle new connections
io.on("connection", (socket) => {
  console.log(`POS System connected: ${socket.id}`);

  // Store the POS system using the socket ID
  const posSystemId = socket.handshake.query.posSystemId;
  if (posSystemId) {
    users[posSystemId] = socket.id;
    console.log(`POS System registered: ${posSystemId}`);
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`POS System disconnected: ${socket.id}`);
    for (const posId in users) {
      if (users[posId] === socket.id) {
        delete users[posId];
        break;
      }
    }
  });
});

// Broadcast customer data changes to all connected POS systems
export const broadcastCustomerChanges = (event, data) => {
  io.emit(event, data);
};

export { app, io, server };
