import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyCJT1W1M7TKIS_n6jbBywrzDKOp4QkURWw",
  authDomain: "oro-digital-7a8b0.firebaseapp.com",
  projectId: "oro-digital-7a8b0",
  storageBucket: "oro-digital-7a8b0.firebasestorage.app",
  messagingSenderId: "254815058944",
  appId: "1:254815058944:web:ba6a8c62c599c86b20ace5"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enhanced offline persistence with unlimited cache size
enableMultiTabIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.log('Persistence failed: Browser not supported');
  }
});

// Enable network connectivity monitoring
export const enableNetworkMonitoring = () => {
  // This will help Firebase handle offline/online transitions better
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      console.log('Network connection lost - Firebase will use cached data');
    });
  }
};

// Initialize network monitoring
enableNetworkMonitoring();
