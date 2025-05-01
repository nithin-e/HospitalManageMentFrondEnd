import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDZecYAaEivri4ucwczlmvuoyQQ5zsVaYs",
    authDomain: "hospitalmanagement-b019e.firebaseapp.com",
    projectId: "hospitalmanagement-b019e",
    storageBucket: "hospitalmanagement-b019e.firebasestorage.app",
    messagingSenderId: "268963226789",
    appId: "1:268963226789:web:ec6c16f2bdda54ae31d94c",
    measurementId: "G-2VRNY6MZ1B"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { app, auth };

// Global declaration
