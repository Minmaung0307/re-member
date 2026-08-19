import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGEPd3OXXGv1UzTTgKiWcOtEMkBuLVnIs",
  authDomain: "re-member-mm.firebaseapp.com",
  projectId: "re-member-mm",
  storageBucket: "re-member-mm.firebasestorage.app",
  messagingSenderId: "173625464157",
  appId: "1:173625464157:web:f631bd674c8917ff1e04b4",
  measurementId: "G-VEXBE63Z27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);