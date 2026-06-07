import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBm7-cJI6WmDUAVgnOd5XhqUqK4VHRv6bw",
  authDomain: "health-assistant-741c8.firebaseapp.com",
  projectId: "health-assistant-741c8",
  storageBucket: "health-assistant-741c8.firebasestorage.app",
  messagingSenderId: "735280335042",
  appId: "1:735280335042:web:54db419bd062357ce5535b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
