# ID Sprinting - Printing Shop POS System

A modern, real-time Point of Sale (POS) system specifically designed for the unique needs of a printing shop. This project leverages a robust stack including React for the frontend, Node.js with Express for the backend, MongoDB for the database, and WebSockets for instant communication.

## About The Project

This project is a full-featured Point of Sale system tailored for printing businesses. It allows shops to manage print jobs, sales, inventory of materials (like paper and ink), and customer data seamlessly. The use of WebSockets enables real-time updates across all connected clients, which is perfect for tracking job progress from the front desk to the production area.

Key Features:

- Intuitive and responsive user interface built with React.
- Robust backend powered by Node.js and Express.
- Flexible NoSQL database using MongoDB.
- Real-time data synchronization with WebSockets for live job tracking.
- Manage custom print orders, track job status, and handle payments.

### Built With

This project is built using the following technologies:

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (likely via a library like [Socket.IO](https://socket.io/))

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your system:

- Node.js & npm
  `sh
    # Download and install from https://nodejs.org/
    `
- MongoDB
  `sh
    # Follow the installation guide at https://www.mongodb.com/try/download/community
    `

### Installation

1.  Clone the repo
    `sh
    git clone https://github.com/Induwara-Andrady/idsprinting.git
    `
2.  **Backend Setup**
    _ Navigate to the server directory (e.g., `cd server`)
    _ Install NPM packages
    `sh
            npm install
            ` \* Create a `.env` file and add your environment variables (e.g., `MONGODB_URI`, `PORT`).
3.  **Frontend Setup**
    _ Navigate to the client directory (e.g., `cd client`)
    _ Install NPM packages
    `sh
            npm install
            `
4.  Run the development servers.
    _ In the server directory: `npm start`
    _ In the client directory: `npm start`

## Usage

Once the application is running, you can open your browser to `http://localhost:3000` (or your configured port) to access the POS interface.

You can use the system to:

- Add, update, and manage printing services and materials.
- Process customer print jobs from creation to payment.
- Track the status of print jobs in real-time.
- View sales reports and analytics.
