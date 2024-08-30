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
  private_key: process.env.private_key
    ? process.env.private_key.replace(/\\n/g, "\n")
    : undefined, // Ensure proper newlines
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain: process.env.universe_domain,
};

const serviceAccount1 = {
  type: "service_account",
  project_id: "ids-printing",
  private_key_id: "21b9477f33d7197dc70859e2e53d6c755eb1a594",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPzaVSlxIXcWT1\nHyaI6HUkgxOjkTjYPUOf1oJ2affx6FfI+yI6g06bnEvbeReYkTvzbSd7KGZlXq5t\nUeioVg5vsNl2xS2xVV9VhrjCXvDZPoceJ9pMO4ZMuC5A8bQf6CCrZQURey5bZ8ju\nVPKX3u9VMSFuknQKUobr2z2MkKT7UBHWykJdwYnO1ouiHTw/ONIZnPMUPstMBN1s\nlPFMaL1lJnXgxHRdkyARkK/uXW5FbFHwT+K6VPC9tw+N6JIH7eJgsJr8e3uRSHcJ\nRMd9mH6Eys9gWee+UbnlVslo767CKtYGKAZJzXkzStfrUxEA9XDJyqtTMU7rvWkz\nP/MkeAEhAgMBAAECggEAHNrZKUP9eOBfzLK/4tRmicSiujx82Hf/VydN89vomEBz\nSh7nJJldlbmJBgeFSYPnP3jJee5E87AHR/pO9GsIs6UquTWNj/mDFKjxqFnPF1d5\noywVAa9lSWtszstRP/n3aV1MbB4+9GXPrpqAmiqUcK+zDPvMna9SeVc273kZU6UN\nVIdUxNwPdLiX14V+gxOgaczWsvfx2E93quEsF4kDzYkXTXgP4Fml4qHSRcFd2VT9\nRZKdtkVSn3Gc6kjbPwCF+ZEC7hjHxKTTQAlDE5hwrGpmT9kpyosBgJSfz1tY8v+O\nrmPi4UeP9Ro07xMhzFKBcaEIUjWl8D5evJI8/OlmzQKBgQDtSah8jgrGmj8um7z4\n40jc+EE2FYF+jiZdsOd8g9eJE+gdO2ix/D0pD73sOCm7SxEA/htEAa6YaEEx2cCm\n+8Zlf3oaO5zWLkIpgDduOgSWsmHoLIP2PvmXWhKpswuMB78NYzNooaKcdC1KVuj5\nwJUzNmkn+EEAZo6BbwzEDMRitQKBgQDgMMJJknL+LKLEzehPqhwYc3HgoOd1n3/3\nDGWwAfVrPe1wUtb07V8oOLyFw9BAtf0WkoVR8pscE5lQr3iz6FCPUv1QAZYe77Zv\nRLirwWEp3ul4S7LYi+AXXAX+DVxA/M9rRVq8+ek2MuQxVkVeh6ibeTg7bJsbh1Vn\nPn5ZPFwMPQKBgQDif4XZZsh4bLHUrooCVQmvCzVMB9k00UFj+0Hrg/nP+fV9OcEk\n6+4BbOpQOgfzpKLVfLjQAH8FMbbRe9Y+TmRBbB5EPhTmCP/Ul3PRvoW0xw9XzG4m\nNlSOmUbpP2PNRXOjtsZSoL8Ucnzs0erOw3pniQ91PK3nUP3EJRldZgZrZQKBgAVo\nh7dYpheFoiOXSAxr8SOR3WRq3UqUH3UpQma9lVsR8mFsTi04cLw6qimb8LEu8r0R\nqc+xR5akzmUI5qOIbjEW8m90qldytvb2NHJIRvzImN9DDDx3G1/U43wefGRA9QwE\nb0zxxnN9RM3/48qFAUdG5FlipFdEq4XDFy816o6NAoGAAZXlWcxG88xm+QR4MtRK\nteSrxxMvtNV6JwoFz0/Yhm8v+V+xOlDiFeEVZ2luXg1MuL5yGYLU3TfEKkqzB2du\ng+ghim4fM4UCQhlxDICmF0wZFL1jhpqan4ghnPv1j0RondR+DSM63BFp3wYRCJwQ\nJlD0umrJByL7ZTVnuY1200E=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-zgtsb@ids-printing.iam.gserviceaccount.com",
  client_id: "115143708719662949263",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-zgtsb%40ids-printing.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

console.log(serviceAccount);
console.log(serviceAccount1);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "ids-printing",
});

const db = admin.firestore();
export default db;
