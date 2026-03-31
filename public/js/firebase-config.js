import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAwi4wFv-58Z556vHtWjc6iK8bzFbX2WNw",
    authDomain: "coomerc-app.firebaseapp.com",
    projectId: "coomerc-app",
    storageBucket: "coomerc-app.firebasestorage.app",
    messagingSenderId: "281136939999",
    appId: "1:281136939999:web:accc93741bf77af4dffa6a",
    measurementId: "G-MFN549HFDJ"
};

const app = initializeApp(firebaseConfig);

// SOLO UNA VEZ y con la palabra 'export' delante
export const db = getFirestore(app);