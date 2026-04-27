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
  Timestamp,
  arrayUnion,
  arrayRemove
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
  likedBy?: string[];
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
    likedBy: [],
    views: 0
  });
};

export const getDocumentById = async (id: string) => {
  const docRef = doc(db, 'documents', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DocumentData;
  }
  return null;
};

export const incrementDocumentViews = async (id: string) => {
  const docRef = doc(db, 'documents', id);
  await updateDoc(docRef, {
    views: increment(1)
  });
};

export const toggleLikeDocument = async (docId: string, userId: string) => {
  const docRef = doc(db, 'documents', docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  
  const data = docSnap.data() as DocumentData;
  const likedBy = data.likedBy || [];
  const isLiked = likedBy.includes(userId);

  if (isLiked) {
    await updateDoc(docRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    await updateDoc(docRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
};

export const getLatestDocuments = async (count: number = 20) => {
  const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
};

export const getUserDocuments = async (userId: string) => {
  const q = query(collection(db, 'documents'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
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
      fullName: defaultData.fullName || 'Utilisateur',
      avatarUrl: defaultData.avatarUrl || `https://picsum.photos/seed/${uid}/200/200`,
      bio: defaultData.bio || 'Membre de la communauté LibreShare.',
      interests: defaultData.interests || ["Technologie", "Éducation"],
      updatedAt: serverTimestamp(),
      followers: 0,
      following: 0
    };
    await setDoc(docRef, newProfile);
    return newProfile;
  }
};