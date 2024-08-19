import admin from "firebase-admin";
import { FIREBASE_ADMIN_SDK_KEY } from "./config.js";

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_ADMIN_SDK_KEY),
  projectId: "ids-printing",
});

const db = admin.firestore();
export default db;
