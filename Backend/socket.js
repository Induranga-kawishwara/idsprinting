import { Server as socketIoServer } from "socket.io";

let io;

export const initializeSocket = (server, socketOptions = {}) => {
  io = new socketIoServer(server, socketOptions);

  io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    // Example event handlers
    socket.on("customerAdded", (customer) => {
      // Handle adding a customer
      io.emit("customerAdded", customer); // Notify all clients about the new customer
    });

    socket.on("updateCustomer", (customer) => {
      // Handle updating a customer
      io.emit("customerUpdated", customer); // Notify all clients about the updated customer
    });

    socket.on("deleteCustomer", (id) => {
      // Handle deleting a customer
      io.emit("customerDeleted", id); // Notify all clients about the deleted customer
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });
  });
};

export const getSocket = () => io;
