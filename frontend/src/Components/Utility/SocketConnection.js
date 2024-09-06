import { io } from "socket.io-client";

// Initialize the socket connection
const socket = io("http://localhost:8080", {
  transports: ["websocket"], // Force WebSocket transport
});

// const socket = io("http://localhost:8080", {
//   transports: ["websocket"], // Force WebSocket transport
// });

export default socket;
