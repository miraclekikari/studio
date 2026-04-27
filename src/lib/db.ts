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
  getDoc
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
  createdAt: any;
  likes: number;
  views: number;
  format: string;
}

export const saveDocument = async (data: Omit<DocumentData, 'id' | 'createdAt' | 'likes' | 'views'>) => {
  return await addDoc(collection(db, 'documents'), {
    ...data,
    createdAt: serverTimestamp(),
    likes: 0,
    views: 0
  });
};

export const getLatestDocuments = async () => {
  try {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentData));
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
};

export const getProfile = async (userId: string) => {
  const docRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
