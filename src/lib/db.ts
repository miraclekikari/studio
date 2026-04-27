import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  limit,
  Timestamp
} from 'firebase/firestore';

export interface DocumentData {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string;
  category: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Timestamp | any;
  likes: number;
  views: number;
  format: string;
  tags?: string[];
}

export interface UserProfile {
  uid: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  updatedAt: Timestamp | any;
  followers?: number;
  following?: number;
  interests?: string[];
}

export const saveDocument = async (data: Omit<DocumentData, 'id' | 'createdAt' | 'likes' | 'views'>) => {
  return await addDoc(collection(db, 'documents'), {
    ...data,
    createdAt: serverTimestamp(),
    likes: 0,
    views: 0
  });
};

export const getDocumentById = async (id: string) => {
  try {
    const docRef = doc(db, 'documents', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DocumentData;
    }
    return null;
  } catch (error) {
    console.error("Erreur Firestore (getDocumentById):", error);
    return null;
  }
};

export const incrementDocumentViews = async (id: string) => {
  const docRef = doc(db, 'documents', id);
  await updateDoc(docRef, {
    views: increment(1)
  });
};

export const getLatestDocuments = async (count: number = 20) => {
  try {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
  } catch (error) {
    console.error("Erreur Firestore (getLatestDocuments):", error);
    return [];
  }
};

export const getUserDocuments = async (userId: string) => {
  try {
    const q = query(collection(db, 'documents'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
  } catch (error) {
    console.error("Erreur Firestore (getUserDocuments):", error);
    return [];
  }
};

export const getOrCreateProfile = async (uid: string, defaultData: Partial<UserProfile>) => {
  const docRef = doc(db, 'profiles', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    const newProfile: UserProfile = {
      uid,
      username: defaultData.username || `user_${uid.substring(0, 5)}`,
      fullName: defaultData.fullName || 'Utilisateur LibreShare',
      avatarUrl: defaultData.avatarUrl || `https://picsum.photos/seed/${uid}/200/200`,
      bio: defaultData.bio || 'Passionné de savoir.',
      interests: defaultData.interests || ["Technologie", "Éducation", "Design"],
      updatedAt: serverTimestamp(),
      followers: 0,
      following: 0
    };
    await setDoc(docRef, newProfile);
    return newProfile;
  }
};

export const updateProfile = async (uid: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, 'profiles', uid);
  return await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};
