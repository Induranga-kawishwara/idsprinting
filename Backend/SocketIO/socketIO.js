import { Server } from "socket.io";
import http from "http";
import express from "express";

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS and WebSocket transport settings
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Enable cookies/authorization headers
  },
  transports: ["websocket", "polling"], // Allow both WebSocket and Polling
  allowUpgrades: true, // Allow upgrade from polling to WebSocket
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
  // Emit to all connected clients
  io.emit(event, data);
};

export { app, io, server };
