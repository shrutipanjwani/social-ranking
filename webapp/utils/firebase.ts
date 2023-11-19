import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByG1Xiugo5AoDUqavPHXX7ARb5FeJRRjE",
  authDomain: "social-content-repurposing.firebaseapp.com",
  projectId: "social-content-repurposing",
  storageBucket: "social-content-repurposing.appspot.com",
  messagingSenderId: "998815662342",
  appId: "1:998815662342:web:14199fca1d29153662de87",
  measurementId: "G-8693J4XCQ1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the auth service
const auth = getAuth(app);

// Get a reference to the functions service
const functions = getFunctions(app);

// Get a reference to the Firestore service
const db = getFirestore(app);

export { app, auth, functions, db };
