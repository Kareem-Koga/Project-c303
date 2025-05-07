// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDEmICLUI5yXzHm8M644c4TRr4l8WWWSc",
  authDomain: "store-a7193.firebaseapp.com",
  projectId: "store-a7193",
  storageBucket: "store-a7193.firebasestorage.app",
  messagingSenderId: "847946966244",
  appId: "1:847946966244:web:2298cff24057461afd38f1"
};

// Initialize Firebase

export const Firebase_app  = initializeApp(firebaseConfig);
export const Firebase_Store = getFirestore(Firebase_app); 
export const Firebase_auth = getAuth(Firebase_app);
export const Firebase_db = getFirestore(Firebase_app);