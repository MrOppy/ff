import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlxoiruR4ji-VuTqxO724bXN41gmJ7L1g",
  authDomain: "ffidbuysell-4d951.firebaseapp.com",
  projectId: "ffidbuysell-4d951",
  storageBucket: "ffidbuysell-4d951.firebasestorage.app",
  messagingSenderId: "196556934777",
  appId: "1:196556934777:web:ab73a973823a6da6620ea8",
  measurementId: "G-CF2RZ1VWCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Your Admin Email (will be used to determine admin access)
export const ADMIN_EMAIL = "johncenahzoppy@gmail.com"; // We will prompt the user to configure this later in the UI or ask now.
