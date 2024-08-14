import dotenv from "dotenv";
dotenv.config();

const { PORT, FIREBASE_ADMIN_SDK_KEY } = process.env;

export { PORT as port, FIREBASE_ADMIN_SDK_KEY };
