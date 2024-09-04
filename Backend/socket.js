import { Server as socketIoServer } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new socketIoServer(server);

  io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("exampleEvent", (data) => {
      console.log("Example event received:", data);
    });
  });
};

export const getSocket = () => io;
