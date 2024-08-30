// import admin from "firebase-admin";
// import { FIREBASE_ADMIN_SDK_KEY } from "./config.js";

// admin.initializeApp({
//   credential: admin.credential.cert(FIREBASE_ADMIN_SDK_KEY),
//   projectId: "ids-printing",
// });

// const db = admin.firestore();
// export default db;

import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key,
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain: process.env.universe_domain,
};

console.log(serviceAccount);
console.log(process.env.PORT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "ids-printing",
});

const db = admin.firestore();
export default db;
