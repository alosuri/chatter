import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "chatter-8b355.firebaseapp.com",
  projectId: "chatter-8b355",
  storageBucket: "chatter-8b355.appspot.com",
  messagingSenderId: "602611548902",
  appId: "1:602611548902:web:26091ae4ecdd535fc33127"
};

export const app = initializeApp(firebaseConfig);
