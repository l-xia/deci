/**
 * Firebase debugging utilities
 */

import { collection, getDocs, query, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export async function debugFirebaseConnection() {
  console.group('🔍 Firebase Debug Info');

  try {
    // Check auth state
    const user = auth.currentUser;
    console.log('Auth State:', {
      isAuthenticated: !!user,
      userId: user?.uid,
      email: user?.email,
      isAnonymous: user?.isAnonymous,
    });

    if (!user) {
      console.warn('⚠️ No authenticated user found');
      console.groupEnd();
      return;
    }

    // Try to read from Firestore
    console.log('Attempting to read user data...');
    const userDataPath = `users/${user.uid}/data`;
    console.log('Path:', userDataPath);

    try {
      // Try to list all documents in the data subcollection
      const dataRef = collection(db, 'users', user.uid, 'data');
      const snapshot = await getDocs(query(dataRef));

      console.log(`✅ Successfully connected to Firestore`);
      console.log(`📦 Found ${snapshot.size} documents`);

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          console.log(`  - Document: ${doc.id}`, {
            data: doc.data(),
            exists: doc.exists(),
          });
        });
      } else {
        console.log('📭 No documents found (this is normal for new users)');
      }
    } catch (firestoreError) {
      console.error('❌ Firestore Error:', {
        code: firestoreError.code,
        message: firestoreError.message,
        details: firestoreError,
      });

      // Check for common permission errors
      if (firestoreError.code === 'permission-denied') {
        console.error('🚫 Permission denied - check Firestore rules');
        console.log('Expected path:', userDataPath);
        console.log('User ID:', user.uid);
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.groupEnd();
}

export async function testFirebaseWrite() {
  console.group('✍️ Testing Firebase Write');

  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user authenticated');
      console.groupEnd();
      return;
    }

    const testData = {
      test: 'Hello Firebase',
      timestamp: new Date().toISOString(),
    };

    console.log('Writing test data:', testData);
    const testRef = doc(db, 'users', user.uid, 'data', 'test');
    await setDoc(testRef, { data: testData });
    console.log('✅ Write successful');

    // Try to read it back
    console.log('Reading back test data...');
    const docSnap = await getDoc(testRef);
    if (docSnap.exists()) {
      console.log('✅ Read successful:', docSnap.data());
    } else {
      console.error('❌ Document does not exist after write');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }

  console.groupEnd();
}

export async function checkSavedData() {
  console.group('📦 Checking Saved Data');

  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user authenticated');
      console.groupEnd();
      return;
    }

    const keys = ['cards', 'dailyDeck', 'templates'];

    for (const key of keys) {
      console.log(`\n📄 Checking ${key}...`);
      const docRef = doc(db, 'users', user.uid, 'data', key);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`✅ Found ${key}:`, data);
      } else {
        console.log(`❌ No data found for ${key}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking saved data:', error);
  }

  console.groupEnd();
}

// Make test function available globally for manual testing
if (import.meta.env.DEV) {
  window.testFirebaseWrite = testFirebaseWrite;
  window.debugFirebaseConnection = debugFirebaseConnection;
  window.checkSavedData = checkSavedData;
}

// Auto-run debug on import in development
if (import.meta.env.DEV) {
  // Run after a short delay to ensure auth is ready
  setTimeout(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        debugFirebaseConnection();
        unsubscribe();
      }
    });
  }, 1000);
}
