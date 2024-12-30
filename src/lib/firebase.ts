import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbHRzCL6PBUVG3H6tNaA6yt4IZ2I34Q14",
  authDomain: "aquintel-d3560.firebaseapp.com",
  projectId: "aquintel-d3560",
  storageBucket: "aquintel-d3560.firebasestorage.app",
  messagingSenderId: "208597623393",
  appId: "1:208597623393:web:e38f4660ac3bfa25614020",
  measurementId: "G-HV3QLRQSJ5",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
