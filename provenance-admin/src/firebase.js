// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD_kO01B-44HfilANj4mTfXnvdKkXp1yEc",
    authDomain: "provnance.firebaseapp.com",
    projectId: "provnance",
    storageBucket: "provnance.firebasestorage.app",
    messagingSenderId: "227539615546",
    appId: "1:227539615546:web:78f72df1aa1a3479431a03",
    measurementId: "G-77F9VPKF9V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };