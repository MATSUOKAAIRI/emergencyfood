// utils/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
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

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, onAuthStateChanged };