import { collection, getFirestore } from "firebase/firestore";
import { app } from "./firebase";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage();

export const usersCollection = collection(db, "users");
