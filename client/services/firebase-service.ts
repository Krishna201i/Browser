import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { db, auth, storage } from '@/lib/firebase';

export interface BrowserData {
  bookmarks: any[];
  history: any[];
  settings: any;
  downloads: any[];
  mostVisited: any[];
  userPreferences: any;
}

export interface TabData {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  isIncognito?: boolean;
  content: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseService {
  private userId: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      this.userId = user?.uid || null;
      if (user) {
        console.log('User signed in:', user.email);
      } else {
        console.log('User signed out');
      }
    });
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Browser data synchronization
  async syncBrowserData(data: Partial<BrowserData>) {
    if (!this.userId) {
      console.warn('No user ID available for sync');
      return;
    }

    try {
      const userDoc = doc(db, 'users', this.userId);
      const browserData = doc(userDoc, 'browser', 'data');
      
      await setDoc(browserData, {
        ...data,
        lastSync: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('Browser data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  async getBrowserData(): Promise<BrowserData | null> {
    if (!this.userId) {
      console.warn('No user ID available for data retrieval');
      return null;
    }

    try {
      const userDoc = doc(db, 'users', this.userId);
      const browserData = doc(userDoc, 'browser', 'data');
      const docSnap = await getDoc(browserData);

      if (docSnap.exists()) {
        return docSnap.data() as BrowserData;
      }
      return null;
    } catch (error) {
      console.error('Get browser data error:', error);
      throw error;
    }
  }

  // Tab management
  async saveTabs(tabs: TabData[]) {
    if (!this.userId) return;

    try {
      const userDoc = doc(db, 'users', this.userId);
      const tabsCollection = collection(userDoc, 'tabs');
      
      // Clear existing tabs
      const existingTabs = await getDocs(tabsCollection);
      existingTabs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Save new tabs
      for (const tab of tabs) {
        await addDoc(tabsCollection, {
          ...tab,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log('Tabs saved successfully');
    } catch (error) {
      console.error('Save tabs error:', error);
      throw error;
    }
  }

  async getTabs(): Promise<TabData[]> {
    if (!this.userId) return [];

    try {
      const userDoc = doc(db, 'users', this.userId);
      const tabsCollection = collection(userDoc, 'tabs');
      const q = query(tabsCollection, orderBy('position', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as TabData[];
    } catch (error) {
      console.error('Get tabs error:', error);
      throw error;
    }
  }

  // Real-time tab updates
  subscribeToTabs(callback: (tabs: TabData[]) => void) {
    if (!this.userId) return () => {};

    const userDoc = doc(db, 'users', this.userId);
    const tabsCollection = collection(userDoc, 'tabs');
    const q = query(tabsCollection, orderBy('position', 'asc'));

    return onSnapshot(q, (querySnapshot) => {
      const tabs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as TabData[];
      callback(tabs);
    });
  }

  // File upload for downloads
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, `users/${this.userId}/${path}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // User preferences
  async saveUserPreferences(preferences: any) {
    if (!this.userId) return;

    try {
      const userDoc = doc(db, 'users', this.userId);
      await updateDoc(userDoc, {
        preferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Save preferences error:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<any> {
    if (!this.userId) return null;

    try {
      const userDoc = doc(db, 'users', this.userId);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        return docSnap.data().preferences;
      }
      return null;
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  // Analytics and usage data
  async logBrowserEvent(event: string, data: any) {
    if (!this.userId) return;

    try {
      const userDoc = doc(db, 'users', this.userId);
      const eventsCollection = collection(userDoc, 'events');
      
      await addDoc(eventsCollection, {
        event,
        data,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Log event error:', error);
    }
  }
}

export const firebaseService = new FirebaseService();
