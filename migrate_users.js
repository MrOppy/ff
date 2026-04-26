import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsers() {
    console.log("Fetching users...");
    const snapshot = await getDocs(collection(db, 'users'));
    let updated = 0;
    
    for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        if (data.role === 'user' && data.whatsappNumber) {
            console.log(`Updating ${data.email} to seller...`);
            await updateDoc(doc(db, 'users', userDoc.id), { role: 'seller' });
            updated++;
        }
    }
    console.log(`Migrated ${updated} users.`);
    process.exit(0);
}

migrateUsers().catch(console.error);
