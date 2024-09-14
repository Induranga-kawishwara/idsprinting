import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Correct import for Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyDO94dStSIlUj33YAEEwEY0aJtzR2ECoFk",
  authDomain: "ids-printing.firebaseapp.com",
  projectId: "ids-printing",
  storageBucket: "ids-printing.appspot.com",
  messagingSenderId: "1095968052560",
  appId: "1:1095968052560:web:076e38a014798289c68855",
  measurementId: "G-NQCQBM3ZT1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app); // Correct getStorage initialization

export { auth, storage };
