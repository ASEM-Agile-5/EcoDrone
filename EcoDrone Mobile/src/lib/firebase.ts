import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDDcihsFn-tSZWMdpzuuU_ZVHdKwGiWZMM",
  authDomain: "ecodrone-dev.firebaseapp.com",
  databaseURL: "https://ecodrone-dev-default-rtdb.firebaseio.com",
  projectId: "ecodrone-dev",
  storageBucket: "ecodrone-dev.firebasestorage.app",
  messagingSenderId: "105774160727",
  appId: "1:105774160727:web:1d6b93f1f702a9cdc87c12",
};

let app: FirebaseApp | undefined;
let db: Database | undefined;
let firebaseAuth: Auth | undefined;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  firebaseAuth = getAuth(app);
} catch (e) {
  console.error("[Firebase] initializeApp failed:", e);
}

export { db, firebaseAuth };
