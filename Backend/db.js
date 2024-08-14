import admin from "firebase-admin";
import { firebaseConfig } from "./config.js";

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  projectId: "ids-printing",
});

const db = admin.firestore();
export default db;
