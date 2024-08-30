import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEYS)
  ),
  projectId: "ids-printing",
});

const db = admin.firestore();
export default db;
