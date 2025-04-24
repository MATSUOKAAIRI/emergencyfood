// utils/firebase.ts
import { initializeApp, FirebaseApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyD73TXNKjsZIWzBUIyo3EIQS_ChkZ5vv6s",
    authDomain: "emergencyfood-55567.firebaseapp.com",
    projectId: "emergencyfood-55567",
    storageBucket: "emergencyfood-55567.firebasestorage.app",
    messagingSenderId: "939531573563",
    appId: "1:939531573563:web:e35f916fe51ff533557f1e"
  };

let firebaseApp: FirebaseApp;

try {
  firebaseApp = getApp();
} catch (e) {
  firebaseApp = initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged };