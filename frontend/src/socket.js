import { io } from "socket.io-client";

const socket = io("wss://idsprinting.vercel.app", {
  transports: ["websocket"],
  autoConnect: false,
});

socket.on("connect_error", (err) => {
  console.error("Connection Error: ", err.message);
});

socket.connect();

export default socket;
